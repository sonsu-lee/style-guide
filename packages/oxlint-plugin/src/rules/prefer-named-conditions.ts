import type { ESTree, Rule } from '@oxlint/plugins';

type Condition = ESTree.LogicalExpression & { operator: '&&' | '||' };
type LeafKind = 'jsx' | 'named' | 'unnamed' | 'inlineCallback';

const preserveOrder =
  ' Keep short-circuit order: extract to a function when the right side must not run early.';

export const preferNamedConditions: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest naming checks in complex inline conditions',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/prefer-named-conditions.md',
    },
    messages: {
      unnamedConditions: `This condition combines {{count}} unnamed checks. Name the checks that carry a business meaning.${preserveOrder}`,
      mixedOperators: `This condition mixes && and || around unnamed checks. Name the grouped check.${preserveOrder}`,
      inlineCallback: `This condition combines an inline callback with another check. Name each check.${preserveOrder}`,
    },
    schema: [],
  },
  createOnce(context) {
    return {
      LogicalExpression(node) {
        // 1. Start only at the root of an inline condition, never at each nested operator.
        if (!isCondition(node) || isCondition(node.parent) || isNamedCondition(node)) return;

        let leafCount = 0;
        let unnamedCount = 0;
        let hasMixedOperators = false;
        let hasInlineCallback = false;
        const pending: ESTree.Expression[] = [node];

        // 2. Visit leaves left to right and stop at the highest-priority diagnostic.
        for (let current = pending.pop(); current !== undefined; current = pending.pop()) {
          if (isCondition(current)) {
            if (current.operator !== node.operator) hasMixedOperators = true;
            pending.push(current.right, current.left);
            continue;
          }
          const kind = leafKind(current);
          if (kind === 'jsx') continue;
          leafCount++;
          if (kind === 'inlineCallback') hasInlineCallback = true;
          if (kind !== 'named') {
            unnamedCount++;
            if (unnamedCount === 3) {
              context.report({
                node,
                messageId: 'unnamedConditions',
                data: { count: unnamedCount },
              });
              return;
            }
          }
        }

        // 3. A mixed condition takes priority over a check combined with an inline callback.
        if (hasMixedOperators && unnamedCount > 0) {
          context.report({ node, messageId: 'mixedOperators' });
        } else if (hasInlineCallback && leafCount >= 2) {
          context.report({ node, messageId: 'inlineCallback' });
        }
      },
    };
  },
};

function isCondition(node: ESTree.Node): node is Condition {
  return node.type === 'LogicalExpression' && node.operator !== '??';
}

function isNamedCondition(node: Condition): boolean {
  const { parent } = node;
  if (parent.type === 'VariableDeclarator') return parent.init === node;
  if (parent.type === 'ArrowFunctionExpression') {
    return parent.body === node && isNamedFunction(parent);
  }
  if (parent.type === 'ReturnStatement') {
    const block = parent.parent;
    return (
      block.type === 'BlockStatement' && block.body.length === 1 && isNamedFunction(block.parent)
    );
  }
  return false;
}

function isNamedFunction(node: ESTree.Node): boolean {
  if (node.type === 'FunctionDeclaration') return node.id !== null;
  if (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') return false;

  const { parent } = node;
  switch (parent.type) {
    case 'VariableDeclarator':
      return parent.init === node;
    case 'Property':
    case 'PropertyDefinition':
    case 'MethodDefinition':
      return parent.value === node && !parent.computed;
    default:
      return false;
  }
}

function leafKind(node: ESTree.Expression): LeafKind {
  let current = node;
  while (current.type === 'UnaryExpression' && current.operator === '!') {
    current = current.argument;
  }
  current = withoutChain(current);
  switch (current.type) {
    case 'JSXElement':
    case 'JSXFragment':
      return 'jsx';
    case 'Identifier':
    case 'Literal':
      return 'named';
    case 'CallExpression':
      for (const argument of current.arguments) {
        if (argument.type === 'ArrowFunctionExpression' || argument.type === 'FunctionExpression') {
          return 'inlineCallback';
        }
      }
      return 'named';
    case 'MemberExpression':
      while (current.type === 'MemberExpression') {
        if (current.computed) return 'unnamed';
        current = withoutChain(current.object);
      }
      return 'named';
    default:
      return 'unnamed';
  }
}

function withoutChain(node: ESTree.Expression): ESTree.Expression {
  if (node.type === 'ChainExpression') return node.expression;
  return node;
}
