import type { ESTree, Rule } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

export const noMachineInRender: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow creating XState machines and actors during React render',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/no-machine-in-render.md',
    },
    messages: {
      machineInRender:
        'Move machine or actor creation out of render. Define the machine at module scope and pass changing values as input.',
    },
    schema: [],
  },
  createOnce(context) {
    let importsXState = false;
    return {
      Program(node) {
        importsXState = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' && statement.source.value === 'xstate',
        );
      },
      CallExpression(node) {
        if (!importsXState) return;
        const { callee } = node;
        if (callee.type !== 'Identifier') {
          if (
            callee.type !== 'MemberExpression' ||
            callee.computed ||
            callee.property.type !== 'Identifier'
          )
            return;
          const name = callee.property.name;
          if (name !== 'createMachine' && name !== 'setup' && name !== 'createActor') return;
        }

        // 1. The nearest function decides whether the call runs during render or in a callback.
        let current: ESTree.Node = node.parent;
        while (current.type !== 'Program') {
          if (
            current.type === 'FunctionDeclaration' ||
            current.type === 'FunctionExpression' ||
            current.type === 'ArrowFunctionExpression'
          ) {
            let name: string | undefined;
            if (current.type === 'FunctionDeclaration') name = current.id?.name;
            else if (
              current.parent.type === 'VariableDeclarator' &&
              current.parent.id.type === 'Identifier'
            )
              name = current.parent.id.name;
            if (name === undefined || !/^(?:[A-Z]|use[A-Z0-9])/u.test(name)) return;

            // 2. Resolve the binding only for calls inside a component or hook.
            const imported = importedName(context, callee, 'xstate');
            if (
              imported === 'createMachine' ||
              imported === 'setup' ||
              imported === 'createActor'
            ) {
              context.report({ node, messageId: 'machineInRender' });
            }
            return;
          }
          current = current.parent;
        }
      },
    };
  },
};
