import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "../api/events";
import type { EventListItem } from "../utils/types";
import { fmtDate, fmtMoney } from "../utils/format";

type SortMode = "dateAsc" | "dateDesc";

export default function EventsList() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortMode>("dateAsc");

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Помилка")
      )
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const uniq = new Set<string>();
    for (const e of events) if (e.Category) uniq.add(e.Category);
    return ["all", ...Array.from(uniq).sort()];
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];

    if (category !== "all") {
      list = list.filter((e) => (e.Category ?? "") === category);
    }

    const t = q.trim().toLowerCase();
    if (t) {
      list = list.filter(
        (e) =>
          e.Title.toLowerCase().includes(t) ||
          e.VenueName.toLowerCase().includes(t) ||
          e.OrganizerName.toLowerCase().includes(t)
      );
    }

    list.sort((a, b) => {
      const da = new Date(a.EventDate).getTime();
      const db = new Date(b.EventDate).getTime();
      return sort === "dateAsc" ? da - db : db - da;
    });

    return list;
  }, [events, q, category, sort]);

  if (loading) return <div className="container">Завантаження подій…</div>;
  if (error) return <div className="container">Помилка: {error}</div>;

  return (
    <div className="container">
      <header>
        <h1 className="pageTitle">Події</h1>
        <p className="subtitle">Знайди подію та відкрий деталі</p>
      </header>

      <div className="toolbar">
        <div className="toolbarGrid">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук: назва / майданчик / організатор…"
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Усі категорії" : c}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            <option value="dateAsc">Дата: спочатку ранні</option>
            <option value="dateDesc">Дата: спочатку пізні</option>
          </select>

          <button
            className="btn btnPrimary"
            onClick={() => {
              setQ("");
              setCategory("all");
              setSort("dateAsc");
            }}
          >
            Скинути
          </button>
        </div>

        <div style={{ marginTop: 10 }} className="muted">
          Показано <b>{filtered.length}</b> із <b>{events.length}</b>
        </div>
      </div>

      <div className="gridCards">
        {filtered.map((e) => (
          <div
            key={e.EventID}
            className="card cardClickable"
            onClick={() => navigate(`/events/${e.EventID}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(k) =>
              k.key === "Enter" && navigate(`/events/${e.EventID}`)
            }
          >
            <div className="cardHeaderRow">
              <h3 className="eventTitle">{e.Title}</h3>
              <div className="muted" style={{ whiteSpace: "nowrap" }}>
                {fmtDate(e.EventDate)}
              </div>
            </div>

            <div className="eventMetaRow">
              <span className="badge badgeAccent">
                <span className="badgeDot" />
                {e.Category ?? "Без категорії"}
              </span>

              <span className="badge">
                <span className="badgeDot" />
                {e.VenueName}
              </span>

              <span className="badge badgeGreen">
                <span className="badgeDot" />
                {e.OrganizerName}
              </span>
            </div>

            <div className="price">{fmtMoney(e.BasePrice)}</div>
            <div className="hint">Натисни, щоб відкрити деталі →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
