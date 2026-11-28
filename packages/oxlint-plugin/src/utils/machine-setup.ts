import type { Context, ESTree, Scope } from '@oxlint/plugins';

import { importedName } from './imported-name.ts';

/** True when `node` calls the `setup` imported from XState. */
function isSetupCall(context: Context, node: ESTree.Node | null): boolean {
  return (
    node?.type === 'CallExpression' && importedName(context, node.callee, 'xstate') === 'setup'
  );
}

/** True when `node` is a setup call or an `.extend()` chain rooted at one. */
export function isSetupExpression(context: Context, node: ESTree.Node | null): boolean {
  return resolvesSetup(context, node, new Set());
}

/** True when `identifier` resolves to a same-file `const` holding a setup. */
export function isSetupResult(context: Context, identifier: ESTree.IdentifierReference): boolean {
  return resolvesSetupBinding(context, identifier, new Set());
}

function resolvesSetupBinding(
  context: Context,
  identifier: ESTree.IdentifierReference,
  seen: Set<ESTree.Node>,
): boolean {
  let scope: Scope | null = context.sourceCode.getScope(identifier);
  while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
  const definition = scope?.set.get(identifier.name)?.defs[0];
  if (definition?.type !== 'Variable' || definition.node.type !== 'VariableDeclarator')
    return false;
  if (definition.node.id.type !== 'Identifier') return false;
  if (definition.parent?.type !== 'VariableDeclaration' || definition.parent.kind !== 'const')
    return false;

  // `extend()` chains resolve through other setup results, so stop on a cycle.
  if (seen.has(definition.node)) return false;
  seen.add(definition.node);
  return resolvesSetup(context, definition.node.init, seen);
}

function resolvesSetup(
  context: Context,
  node: ESTree.Node | null,
  seen: Set<ESTree.Node>,
): boolean {
  if (!node) return false;
  if (isSetupCall(context, node)) return true;
  if (node.type !== 'CallExpression') return false;
  const { callee } = node;
  if (callee.type !== 'MemberExpression' || callee.computed) return false;
  if (callee.property.type !== 'Identifier' || callee.property.name !== 'extend') return false;
  return callee.object.type === 'Identifier'
    ? resolvesSetupBinding(context, callee.object, seen)
    : resolvesSetup(context, callee.object, seen);
}
