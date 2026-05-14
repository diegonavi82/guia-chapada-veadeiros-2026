function capitalizeSentenceStart(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Data de publicação sempre completa em português (pt-BR):
 * dia da semana, dia, mês por extenso e ano — ex.: "Quarta-feira, 13 de Maio de 2026".
 */
export function formatPublicationDatePt(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const parts = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(d);
    const weekdayRaw = parts.find((p) => p.type === "weekday")?.value ?? "";
    const day = parts.find((p) => p.type === "day")?.value ?? "";
    const monthRaw = parts.find((p) => p.type === "month")?.value ?? "";
    const year = parts.find((p) => p.type === "year")?.value ?? "";
    const monthCap = capitalizeSentenceStart(monthRaw);
    if (!weekdayRaw || !day || !monthCap || !year) return "";
    return `${capitalizeSentenceStart(weekdayRaw)}, ${day} de ${monthCap} de ${year}`;
  } catch {
    return "";
  }
}
