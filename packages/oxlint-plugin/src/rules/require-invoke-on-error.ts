import type { ESTree, Rule } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

export const requireInvokeOnError: Rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require a failure transition when an XState invoke handles success',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/require-invoke-on-error.md',
    },
    messages: {
      missingOnError:
        'Add an onError transition so the machine can leave this state if the invoked actor fails.',
    },
    schema: [],
  },
  createOnce(context) {
    let importsXState = false;

    function check(node: ESTree.Node): void {
      if (node.type !== 'ObjectExpression') return;

      // 1. Check the invoke entry before looking for its containing machine.
      let hasSrc = false;
      let hasOnDone = false;
      for (const property of node.properties) {
        if (property.type !== 'Property' || property.computed) continue;
        let name: unknown;
        if (property.key.type === 'Identifier') name = property.key.name;
        else if (property.key.type === 'Literal') name = property.key.value;
        if (name === 'onError') return;
        if (name === 'onDone') hasOnDone = true;
        if (name === 'src') hasSrc = true;
      }
      if (!hasSrc || !hasOnDone) return;

      // 2. Match inline config entries, not objects in a machine's callbacks.
      let current = node.parent;
      while (
        current.type === 'Property' ||
        current.type === 'ObjectExpression' ||
        current.type === 'ArrayExpression'
      ) {
        current = current.parent;
      }
      if (current.type !== 'CallExpression') return;
      const { callee } = current;
      if (
        (callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'createMachine') ||
        importedName(context, callee, 'xstate') === 'createMachine'
      ) {
        context.report({ node, messageId: 'missingOnError' });
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
      Property(node) {
        if (!importsXState || node.computed) return;
        const { key, value } = node;
        if (
          !(key.type === 'Identifier' && key.name === 'invoke') &&
          !(key.type === 'Literal' && key.value === 'invoke')
        )
          return;
        if (value.type !== 'ArrayExpression') {
          check(value);
          return;
        }
        for (const element of value.elements) {
          if (element) check(element);
        }
      },
    };
  },
};
