import type { Rule } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

export const preferMachineSetup: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer XState setup().createMachine() over a bare createMachine() call',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/prefer-machine-setup.md',
    },
    messages: {
      bareCreateMachine:
        'Use setup({...}).createMachine({...}) to declare implementation names and types together.',
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
        if (
          callee.type === 'MemberExpression' &&
          (callee.computed ||
            callee.property.type !== 'Identifier' ||
            callee.property.name !== 'createMachine')
        )
          return;
        if (importedName(context, callee, 'xstate') === 'createMachine') {
          context.report({ node, messageId: 'bareCreateMachine' });
        }
      },
    };
  },
};
