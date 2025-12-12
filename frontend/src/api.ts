import type { EventListItem, EventDetailsResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

async function handle<T>(res: Response, fallbackMsg: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || fallbackMsg);
  }
  return res.json();
}

export function fetchEvents() {
  return fetch(`${API_BASE}/events`).then((r) =>
    handle<EventListItem[]>(r, "Не вдалося завантажити список подій")
  );
}

export function fetchEventById(id: number) {
  return fetch(`${API_BASE}/events/${id}`).then((r) =>
    handle<EventDetailsResponse>(r, "Не вдалося завантажити подію")
  );
}