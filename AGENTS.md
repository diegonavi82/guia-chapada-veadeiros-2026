# Notas para agentes (Cursor / GitHub)

Este arquivo fica versionado no repositório e serve como lembrete de backlog entre sessões.

## To do

1. **Configurar o Instagram**
2. **Configurar página Contato**

_Detalhes_: Instagram — variáveis `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ACCOUNT_ID` no `.env` (API: `GET /api/instagram/media`). Contato — `CONTACT_*` / `TWILIO_*` no `.env` da API conforme `.env.example`.

## Lembrete diário no Cursor

Quando há `.cursor/hooks.json` configurado neste repo, ao **criar uma conversa nova** no Composer/Agent, o Cursor dispara um hook **`sessionStart`**. Este projeto usa esse hook para repetir até **uma vez por dia calendário (horário da sua máquina)** o texto da seção **To do** acima no contexto do agente — assim você volta a ver o backlog na primeira vez que abrir uma sessão nova naquele dia.

Estado só local (não vai ao GitHub): arquivo `.cursor/reminder-last-day.txt`.

## Histórico (contexto rápido)

- **2026-05**: Formulário de contato no site (`/contato`) chama `POST /api/contact`; fluxo só mostra sucesso quando pelo menos um canal de entrega está configurado no servidor.
