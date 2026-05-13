import { ContactForm } from "../components/ContactForm";
import { StaticPage } from "./StaticPage";

export function Contact() {
  return (
    <StaticPage title="Contato" description="Fale com o Guia Chapada dos Veadeiros." prose={false}>
      <ContactForm />
    </StaticPage>
  );
}
