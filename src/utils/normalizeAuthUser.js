/**
 * Normalize user payloads from login or GET /user into a single client shape.
 * Role always comes from the server (Spatie / UserResource), never from storage alone.
 */
export function normalizeAuthUser(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const role =
    raw.role ??
    raw.roles?.[0]?.name ??
    (typeof raw.roles?.[0] === "string" ? raw.roles[0] : null);

  if (!role) {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role,
    phone: raw.phone ?? null,
    is_verified: raw.is_verified ?? Boolean(raw.email_verified_at),
  };
}
