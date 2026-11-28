import type { ESTree, Rule } from '@oxlint/plugins';

import { importedName, importSpecifierName } from '../utils/imported-name.ts';
import { isSetupResult } from '../utils/machine-setup.ts';

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
        // 1. Resolve the callee to an XState factory without accepting shadowed names.
        //    A `setup()` result is a factory too, so `machineSetup.createMachine()` counts;
        //    an inline `setup({...})` call is reported on its own visit.
        const { callee } = node;
        let factoryCall = false;
        if (callee.type === 'Identifier') {
          if (!factoryNames.has(callee.name)) return;
          factoryCall = isFactory(importedName(context, callee, 'xstate'));
        } else {
          if (callee.type !== 'MemberExpression' || callee.computed) return;
          const { object, property } = callee;
          if (property.type !== 'Identifier' || !isFactory(property.name)) return;
          if (object.type === 'Identifier' && namespaceNames.has(object.name)) {
            factoryCall = isFactory(importedName(context, callee, 'xstate'));
          } else if (object.type === 'Identifier' && property.name === 'createMachine') {
            factoryCall = isSetupResult(context, object);
          }
        }
        if (!factoryCall) return;

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

            context.report({ node, messageId: 'machineInRender' });
            return;
          }
          current = current.parent;
        }
      },
    };
  },
};
