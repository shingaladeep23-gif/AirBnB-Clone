import { z } from "zod";
import { isIsoDate } from "./dates";

/**
 * Request schemas.
 *
 * Kept in one module so the shapes the API accepts are readable in a single
 * screen, and so the client can import the same schema it is validated against
 * rather than duplicating the rules and letting them drift.
 *
 * NOTE WHAT IS ABSENT: no request carries a price. The client sends dates and a
 * guest count; the server answers with the money. There is deliberately no
 * `total` field for an attacker to tamper with — see `lib/pricing.ts`.
 */

export const isoDate = z
  .string()
  .refine(isIsoDate, { message: "Expected a calendar date as YYYY-MM-DD." });

export const availabilityQuery = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
});

export const stayInput = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1).max(16),
});

export const reservationInput = stayInput.extend({
  slug: z.string().min(1),
});

export type StayInput = z.infer<typeof stayInput>;
export type ReservationInput = z.infer<typeof reservationInput>;
