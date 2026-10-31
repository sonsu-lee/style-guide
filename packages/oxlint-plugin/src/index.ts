import { eslintCompatPlugin, type Plugin } from "@oxlint/plugins";

// Put each rule in src/rules/<rule-id>.ts and register it here.
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: "@sonsu-lee/oxlint-plugin" },
  rules: {},
});

export default plugin;
