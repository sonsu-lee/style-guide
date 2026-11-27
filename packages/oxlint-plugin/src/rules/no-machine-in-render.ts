import type { ESTree, Rule } from '@oxlint/plugins';

import { importedName, importSpecifierName } from '../utils/imported-name.ts';

function isFactory(name: string | null): boolean {
  return name === 'createMachine' || name === 'setup' || name === 'createActor';
}

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
    const factoryNames = new Set<string>();
    const namespaceNames = new Set<string>();
    return {
      Program(node) {
        factoryNames.clear();
        namespaceNames.clear();
        for (const statement of node.body) {
          if (statement.type !== 'ImportDeclaration' || statement.source.value !== 'xstate')
            continue;
          for (const specifier of statement.specifiers) {
            if (specifier.type !== 'ImportSpecifier') {
              namespaceNames.add(specifier.local.name);
            } else if (isFactory(importSpecifierName(specifier))) {
              factoryNames.add(specifier.local.name);
            }
          }
        }
      },
      CallExpression(node) {
        // 1. Only walk ancestors for local names that can resolve to an XState factory.
        const { callee } = node;
        if (callee.type === 'Identifier') {
          if (!factoryNames.has(callee.name)) return;
        } else {
          if (callee.type !== 'MemberExpression' || callee.computed) return;
          const { object, property } = callee;
          if (object.type !== 'Identifier' || !namespaceNames.has(object.name)) return;
          if (property.type !== 'Identifier' || !isFactory(property.name)) return;
        }

        // 2. The nearest function decides whether the call runs during render or in a callback.
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

            // 3. A component or hook can still shadow the imported factory.
            if (isFactory(importedName(context, callee, 'xstate'))) {
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
