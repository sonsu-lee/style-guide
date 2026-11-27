import type { Context, ESTree, Scope } from '@oxlint/plugins';

export function importSpecifierName({ imported }: ESTree.ImportSpecifier): string {
  if (imported.type === 'Identifier') return imported.name;
  return imported.value;
}

/** Resolves direct named imports and noncomputed members of default or namespace imports. */
export function importedName(
  context: Context,
  callee: ESTree.Expression,
  source: string,
): string | null {
  // 1. Identify the local binding before asking for its lexical scope.
  let binding: Extract<ESTree.Expression, { type: 'Identifier' }>;
  let member: string | null = null;
  if (callee.type === 'Identifier') binding = callee;
  else if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.property.type === 'Identifier'
  ) {
    binding = callee.object;
    member = callee.property.name;
  } else return null;
  // 2. The closest declaration wins, even when it shadows an import.
  let scope: Scope | null = context.sourceCode.getScope(binding);
  while (scope) {
    const variable = scope.set.get(binding.name);
    if (variable) {
      const def = variable.defs[0];
      if (
        def?.type !== 'ImportBinding' ||
        def.parent?.type !== 'ImportDeclaration' ||
        def.parent.source.value !== source
      )
        return null;
      if (def.node.type === 'ImportSpecifier') {
        if (member !== null) return null;
        return importSpecifierName(def.node);
      }
      return member;
    }
    scope = scope.upper;
  }
  return null;
}
