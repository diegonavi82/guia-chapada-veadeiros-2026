import { type FormEvent, useState } from "react";
import { apiPostContact } from "../services/api";

const tipoOptions = [
  { value: "elogio", label: "Elogio" },
  { value: "reclamacao", label: "Reclamação" },
  { value: "duvida", label: "Dúvida ou pergunta" },
  { value: "orcamento", label: "Orçamento ou reserva" },
  { value: "outro", label: "Outro" },
] as const;

type TipoValue = (typeof tipoOptions)[number]["value"];

export type ContactNotifyResponse = {
  ok: true;
  notified: { email: boolean; sms: boolean; whatsapp: boolean };
};

const INITIAL_TIPO: TipoValue = "orcamento";

export function ContactForm() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoValue>(INITIAL_TIPO);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function limpar() {
    setNome("");
    setTipo(INITIAL_TIPO);
    setEmail("");
    setTelefone("");
    setMensagem("");
    setError(null);
    setSent(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiPostContact<
        {
          nome: string;
          tipo: TipoValue;
          email?: string;
          telefone?: string;
          mensagem: string;
        },
        ContactNotifyResponse
      >("/contact", {
        nome: nome.trim(),
        tipo,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        mensagem: mensagem.trim(),
      });

      limpar();
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível enviar. Tente de novo.";
      setError(msg);
      setSent(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_50px_rgba(15,35,48,0.08)] md:p-10">
      <h2 className="text-xl font-bold text-cerrado-900">Envie uma mensagem</h2>
      <p className="mt-2 text-sm text-slate-600">
        Preencha os campos e clique em <strong className="text-cerrado-800">Enviar</strong>. A mensagem é entregue
        pela API do site (e-mail para atendimento, SMS e WhatsApp quando configurados no servidor — Resend e
        Twilio).
      </p>

      {sent ? (
        <div
          className="mt-8 rounded-xl border border-cerrado-500/30 bg-cerrado-50 px-6 py-6 text-center"
          role="status"
        >
          <p className="text-lg font-bold text-cerrado-900">Mensagem enviada</p>
          <p className="mt-2 text-base font-semibold text-cerrado-800">Deu certo! Mensagem enviada.</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-700">
            Em breve entraremos em contato. Obrigado pela mensagem!
          </p>
        </div>
      ) : null}

      {!sent ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="contato-nome"
              className="block text-xs font-semibold uppercase tracking-wide text-cerrado-700"
            >
              Nome
            </label>
            <input
              id="contato-nome"
              name="nome"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={nome}
              onChange={(ev) => setNome(ev.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none ring-cerrado-500/40 transition focus:border-cerrado-500 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="contato-tipo"
              className="block text-xs font-semibold uppercase tracking-wide text-cerrado-700"
            >
              Assunto / tipo de contato
            </label>
            <select
              id="contato-tipo"
              name="tipo"
              required
              value={tipo}
              onChange={(ev) => setTipo(ev.target.value as TipoValue)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-cerrado-500/40 transition focus:border-cerrado-500 focus:ring-2"
            >
              {tipoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="contato-email"
                className="block text-xs font-semibold uppercase tracking-wide text-cerrado-700"
              >
                E-mail (opcional)
              </label>
              <input
                id="contato-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none ring-cerrado-500/40 transition focus:border-cerrado-500 focus:ring-2"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="contato-fone"
                className="block text-xs font-semibold uppercase tracking-wide text-cerrado-700"
              >
                WhatsApp ou telefone (opcional)
              </label>
              <input
                id="contato-fone"
                name="telefone"
                type="tel"
                autoComplete="tel"
                value={telefone}
                onChange={(ev) => setTelefone(ev.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none ring-cerrado-500/40 transition focus:border-cerrado-500 focus:ring-2"
                placeholder="(62) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contato-msg"
              className="block text-xs font-semibold uppercase tracking-wide text-cerrado-700"
            >
              Mensagem
            </label>
            <textarea
              id="contato-msg"
              name="mensagem"
              required
              rows={6}
              minLength={10}
              maxLength={4000}
              value={mensagem}
              onChange={(ev) => setMensagem(ev.target.value)}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none ring-cerrado-500/40 transition focus:border-cerrado-500 focus:ring-2"
              placeholder="Conte como podemos ajudar..."
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg bg-cerrado-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cerrado-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
            <button
              type="button"
              onClick={limpar}
              className="inline-flex justify-center rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Limpar
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={limpar}
            className="inline-flex justify-center rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
