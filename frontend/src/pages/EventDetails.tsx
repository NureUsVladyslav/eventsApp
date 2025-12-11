import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEventById } from "../api";
import type { EventDetailsType, Ticket, EventDetailsResponse } from "../types";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventDetailsType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsCount, setTicketsCount] = useState<number>(0);
  const [organizerEvents, setOrganizerEvents] = useState<
    EventDetailsResponse["stats"]["organizerEvents"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchEventById(Number(id))
      .then((data) => {
        setEvent(data.event);
        setTickets(data.tickets);
        setTicketsCount(data.stats.ticketsCount);
        setOrganizerEvents(data.stats.organizerEvents);
      })
      .catch((err) => setError(err.message ?? "Помилка"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>Помилка: {error}</p>;
  if (!event) return <p>Подію не знайдено</p>;

  const freeSeats = event.SeatsTotal - ticketsCount;

  return (
    <div style={{ padding: "20px" }}>
      <p>
        <Link to="/events">&larr; Назад до списку</Link>
      </p>

      <h1>{event.Title}</h1>

      <p>
        <b>Дата:</b> {new Date(event.EventDate).toLocaleString()}
      </p>
      <p>
        <b>Категорія:</b> {event.Category}
      </p>
      <p>
        <b>Базова ціна:</b> {event.BasePrice}
      </p>
      <p>
        <b>Місць всього:</b> {event.SeatsTotal}
      </p>

      <h2>Статистика по події (через функції)</h2>
      <p>
        <b>Продано місць (скалярна функція):</b> {ticketsCount}
      </p>
      <p>
        <b>Вільних місць:</b> {freeSeats >= 0 ? freeSeats : 0}
      </p>

      <p>
        <b>Опис:</b> {event.Description}
      </p>

      <h2>Майданчик</h2>
      <p>
        <b>Назва:</b> {event.VenueName}
      </p>
      <p>
        <b>Адреса:</b> {event.VenueAddress}
      </p>
      <p>
        <b>Вмістимість:</b> {event.VenueCapacity}
      </p>

      <h2>Організатор</h2>
      <p>
        <b>Ім&apos;я:</b> {event.OrganizerName}
      </p>
      <p>
        <b>Email:</b> {event.OrganizerEmail}
      </p>
      <p>
        <b>Телефон:</b> {event.OrganizerPhone}
      </p>

      <h2>Продажі (квитки)</h2>
      {tickets.length === 0 ? (
        <p>Ще немає продажів на цю подію.</p>
      ) : (
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              <th>№ квитка</th>
              <th>Покупець</th>
              <th>Email</th>
              <th>Кількість</th>
              <th>Ціна</th>
              <th>Дата покупки</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.TicketID}>
                <td>{t.TicketNo}</td>
                <td>{t.BuyerName}</td>
                <td>{t.BuyerEmail}</td>
                <td>{t.Quantity}</td>
                <td>{t.Price}</td>
                <td>{new Date(t.PurchaseDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Інші події цього організатора (таблична функція)</h2>
      {organizerEvents.length === 0 ? (
        <p>Інших подій цього організатора немає.</p>
      ) : (
        <ul>
          {organizerEvents
            .filter((e) => e.EventID !== event.EventID)
            .map((e) => (
              <li key={e.EventID}>
                {e.Title} — {new Date(e.EventDate).toLocaleDateString()}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
