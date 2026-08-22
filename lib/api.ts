import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/**
 * Shared plumbing for the route handlers.
 *
 * ONE ERROR SHAPE, EVERYWHERE. Every failure — bad JSON, a validation miss, an
 * unknown slug, a date conflict — comes back as `{ error: { code, message } }`
 * with an appropriate status. The client therefore has exactly one branch to
 * write, and a new endpoint cannot invent a new error format for the UI to guess
 * at.
 */

export interface ApiError {
  code: string;
  message: string;
  /** Present on validation failures: which fields, and why. */
  details?: unknown;
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  const error: ApiError = { code, message, ...(details === undefined ? {} : { details }) };
  return NextResponse.json({ error }, { status });
}

export function notFound(message = "Not found") {
  return fail(404, "NOT_FOUND", message);
}

/**
 * Parses and validates a JSON body.
 *
 * Returns a discriminated result rather than throwing, so a handler reads as a
 * straight line: parse, bail on failure, use the typed value. Malformed JSON and
 * a schema miss are deliberately different codes — "you sent something that isn't
 * JSON" and "you sent JSON with the wrong shape" are different bugs to chase.
 */
export async function readJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: fail(400, "INVALID_JSON", "Request body must be valid JSON."),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: fail(
        422,
        "INVALID_INPUT",
        "Some of those details aren't valid.",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      ),
    };
  }

  return { ok: true, data: parsed.data };
}

/** Validates query-string params with the same error shape as a JSON body. */
export function readQuery<T>(
  request: Request,
  schema: ZodType<T>,
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return {
      ok: false,
      response: fail(
        422,
        "INVALID_INPUT",
        "Some of those parameters aren't valid.",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      ),
    };
  }
  return { ok: true, data: parsed.data };
}
