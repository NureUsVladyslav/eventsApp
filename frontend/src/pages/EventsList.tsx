import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "../api";
import type { EventListItem } from "../types";

export default function EventsList() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents()
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message ?? "Помилка"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Завантаження подій...</p>;
  if (error) return <p>Помилка: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Події</h1>

      {events.length === 0 ? (
        <p>Подій поки немає.</p>
      ) : (
        <table border={1} cellPadding={8} cellSpacing={0}>
          <thead>
            <tr>
              <th>Назва</th>
              <th>Дата</th>
              <th>Категорія</th>
              <th>Ціна</th>
              <th>Майданчик</th>
              <th>Організатор</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.EventID}>
                <td>{e.Title}</td>
                <td>{new Date(e.EventDate).toLocaleString()}</td>
                <td>{e.Category}</td>
                <td>{e.BasePrice}</td>
                <td>{e.VenueName}</td>
                <td>{e.OrganizerName}</td>
                <td>
                  <button onClick={() => navigate(`/events/${e.EventID}`)}>
                    Детальніше
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
