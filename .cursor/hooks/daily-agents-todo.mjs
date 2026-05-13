#!/usr/bin/env node
/**
 * Hook sessionStart: injeta uma vez por dia (calendário local) o trecho "## To do" do AGENTS.md
 * como additional_context na primeira nova conversa Agent/Composer do dia neste projeto.
 */

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.env.CURSOR_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();

const statePath = path.join(projectRoot, ".cursor", "reminder-last-day.txt");

function localDateStamp() {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Consome stdin (JSON do Cursor) quando existir pipe; não bloqueia no terminal manual
try {
  if (!process.stdin.isTTY) {
    fs.readFileSync(0, "utf8");
  }
} catch {
  /* sem stdin ou vazio — ok */
}

const today = localDateStamp();
let lastDay = "";
try {
  lastDay = fs.readFileSync(statePath, "utf8").trim();
} catch {
  lastDay = "";
}

if (lastDay === today) {
  process.stdout.write("{}");
  process.exit(0);
}

fs.mkdirSync(path.join(projectRoot, ".cursor"), { recursive: true });
fs.writeFileSync(statePath, `${today}\n`, "utf8");

let snippet = "Abra o arquivo AGENTS.md na raiz deste projeto e veja a seção **To do**.";
try {
  const agentsPath = path.join(projectRoot, "AGENTS.md");
  const agents = fs.readFileSync(agentsPath, "utf8");
  const marker = "## To do";
  const i = agents.indexOf(marker);
  if (i >= 0) {
    let rest = agents.slice(i);
    const next = rest.indexOf("\n## ", marker.length + 3);
    if (next > 0) {
      rest = rest.slice(0, next + 1);
    }
    snippet = rest.trim();
    if (snippet.length > 3200) {
      snippet = `${snippet.slice(0, 3197)}...`;
    }
  }
} catch {
  /* mantém snippet padrão */
}

const reminder = [
  "---",
  "**Lembrete diário deste projeto** (primeira sessão Composer/Agent hoje nesta máquina)",
  "---",
  "",
  snippet,
  "",
].join("\n");

process.stdout.write(
  JSON.stringify({
    additional_context: reminder,
  })
);
