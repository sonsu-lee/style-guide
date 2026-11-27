import type { ESTree, Rule, Scope } from '@oxlint/plugins';

import { importedName } from '../utils/imported-name.ts';

type Property = Extract<ESTree.Node, { type: 'Property' }>;

function propertyName(property: Property): string | null {
  if (property.computed) return null;
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
    return property.key.value;
  }
  return null;
}

function machineCall(invoke: Property): ESTree.CallExpression | null {
  let config: ESTree.Node | null = invoke.parent;
  while (config?.type === 'ObjectExpression') {
    const parent: ESTree.Node | null = config.parent;
    if (parent?.type === 'CallExpression' && parent.arguments[0] === config) return parent;

    // Each nested state must be the value of a property in its parent's `states` map.
    if (parent?.type !== 'Property' || parent.value !== config) return null;
    const stateMap: ESTree.Node | null = parent.parent;
    if (stateMap?.type !== 'ObjectExpression') return null;
    const states: ESTree.Node | null = stateMap.parent;
    if (states?.type !== 'Property') return null;
    if (states.value !== stateMap || propertyName(states) !== 'states') return null;
    config = states.parent;
  }
  return null;
}

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

    function isMachineFactory(callee: ESTree.CallExpression['callee']): boolean {
      if (importedName(context, callee, 'xstate') === 'createMachine') return true;
      if (callee.type !== 'MemberExpression' || callee.computed) return false;
      if (callee.property.type !== 'Identifier' || callee.property.name !== 'createMachine')
        return false;

      let receiver: ESTree.Node | null | undefined = callee.object;
      if (receiver.type === 'Identifier') {
        const { name } = receiver;
        let scope: Scope | null = context.sourceCode.getScope(receiver);
        while (scope && !scope.set.has(name)) scope = scope.upper;
        const definition = scope?.set.get(name)?.defs[0];
        if (definition?.type !== 'Variable' || definition.node.type !== 'VariableDeclarator')
          return false;
        if (definition.node.id.type !== 'Identifier') return false;
        if (definition.parent?.type !== 'VariableDeclaration' || definition.parent.kind !== 'const')
          return false;
        receiver = definition.node.init;
      }
      return (
        receiver?.type === 'CallExpression' &&
        importedName(context, receiver.callee, 'xstate') === 'setup'
      );
    }

    function check(node: ESTree.Node, invoke: Property): void {
      if (node.type !== 'ObjectExpression') return;

      // 1. Check the invoke entry before looking for its containing machine.
      let hasSrc = false;
      let hasOnDone = false;
      for (const property of node.properties) {
        if (property.type !== 'Property') continue;
        const name = propertyName(property);
        if (name === 'onError') return;
        if (name === 'onDone') hasOnDone = true;
        if (name === 'src') hasSrc = true;
      }
      if (!hasSrc || !hasOnDone) return;

      // 2. Prove that this entry belongs to the root config or a nested state.
      const call = machineCall(invoke);
      if (call && isMachineFactory(call.callee))
        context.report({ node, messageId: 'missingOnError' });
    }

    return {
      Program(node) {
        importsXState = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' && statement.source.value === 'xstate',
        );
      },
      Property(node) {
        if (!importsXState || propertyName(node) !== 'invoke') return;
        const { value } = node;
        if (value.type !== 'ArrayExpression') {
          check(value, node);
          return;
        }
        for (const element of value.elements) {
          if (element) check(element, node);
        }
      },
    };
  },
};
