import { Link, Outlet } from "react-router-dom";
import { mediaPublicBase } from "../config/mediaPublic";

const navItems = [
  ["Fale Conosco", "/contato"],
  ["Atrativos", "/atrativos"],
  ["Passeios", "/passeios"],
  ["Blog", "/blog"],
];

export function SiteLayout() {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="bg-[#61b979] px-4 py-2 text-center text-xs font-medium text-white">
        +55 62 98250-6891 | contato@guiachapadaveadeiros.com
      </div>
      <header className="sticky top-0 z-40 bg-white/95 shadow-[0_14px_38px_rgba(15,35,48,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-5">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-cerrado-900 md:text-base">
            <img
              src={`${mediaPublicBase}/logo-guia-chapada-veadeiros.png`}
              alt="Guia Chapada Veadeiros Logo"
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-medium text-slate-700 md:flex">
            {navItems.map(([label, href]) => (
              <Link key={href} to={href} className="hover:text-[#df8350]">
                {label}
              </Link>
            ))}
            <Link to="/busca" aria-label="Busca" className="text-lg leading-none hover:text-[#df8350]">
              ⌕
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-14 bg-gradient-to-br from-[#1f2f2b] via-[#263a35] to-[#152420] px-4 text-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 py-14 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <img
              src={`${mediaPublicBase}/parque-nacional.jpg`}
              alt="Chapada dos Veadeiros"
              className="mb-5 h-24 w-32 rounded-2xl object-cover shadow-2xl"
            />
            <h2 className="text-3xl font-semibold leading-none tracking-tight">Guia Chapada Veadeiros</h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Roteiros, cachoeiras, trilhas e experiências com guia local para você planejar melhor sua viagem pela Chapada dos Veadeiros.
            </p>
            <a
              className="mt-4 inline-flex rounded-full bg-[#df8350] px-4 py-3 text-sm font-black text-white"
              href="https://www.instagram.com/guiachapadaveadeiros/"
              rel="noreferrer"
              target="_blank"
            >
              @guiachapadaveadeiros
            </a>
          </div>
          <div>
            <img
              src="/cadastur-guia-chapada-dos-veadeiros.jpg"
              alt="Selo Cadastur Guia Chapada dos Veadeiros"
              className="mx-auto max-h-64 w-auto rounded-xl shadow-2xl md:mx-0"
              loading="lazy"
            />
          </div>
          <nav className="flex flex-col gap-3 text-sm text-white/80" aria-label="Planeje sua viagem">
            <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#df8350]">Planeje sua viagem</h3>
            <Link to="/loja">Passeios e serviços</Link>
            <Link to="/hospedagem-na-chapada-dos-veadeiros">Hospedagem</Link>
            <Link to="/contato">Contato</Link>
            <a href="https://api.whatsapp.com/send?phone=5562982506891&text=*Quero%20planejar%20minha%20viagem%20na%20Chapada*" rel="noreferrer" target="_blank">
              WhatsApp
            </a>
          </nav>
          <div className="text-sm text-white/80">
            <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-[#df8350]">Atendimento</h3>
            <p><strong>WhatsApp:</strong> +55 62 98250-6891</p>
            <p className="mt-3"><strong>E-mail:</strong> contato@guiachapadaveadeiros.com</p>
            <p className="mt-3"><strong>Base:</strong> Chapada dos Veadeiros, Goiás</p>
            <span className="mt-5 inline-flex rounded-full border border-[#df8350]/40 px-3 py-2 text-xs font-bold text-[#f6c4a9]">
              Guia local · Roteiros personalizados · Turismo de natureza
            </span>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
          © Todos os Direitos Reservados - 2026 | CNPJ 24.354.289/0001-05 | Desenvolvido por Diego Marques
        </div>
      </footer>
    </div>
  );
}
