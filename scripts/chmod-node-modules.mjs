/**
 * Em Linux/macOS, tenta restaurar permissão de execução em .bin e no binário do esbuild.
 * Ajuda hosts onde umask ou cópia por deploy remove o +x. No Windows não faz nada.
 */
import { chmodSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform === "win32") process.exit(0);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function addExecBit(path) {
  try {
    const st = statSync(path);
    chmodSync(path, st.mode | 0o111);
  } catch {
    /* ignore */
  }
}

const binDir = join(root, "node_modules", ".bin");
if (existsSync(binDir)) {
  for (const name of readdirSync(binDir)) {
    addExecBit(join(binDir, name));
  }
}

const esbuildBin = join(root, "node_modules", "esbuild", "bin", "esbuild");
addExecBit(esbuildBin);
