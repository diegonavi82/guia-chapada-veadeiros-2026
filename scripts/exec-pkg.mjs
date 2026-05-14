/**
 * Executa um arquivo .js de uma dependência instalada na raiz (ex.: typescript/lib/tsc.js)
 * via `node`, sem depender de wrappers em node_modules/.bin (útil quando o bit +x
 * não existe ou o host bloqueia exec, ex.: alguns ambientes compartilhados).
 *
 * Uso: node scripts/exec-pkg.mjs <pacote/relative/path.js> [...args]
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));

const spec = process.argv[2];
const args = process.argv.slice(3);
if (!spec) {
  console.error('Uso: node scripts/exec-pkg.mjs <pacote/relativo.js> [args...]');
  process.exit(1);
}

const slash = spec.indexOf("/");
const entry =
  slash === -1
    ? require.resolve(spec)
    : join(dirname(require.resolve(`${spec.slice(0, slash)}/package.json`)), spec.slice(slash + 1));

const result = spawnSync(process.execPath, [entry, ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
});
process.exit(result.status === null ? 1 : result.status);
