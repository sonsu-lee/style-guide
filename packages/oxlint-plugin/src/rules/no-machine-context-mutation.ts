import type { ESTree, Rule, Scope } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

const mutators: Readonly<Record<string, true>> = {
  push: true,
  pop: true,
  shift: true,
  unshift: true,
  splice: true,
  sort: true,
  reverse: true,
  fill: true,
  copyWithin: true,
  set: true,
  add: true,
  delete: true,
  clear: true,
};

export const noMachineContextMutation: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mutating an XState context parameter',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/no-machine-context-mutation.md',
    },
    messages: {
      contextMutation: 'Do not mutate machine context. Use assign and return the new value.',
    },
    schema: [],
  },
  createOnce(context) {
    let importsXState = false;

    function check(node: ESTree.Node, target: ESTree.Node): void {
      if (target.type !== 'MemberExpression') return;

      // 1. Only member writes rooted at the context parameter are candidates.
      let root = target.object;
      while (root.type === 'MemberExpression') root = root.object;
      if (root.type !== 'Identifier' || root.name !== 'context') return;

      // 2. Machine context is a `context` property destructured from the callback parameter.
      //    A whole parameter receives the actor argument object, not machine context.
      let scope: Scope | null = context.sourceCode.getScope(root);
      while (scope && !scope.set.has(root.name)) scope = scope.upper;
      const definition = scope?.set.get(root.name)?.defs[0];
      if (definition?.type !== 'Parameter') return;
      let binding: ESTree.Node = definition.name;
      let parent: ESTree.Node | null = binding.parent;
      let destructuresContext = false;
      while (parent && parent !== definition.node) {
        if (parent.type === 'Property' && parent.value === binding && !parent.computed) {
          destructuresContext =
            parent.key.type === 'Identifier'
              ? parent.key.name === 'context'
              : parent.key.type === 'Literal' && parent.key.value === 'context';
          break;
        }
        binding = parent;
        parent = binding.parent;
      }
      if (!destructuresContext) return;

      // 3. Find the callback's owner without crossing another function or helper call.
      let current = definition.node.parent;
      while (current?.type !== 'CallExpression') {
        switch (current?.type) {
          case 'Property':
          case 'ObjectExpression':
          case 'ArrayExpression':
          case 'TSAsExpression':
          case 'TSSatisfiesExpression':
          case 'TSNonNullExpression':
          case 'TSTypeAssertion':
            current = current.parent;
            break;
          default:
            return;
        }
      }
      const { callee } = current;
      if (
        (callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier' &&
          (callee.property.name === 'createMachine' || callee.property.name === 'provide')) ||
        importedName(context, callee, 'xstate') !== null
      ) {
        context.report({ node, messageId: 'contextMutation' });
      }
    }

    return {
      Program(node) {
        importsXState = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' &&
            (statement.source.value === 'xstate' || statement.source.value === '@xstate/react'),
        );
      },
      AssignmentExpression(node) {
        if (importsXState) check(node, node.left);
      },
      UpdateExpression(node) {
        if (importsXState) check(node, node.argument);
      },
      UnaryExpression(node) {
        if (importsXState && node.operator === 'delete') check(node, node.argument);
      },
      CallExpression(node) {
        if (!importsXState) return;
        const { callee } = node;
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier' &&
          Object.hasOwn(mutators, callee.property.name)
        ) {
          check(node, callee.object);
        }
      },
    };
  },
};
