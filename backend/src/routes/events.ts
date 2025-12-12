import { Router } from "express";
import { getPool } from "../db";
import sql from "mssql";

const router = Router();

// 1) Список всіх подій з пов'язаними таблицями (Venues, Organizers)
router.get("/", async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        e.EventID,
        e.Title,
        e.EventDate,
        e.Category,
        e.BasePrice,
        v.Name AS VenueName,
        o.Name AS OrganizerName
      FROM Events e
      JOIN Venues v ON e.VenueID = v.VenueID
      JOIN Organizers o ON e.OrganizerID = o.OrganizerID
      ORDER BY e.EventDate
    `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// 2) Докладна інформація по одній події + всі її продажі (Tickets) + виклик функцій
router.get("/:id", async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const pool = await getPool();
    const request = pool.request();
    request.input("EventID", sql.Int, eventId);

    const eventResult = await request.query(`
      SELECT TOP 1
        e.EventID,
        e.Title,
        e.EventDate,
        e.Category,
        e.BasePrice,
        e.SeatsTotal,
        e.Description,
        v.Name       AS VenueName,
        v.Address    AS VenueAddress,
        v.Capacity   AS VenueCapacity,
        o.Name       AS OrganizerName,
        o.Email      AS OrganizerEmail,
        o.Phone      AS OrganizerPhone
      FROM Events e
      JOIN Venues v     ON e.VenueID     = v.VenueID
      JOIN Organizers o ON e.OrganizerID = o.OrganizerID
      WHERE e.EventID = @EventID
    `);

    if (eventResult.recordset.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.recordset[0];

    const ticketsResult = await request.query(`
      SELECT
        TicketID,
        TicketNo,
        BuyerName,
        BuyerEmail,
        Quantity,
        Price,
        PurchaseDate
      FROM Tickets
      WHERE EventID = @EventID
      ORDER BY PurchaseDate DESC
    `);

    const ticketsCountResult = await request.query(`
      SELECT dbo.fn_EventTicketsCount(@EventID) AS TicketsCount;
    `);

    const ticketsCount = ticketsCountResult.recordset[0]?.TicketsCount ?? 0;

    const organizerEventsResult = await request.query(`
      SELECT *
      FROM dbo.fn_EventsByOrganizer(
        (SELECT OrganizerID FROM Events WHERE EventID = @EventID)
      );
    `);

    res.json({
      event,
      tickets: ticketsResult.recordset,
      stats: {
        ticketsCount,
        organizerEvents: organizerEventsResult.recordset,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Додавання нового квитка через stored procedure
router.post("/:id/tickets", async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const { buyerName, buyerEmail, quantity } = req.body;

    if (
      !Number.isInteger(eventId) ||
      eventId < 1 ||
      typeof buyerName !== "string" ||
      typeof buyerEmail !== "string" ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      buyerName.trim().length === 0 ||
      buyerEmail.trim().length === 0
    ) {
      return res.status(400).json({ error: "Некоректні дані" });
    }

    const pool = await getPool();
    const request = pool.request();

    request.input("EventID", sql.Int, eventId);
    request.input("BuyerName", sql.NVarChar(150), buyerName.trim());
    request.input("BuyerEmail", sql.NVarChar(150), buyerEmail.trim());
    request.input("Quantity", sql.Int, quantity);

    const result = await request.execute("dbo.sp_AddTicket");
    const newTicketId = result.recordset?.[0]?.NewTicketID;

    const ticketSelect = await pool
      .request()
      .input("TicketID", sql.Int, newTicketId).query(`
        SELECT TicketID, TicketNo, BuyerName, BuyerEmail, Quantity, Price, PurchaseDate
        FROM Tickets
        WHERE TicketID = @TicketID
      `);

    res.status(201).json({
      message: "Квиток успішно додано (через процедуру)",
      ticket: ticketSelect.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
