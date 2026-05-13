# Notas para agentes (Cursor / GitHub)

Este arquivo fica versionado no repositório e serve como lembrete de backlog entre sessões.

## To do

1. **Configurar o Instagram**: preencher `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ACCOUNT_ID` no `.env` na raiz do monorepo (usados pela API, ex.: `GET /api/instagram/media`).
2. **Configurar a página Contato**: na API, definir envio por e‑mail (**Resend**: `CONTACT_RESEND_API_KEY`, `CONTACT_FROM_EMAIL`) e, se aplicável, **Twilio** para SMS/WhatsApp (`TWILIO_*`, `TWILIO_WHATSAPP_FROM`, etc.). Referência das variáveis: `.env.example`.

## Histórico (contexto rápido)

- **2026-05**: Formulário de contato no site (`/contato`) chama `POST /api/contact`; fluxo só mostra sucesso quando pelo menos um canal de entrega está configurado no servidor.
