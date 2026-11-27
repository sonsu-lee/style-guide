import type { ESTree, Rule, Scope } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

function createsCollection(node: ESTree.Node): boolean {
  let current = node;
  while (current.type === 'TSAsExpression' || current.type === 'TSSatisfiesExpression') {
    current = current.expression;
  }
  return current.type === 'ObjectExpression' || current.type === 'ArrayExpression';
}

export const noUnstableActorSelector: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow allocating an object or array in an XState selector without a comparator',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/no-unstable-actor-selector.md',
    },
    messages: {
      unstableSelector:
        'Select fields separately or pass a comparator so an equivalent selector result does not re-render the component.',
    },
    schema: [],
  },
  createOnce(context) {
    let importsXStateReact = false;

    function isActorContextSelector(callee: ESTree.CallExpression['callee']): boolean {
      if (
        callee.type !== 'MemberExpression' ||
        callee.computed ||
        callee.property.type !== 'Identifier' ||
        callee.property.name !== 'useSelector' ||
        callee.object.type !== 'Identifier'
      )
        return false;

      const binding = callee.object;
      let scope: Scope | null = context.sourceCode.getScope(binding);
      while (scope && !scope.set.has(binding.name)) scope = scope.upper;
      const definition = scope?.set.get(binding.name)?.defs[0];
      return (
        definition?.type === 'Variable' &&
        definition.node.type === 'VariableDeclarator' &&
        definition.node.id.type === 'Identifier' &&
        definition.node.init?.type === 'CallExpression' &&
        importedName(context, definition.node.init.callee, '@xstate/react') === 'createActorContext'
      );
    }

    function check(node: ESTree.CallExpression, selector: ESTree.Node, result: ESTree.Node): void {
      // 1. A comparator needs no import or scope lookup.
      const [first, second, third] = node.arguments;

      // 2. The standalone hook and the actor context hook have different argument positions.
      const { callee } = node;
      if (
        (first === selector && second === undefined && isActorContextSelector(callee)) ||
        (second === selector &&
          third === undefined &&
          importedName(context, callee, '@xstate/react') === 'useSelector')
      ) {
        context.report({ node: result, messageId: 'unstableSelector' });
      }
    }

    return {
      Program(node) {
        importsXStateReact = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' && statement.source.value === '@xstate/react',
        );
      },
      CallExpression(node) {
        if (!importsXStateReact) return;
        const [first, second, third] = node.arguments;
        if (second === undefined && first?.type === 'ArrowFunctionExpression' && first.expression) {
          if (createsCollection(first.body)) check(node, first, first.body);
        } else if (second?.type === 'ArrowFunctionExpression' && second.expression) {
          if (third === undefined && createsCollection(second.body))
            check(node, second, second.body);
        }
      },
      ReturnStatement(node) {
        if (!importsXStateReact || node.argument === null || !createsCollection(node.argument))
          return;
        // A nested callback's return is not the selector's return.
        let current: ESTree.Node = node.parent;
        while (
          current.type !== 'FunctionDeclaration' &&
          current.type !== 'Program' &&
          current.type !== 'FunctionExpression' &&
          current.type !== 'ArrowFunctionExpression'
        ) {
          current = current.parent;
        }
        if (
          (current.type === 'FunctionExpression' || current.type === 'ArrowFunctionExpression') &&
          current.parent?.type === 'CallExpression'
        ) {
          check(current.parent, current, node.argument);
        }
      },
    };
  },
};
