import { ContactForm } from "../components/ContactForm";
import { ContactInfoAside } from "../components/ContactInfoAside";
import { StaticPage } from "./StaticPage";

export function Contact() {
  return (
    <StaticPage
      title="Contato"
      description="Fale com o Guia Chapada dos Veadeiros."
      prose={false}
      articleClassName="mx-auto max-w-[1180px] px-4 py-16"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-stretch lg:gap-12">
        <ContactForm />
        <ContactInfoAside />
      </div>
    </StaticPage>
  );
}
