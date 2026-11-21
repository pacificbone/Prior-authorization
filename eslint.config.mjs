// Lint is a development aid only. The app, `npm run check`, `npm test` and `npm run build` never load
// ESLint, so the runtime stays zero-dependency. Run `npm ci` once, then `npm run lint`.
import globals from 'globals';
const rules={'no-undef':'error','no-unused-vars':'warn','no-duplicate-imports':'error','no-dupe-keys':'error','no-unreachable':'error'};
export default [
 // .claude/worktrees holds temporary copies of this repository made by coding agents.
 {ignores:['dist/','node_modules/','.wrangler/','coverage/','.claude/']},
 {files:['**/*.{js,mjs}'],languageOptions:{ecmaVersion:'latest',sourceType:'module'},rules},
 {files:['public/**'],languageOptions:{globals:globals.browser}},
 {files:['server/**','scripts/**','tests/**','eslint.config.mjs'],languageOptions:{globals:globals.node}},
 {files:['shared/**'],languageOptions:{globals:{...globals.browser,...globals.node}}},
 // Playwright page.evaluate() callbacks in the browser suite run inside the page.
 {files:['tests/browser/**'],languageOptions:{globals:{...globals.node,...globals.browser}}}
];
