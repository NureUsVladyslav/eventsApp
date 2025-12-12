import { API_BASE, handle } from "./base";
import type {
  EventDetailsResponse,
  EventListItem,
  Ticket,
} from "../utils/types";

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

export async function createTicket(
  eventId: number,
  payload: {
    buyerName: string;
    buyerEmail: string;
    quantity: number;
  }
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/events/${eventId}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await handle<{ ticket: Ticket }>(
    res,
    "Не вдалося створити квиток"
  );
  return data.ticket;
}
