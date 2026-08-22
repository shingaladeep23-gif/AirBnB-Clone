import { NextResponse } from "next/server";
import { notFound } from "@/lib/api";
import { repository } from "@/lib/repository";

/**
 * GET /api/reservations/:id — the confirmation payload.
 *
 * The id is a cuid, so it is unguessable in practice; there is no auth in scope
 * for this clone, and pretending otherwise with a fake session check would be
 * worse than saying so plainly.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservation = await repository.findReservation(id);
  if (!reservation) return notFound("No reservation with that id.");
  return NextResponse.json({ reservation });
}
