export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

export async function handle<T>(
  res: Response,
  fallbackMsg: string
): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || fallbackMsg);
  }
  return res.json();
}
