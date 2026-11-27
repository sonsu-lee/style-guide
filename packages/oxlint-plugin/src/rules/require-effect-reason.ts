import type { ESTree, Rule } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

function isEffectHook(name: string | null): boolean {
  return name === 'useEffect' || name === 'useLayoutEffect' || name === 'useInsertionEffect';
}

export const requireEffectReason: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a reason comment for React Effects',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/require-effect-reason.md',
    },
    messages: {
      missingReason:
        'Effects synchronize a component with a system outside React. Compute derived values during render and run event logic in the handler. If this Effect synchronizes with an external system, say which one in a comment directly above it: // effect: <what it keeps in sync and why>.',
    },
    schema: [],
  },
  createOnce(context) {
    let effectAliases: Set<string> | undefined;

    return {
      Program(node) {
        // 1. Collect aliases before any calls, including calls above their import declarations.
        effectAliases = undefined;
        for (const statement of node.body) {
          if (statement.type !== 'ImportDeclaration' || statement.source.value !== 'react')
            continue;
          for (const specifier of statement.specifiers) {
            if (specifier.type !== 'ImportSpecifier' || specifier.imported.type !== 'Identifier')
              continue;
            const { name } = specifier.imported;
            if (name !== specifier.local.name && isEffectHook(name)) {
              (effectAliases ??= new Set()).add(specifier.local.name);
            }
          }
        }
      },
      CallExpression(node) {
        // 2. Filter by spelling before resolving the binding in its lexical scope.
        const { callee } = node;
        if (callee.type === 'Identifier') {
          if (!isEffectHook(callee.name) && effectAliases?.has(callee.name) !== true) return;
        } else {
          if (callee.type !== 'MemberExpression' || callee.computed) return;
          if (callee.property.type !== 'Identifier' || !isEffectHook(callee.property.name)) return;
        }
        if (!isEffectHook(importedName(context, callee, 'react'))) return;

        // 3. Read comments attached to the enclosing statement, not an inner expression.
        let statement: ESTree.Node = node;
        while (statement.parent) {
          const parent: ESTree.Node = statement.parent;
          if (parent.type === 'BlockStatement' || parent.type === 'Program') break;
          statement = parent;
        }
        for (const comment of context.sourceCode.getCommentsBefore(statement)) {
          if (/^effect:\s*\S/u.test(comment.value.trim())) return;
        }
        context.report({ node: callee, messageId: 'missingReason' });
      },
    };
  },
};
