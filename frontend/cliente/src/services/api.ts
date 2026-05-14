import type { SiteLocale } from "../i18n/types";
import { SITE_LOCALES } from "../i18n/types";
import i18n from "../i18n/config";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333/api";

function currentSiteLocale(): SiteLocale {
  const lng = i18n.language;
  return SITE_LOCALES.includes(lng as SiteLocale) ? (lng as SiteLocale) : "pt";
}

function acceptLanguageHeader(): string {
  const loc = currentSiteLocale();
  if (loc === "en") {
    return "en-US,en;q=0.9,pt-BR;q=0.6";
  }
  if (loc === "es") {
    return "es-419,es;q=0.9,pt-BR;q=0.5";
  }
  return "pt-BR,pt;q=0.9,en;q=0.3";
}

function appendLocaleQuery(path: string): string {
  if (/[?&]locale=/.test(path)) {
    return path;
  }
  const loc = currentSiteLocale();
  const sep = path.includes("?") ? "&" : "?";

  return `${path}${sep}locale=${loc}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const resolvedPath = appendLocaleQuery(path.startsWith("/") ? path : `/${path}`);
  const response = await fetch(`${apiBaseUrl}${resolvedPath}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": acceptLanguageHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPostContact<TBody extends object, TRes>(path: string, body: TBody): Promise<TRes> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguageHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = `${response.status}`;
    try {
      const errJson: unknown = await response.json();
      if (
        typeof errJson === "object" &&
        errJson !== null &&
        "error" in errJson &&
        (errJson as { error: string }).error === "ValidationError" &&
        "details" in errJson
      ) {
        const fed = (errJson as { details?: { fieldErrors?: Record<string, string[] | undefined> } }).details?.fieldErrors;
        if (fed) {
          const msgs = Object.values(fed).flat();
          const first = msgs.find((msg) => typeof msg === "string" && msg.length > 0);
          if (first) {
            detail = first;
          } else {
            detail = JSON.stringify((errJson as { details?: unknown }).details ?? errJson);
          }
        } else {
          detail = JSON.stringify((errJson as { details?: unknown }).details ?? errJson);
        }
      } else if (
        typeof errJson === "object" &&
        errJson !== null &&
        "message" in errJson &&
        typeof (errJson as { message?: unknown }).message === "string" &&
        (errJson as { message: string }).message.length > 0
      ) {
        detail = (errJson as { message: string }).message;
      } else if (typeof errJson === "object" && errJson !== null && "details" in errJson) {
        detail = JSON.stringify((errJson as { details?: unknown }).details ?? errJson);
      }
    } catch {
      // mantém mensagem padrao
    }
    throw new Error(`Não foi possível enviar: ${detail}.`);
  }

  return response.json() as Promise<TRes>;
}

export type WaitlistPostResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      duplicateEmail?: boolean;
      duplicatePhone?: boolean;
    };

/** Lista de espera do hero — não lança em 409; interpreta JSON da API. */
export async function apiPostWaitlist(body: {
  email?: string;
  phone?: string;
}): Promise<WaitlistPostResult> {
  const response = await fetch(`${apiBaseUrl}/waitlist`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguageHeader(),
    },
    body: JSON.stringify(body),
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  const message =
    typeof data.message === "string" && data.message.length > 0
      ? data.message
      : response.ok
        ? "Cadastro recebido."
        : "Não foi possível enviar agora. Tente novamente.";

  if (response.ok && data.ok === true) {
    return { ok: true, message };
  }

  return {
    ok: false,
    message,
    duplicateEmail: Boolean(data.duplicateEmail),
    duplicatePhone: Boolean(data.duplicatePhone),
  };
}
