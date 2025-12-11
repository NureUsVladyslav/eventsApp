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

// 2) Докладна інформація по одній події + всі її продажі (Tickets)
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

    res.json({
      event: eventResult.recordset[0],
      tickets: ticketsResult.recordset,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
