const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333/api";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: "application/json",
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
