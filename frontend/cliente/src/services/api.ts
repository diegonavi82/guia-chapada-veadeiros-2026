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
