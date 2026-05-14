import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiPostWaitlist } from "../services/api";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WaitlistModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const payload = {
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    try {
      const res = await apiPostWaitlist(payload);
      if (res.ok) {
        setFeedback({ kind: "success", text: res.message });
        setEmail("");
        setPhone("");
      } else {
        setFeedback({ kind: "error", text: res.message });
      }
    } catch {
      setFeedback({
        kind: "error",
        text: "Não foi possível conectar ao servidor. Verifique se a API está no ar.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="presentation">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/82 backdrop-blur-[2px]"
        type="button"
        onClick={onClose}
      />
      <div
        aria-labelledby="gcv-waitlist-title"
        aria-modal="true"
        className="relative z-[1] w-full max-w-md rounded-[1.35rem] bg-white p-6 shadow-2xl shadow-black/45 ring-1 ring-white/12 md:p-8"
        role="dialog"
      >
        <button
          aria-label="Fechar formulário"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          type="button"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="gcv-waitlist-title" className="pr-10 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
          Lista de espera
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Informe seu email e/ou WhatsApp para avisarmos quando as reservas online estiverem abertas.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</span>
            <input
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-inner outline-none ring-[#df8350]/0 transition focus:border-[#df8350]/55 focus:ring-4 focus:ring-[#df8350]/18"
              inputMode="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Telefone / WhatsApp</span>
            <input
              autoComplete="tel"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-inner outline-none ring-[#df8350]/0 transition focus:border-[#df8350]/55 focus:ring-4 focus:ring-[#df8350]/18"
              inputMode="tel"
              name="phone"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(62) 99999 9999"
              type="tel"
              value={phone}
            />
          </label>

          <p className="text-[11px] leading-snug text-slate-500">
            Pelo menos um dos dois campos é obrigatório. Os dados são usados apenas para esse aviso.
          </p>

          {feedback ? (
            <div
              className={
                feedback.kind === "success"
                  ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
                  : "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
              }
              role="status"
            >
              {feedback.text}
            </div>
          ) : null}

          <button
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#e58b55] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-lg shadow-orange-950/25 transition hover:bg-[#d97941] disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Enviando…" : "Confirmar cadastro"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
