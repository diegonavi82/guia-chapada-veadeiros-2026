const GOOGLE_MAPS_EMBED =
  'https://maps.google.com/maps?q=-14.1319%2C-47.51&z=12&hl=pt-BR&output=embed';
const GOOGLE_MAPS_EXT = 'https://www.google.com/maps/search/?api=1&query=Alto+Para%C3%ADso+de+Goi%C3%A1s,+Goi%C3%A1s,+Brasil';

export function ContactInfoAside() {
  return (
    <aside className="flex h-full flex-col rounded-[1.75rem] border border-white/40 bg-white/90 p-7 text-[var(--gc-text)] shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--gc-accent)_72%,var(--gc-text))]">
          Atendimento e localização
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[color-mix(in_srgb,var(--gc-text)_82%,white)]">
          O Guia Chapada atende via WhatsApp e também por e-mail. A base é Alto Paraíso de Goiás (Chapada dos Veadeiros).
        </p>
      </div>

      <ul className="mt-7 space-y-5 text-sm text-[color-mix(in_srgb,var(--gc-text)_82%,white)]">
        <li>
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--gc-accent)_72%,var(--gc-text))]">
            Telefone e Whatsapp
          </div>
          <a className="mt-1 inline-block font-semibold text-[var(--gc-forest)] hover:text-[var(--gc-forest-dark)]" href="https://wa.me/5562982506891" rel="noreferrer" target="_blank">
            +55 62 98250-6891
          </a>
        </li>
        <li>
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--gc-accent)_72%,var(--gc-text))]">
            E-mail
          </div>
          <a className="mt-1 inline-block font-semibold text-[var(--gc-forest)] hover:text-[var(--gc-forest-dark)] break-all" href="mailto:contato@guiachapadaveadeiros.com">
            contato@guiachapadaveadeiros.com
          </a>
        </li>
      </ul>

      <div className="mt-7 flex min-h-0 flex-1 flex-col gap-3">
        <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--gc-accent)_72%,var(--gc-text))]">
          Endereço (referência)
        </div>
        <div className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--gc-text)_82%,white)]">
          Alto Paraíso de Goiás, Goiás · Brasil
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--gc-accent)_72%,var(--gc-text))]">
            Mapa
          </div>
          <div className="relative mt-2 min-h-[220px] flex-1 overflow-hidden rounded-[1.05rem] ring-1 ring-black/5">
            <iframe
              allowFullScreen
              className="h-full w-full border-0 pointer-events-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={GOOGLE_MAPS_EMBED}
              title="Mapa - Alto Paraíso de Goiás"
            />
            <a
              aria-label="Abrir mapa em tela inteira"
              className="absolute inset-0 z-10"
              href={GOOGLE_MAPS_EXT}
              rel="noreferrer"
              target="_blank"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
