import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEventById } from "../api/events";
import type { EventDetailsResponse, Ticket } from "../utils/types";
import { fmtDate, fmtMoney } from "../utils/format";
import TicketPurchaseForm from "../components/TicketPurchaseForm";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: EventDetailsResponse };

export default function EventDetails() {
  const { id } = useParams();
  const eventId = Number(id);

  const [ui, setUi] = useState<UiState>(() =>
    Number.isFinite(eventId)
      ? { status: "loading" }
      : { status: "error", message: "Некоректний ID події" }
  );

  useEffect(() => {
    if (!Number.isFinite(eventId)) return;

    let cancelled = false;

    fetchEventById(eventId)
      .then((data) => {
        if (cancelled) return;
        setUi({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Помилка завантаження";
        setUi({ status: "error", message: msg });
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const view = useMemo(() => {
    if (ui.status !== "success") return null;

    const { event, tickets, stats } = ui.data;

    const ticketsCount = stats.ticketsCount;
    const freeSeats = Math.max(0, event.SeatsTotal - ticketsCount);

    const otherOrganizerEvents = stats.organizerEvents
      .filter((e) => e.EventID !== event.EventID)
      .slice()
      .sort(
        (a, b) =>
          new Date(a.EventDate).getTime() - new Date(b.EventDate).getTime()
      );

    return { event, tickets, ticketsCount, freeSeats, otherOrganizerEvents };
  }, [ui]);

  if (ui.status === "loading") {
    return <div className="container">Завантаження…</div>;
  }

  if (ui.status === "error") {
    return (
      <div className="container">
        <header style={{ marginBottom: 14 }}>
          <Link to="/events" className="muted">
            ← Назад до списку
          </Link>
        </header>

        <h2 className="h2">Помилка</h2>
        <div className="card">
          <p style={{ margin: 0 }}>{ui.message}</p>
        </div>
      </div>
    );
  }

  const { event, tickets, ticketsCount, freeSeats, otherOrganizerEvents } =
    view!;
  const canBuy = freeSeats > 0;

  const onTicketCreated = (newTicket: Ticket) => {
    setUi((prev) => {
      if (prev.status !== "success") return prev;

      return {
        status: "success",
        data: {
          ...prev.data,
          tickets: [newTicket, ...prev.data.tickets],
          stats: {
            ...prev.data.stats,
            ticketsCount: prev.data.stats.ticketsCount + newTicket.Quantity,
          },
        },
      };
    });
  };

  return (
    <div className="container">
      <header style={{ marginBottom: 14 }}>
        <Link to="/events" className="muted">
          ← Назад до списку
        </Link>
      </header>

      <div className="card">
        <div className="cardHeaderRow">
          <h1 className="pageTitle" style={{ fontSize: 34, margin: 0 }}>
            {event.Title}
          </h1>
          <span className="badge">
            <span className="badgeDot" />
            {fmtDate(event.EventDate)}
          </span>
        </div>

        <div
          style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <span className="badge badgeAccent">
            <span className="badgeDot" />
            {event.Category ?? "Без категорії"}
          </span>

          <span className="badge">
            <span className="badgeDot" />
            {event.VenueName}
          </span>

          <span className="badge badgeGreen">
            <span className="badgeDot" />
            {event.OrganizerName}
          </span>

          <span className="badge">
            <span className="badgeDot" />
            Базова ціна: {fmtMoney(event.BasePrice)}
          </span>
        </div>

        <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.82)" }}>
          {event.Description ?? "Опис відсутній."}
        </p>
      </div>

      <h2 className="h2">Статистика</h2>
      <div
        className="gridCards"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        <div className="card">
          <div className="muted">Місць всього</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            {event.SeatsTotal}
          </div>
        </div>

        <div className="card">
          <div className="muted">Продано (скалярна функція)</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{ticketsCount}</div>
        </div>

        <div className="card">
          <div className="muted">Вільних місць</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{freeSeats}</div>
        </div>

        <div className="card">
          <div className="muted">Записів Tickets</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{tickets.length}</div>
        </div>
      </div>

      <h2 className="h2">Додати квиток (процедура)</h2>
      <div className="card">
        {!canBuy ? (
          <p className="muted" style={{ margin: 0 }}>
            Немає вільних місць — додати квиток неможливо.
          </p>
        ) : (
          <TicketPurchaseForm
            eventId={eventId}
            defaultPrice={event.BasePrice}
            onCreated={onTicketCreated}
          />
        )}
      </div>

      <h2 className="h2">Продажі (Tickets)</h2>
      <div className="card">
        {tickets.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Ще немає продажів.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>№</th>
                <th>Покупець</th>
                <th>Email</th>
                <th>К-сть</th>
                <th>Ціна</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.TicketID}>
                  <td style={{ fontWeight: 700 }}>{t.TicketNo}</td>
                  <td>{t.BuyerName}</td>
                  <td className="muted2">{t.BuyerEmail}</td>
                  <td>{t.Quantity}</td>
                  <td style={{ fontWeight: 700 }}>{fmtMoney(t.Price)}</td>
                  <td className="muted2">{fmtDate(t.PurchaseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="h2">Інші події цього організатора (таблична функція)</h2>

      {otherOrganizerEvents.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Інших подій немає.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {otherOrganizerEvents.map((e) => (
            <Link
              key={e.EventID}
              to={`/events/${e.EventID}`}
              className="card cardClickable cardCompact"
            >
              <div className="cardHeaderRow">
                <div style={{ fontWeight: 800 }}>{e.Title}</div>
                <div className="muted">
                  {new Date(e.EventDate).toLocaleDateString()}
                </div>
              </div>

              <div className="eventMetaRow">
                <span className="badge badgeAccent">
                  <span className="badgeDot" />
                  {e.Category ?? "Без категорії"}
                </span>

                <span className="badge">
                  <span className="badgeDot" />
                  {fmtMoney(e.BasePrice)}
                </span>

                <span className="badge">
                  <span className="badgeDot" />
                  Seats: {e.SeatsTotal}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
