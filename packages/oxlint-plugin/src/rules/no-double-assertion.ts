import type { ESTree, Rule } from '@oxlint/plugins';

type TypeAssertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion;

export const noDoubleAssertion: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow chaining type assertions, such as `value as unknown as Foo`',
      url: 'https://github.com/sonsu-lee/style-guide/blob/main/packages/oxlint-plugin/docs/rules/no-double-assertion.md',
    },
    messages: {
      doubleAssertion:
        'Do not chain type assertions. Narrow the value with a type guard or parse it at the boundary.',
    },
    schema: [],
  },
  createOnce(context) {
    function check(node: TypeAssertion): void {
      // 1. Check only the outermost assertion, so each chain is reported once.
      if (isTypeAssertion(node.parent)) return;

      // 2. Count the assertions in the chain. `as const` only narrows literals, so it is not counted.
      let assertionCount = 0;
      let current: ESTree.Node = node;
      while (isTypeAssertion(current)) {
        if (!isConstAssertion(current)) assertionCount++;
        current = current.expression;
      }

      if (assertionCount >= 2) {
        context.report({ node, messageId: 'doubleAssertion' });
      }
    }

    return {
      TSAsExpression: check,
      TSTypeAssertion: check,
    };
  },
};

function isTypeAssertion(node: ESTree.Node): node is TypeAssertion {
  return node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion';
}

function isConstAssertion(node: TypeAssertion): boolean {
  const { typeAnnotation } = node;
  return (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  );
}
