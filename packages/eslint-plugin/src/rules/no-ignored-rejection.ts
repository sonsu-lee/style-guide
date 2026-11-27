import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isIntrinsicAnyType, isIntrinsicUnknownType, isThenableType } from 'ts-api-utils';

type MessageIds = 'emptyHandler' | 'discardedFallback';
type Fallback = 'undefined' | 'null';
type Handler = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

function rejectionHandler(
  name: string,
  args: TSESTree.CallExpression['arguments'],
): Handler | null {
  let argument;
  if (name === 'catch') argument = args[0];
  // A spread in the fulfillment slot can move the next argument out of the rejection slot.
  else if (name === 'then' && args[0]?.type !== AST_NODE_TYPES.SpreadElement) argument = args[1];
  else return null;
  if (
    argument?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    argument?.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return argument;
  }
  return null;
}

function constantFallback(expression: TSESTree.Expression | null): Fallback | null {
  if (expression === null) return 'undefined';
  if (expression.type === AST_NODE_TYPES.Identifier && expression.name === 'undefined') {
    return 'undefined';
  }
  if (expression.type === AST_NODE_TYPES.UnaryExpression && expression.operator === 'void') {
    return 'undefined';
  }
  if (expression.type === AST_NODE_TYPES.Literal && expression.value === null) return 'null';
  return null;
}

function classifyHandler(handler: Handler): 'empty' | Fallback | null {
  const { body } = handler;
  if (body.type !== AST_NODE_TYPES.BlockStatement) return constantFallback(body);
  if (body.body.length === 0) return 'empty';
  if (body.body.length === 1 && body.body[0].type === AST_NODE_TYPES.ReturnStatement) {
    return constantFallback(body.body[0].argument);
  }
  return null;
}

function isResultWrapper(
  node: TSESTree.Node,
): node is TSESTree.AwaitExpression | TSESTree.ChainExpression | TSESTree.TSNonNullExpression {
  return (
    node.type === AST_NODE_TYPES.AwaitExpression ||
    node.type === AST_NODE_TYPES.ChainExpression ||
    node.type === AST_NODE_TYPES.TSNonNullExpression
  );
}

function isDiscarded(node: TSESTree.CallExpression): boolean {
  let parent = node.parent;
  while (isResultWrapper(parent)) parent = parent.parent;
  return (
    parent.type === AST_NODE_TYPES.ExpressionStatement ||
    (parent.type === AST_NODE_TYPES.UnaryExpression && parent.operator === 'void')
  );
}

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/sonsu-lee/style-guide/blob/main/packages/eslint-plugin/docs/rules/${name}.md`,
);

export const noIgnoredRejection: TSESLint.RuleModule<MessageIds> = createRule({
  name: 'no-ignored-rejection',
  meta: {
    type: 'problem',
    docs: { description: 'Report rejection handlers that discard failures.' },
    schema: [],
    messages: {
      emptyHandler:
        'This rejection handler does nothing, so the failure is lost. Propagate the error, return a recovery value the caller reads, or report the failure.',
      discardedFallback:
        'This handler replaces the rejection with {{value}} and nothing reads the result, so the failure is lost.',
    },
  },
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      CallExpression(node) {
        const { callee } = node;
        // 1. Only dot calls to `catch` or `then` have the rejection argument this rule checks.
        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.computed ||
          callee.property.type !== AST_NODE_TYPES.Identifier
        )
          return;

        // 2. Inspect only inline functions; references and spread arguments are not resolved.
        const handler = rejectionHandler(callee.property.name, node.arguments);
        if (handler === null) return;

        // 3. An empty body always loses the failure. A fallback can recover when its value is read.
        const fallback = classifyHandler(handler);
        if (fallback === null) return;
        if (fallback !== 'empty' && !isDiscarded(node)) return;

        // 4. Look up types only after the syntax matches. isThenableType checks union members.
        const receiver = services.getTypeAtLocation(callee.object);
        if (isIntrinsicAnyType(receiver) || isIntrinsicUnknownType(receiver)) return;
        const tsNode = services.esTreeNodeToTSNodeMap.get(callee.object);
        if (!isThenableType(checker, tsNode, receiver)) return;

        if (fallback === 'empty') {
          context.report({ node: handler, messageId: 'emptyHandler' });
        } else {
          context.report({
            node: handler,
            messageId: 'discardedFallback',
            data: { value: fallback },
          });
        }
      },
    };
  },
});
