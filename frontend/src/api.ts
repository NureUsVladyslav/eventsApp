import type { EventListItem, EventDetailsType, Ticket } from "./types";

const API_BASE = "http://localhost:4000/api";

export async function fetchEvents(): Promise<EventListItem[]> {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) {
    throw new Error("Не вдалося завантажити список подій");
  }
  return res.json();
}

export async function fetchEventById(
  id: number
): Promise<{ event: EventDetailsType; tickets: Ticket[] }> {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) {
    throw new Error("Не вдалося завантажити подію");
  }
  return res.json();
}
