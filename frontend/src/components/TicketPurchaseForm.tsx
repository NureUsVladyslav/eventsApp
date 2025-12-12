import { useState, type FormEvent } from "react";
import { createTicket } from "../api/events";
import type { Ticket } from "../utils/types";
import { fmtMoney } from "../utils/format";

type Props = {
  eventId: number;
  defaultPrice: number;
  disabled?: boolean;
  onCreated: (ticket: Ticket) => void;
};

export default function TicketPurchaseForm({
  eventId,
  defaultPrice,
  disabled,
  onCreated,
}: Props) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError("Введи імʼя та email.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setError("Кількість має бути ≥ 1.");
      return;
    }

    try {
      setCreating(true);

      const newTicket = await createTicket(eventId, {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        quantity,
      });

      onCreated(newTicket);

      setBuyerName("");
      setBuyerEmail("");
      setQuantity(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка створення квитка");
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <label className="muted2">Імʼя покупця</label>
        <input
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          disabled={disabled || creating}
          placeholder="Напр. Іван Петренко"
        />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label className="muted2">Email покупця</label>
        <input
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          disabled={disabled || creating}
          placeholder="name@email.com"
        />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="muted2">К-сть</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={disabled || creating}
            style={{ width: 120 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label className="muted2">Ціна за квиток</label>
          <input
            value={fmtMoney(defaultPrice)}
            disabled
            style={{ width: 180 }}
          />
        </div>
      </div>

      {error && <div style={{ color: "salmon" }}>{error}</div>}

      <button type="submit" disabled={disabled || creating}>
        {creating ? "Додаю…" : "Додати квиток (процедура)"}
      </button>
    </form>
  );
}
