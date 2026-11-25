export const ADMIN_EMAILS = new Set([
  "jamphy.admin@gmail.com",
  "sharmashreyansh001@gmail.com",
  "sharmashreyans001@gmail.com",
]);

export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
