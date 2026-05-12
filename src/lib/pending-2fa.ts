const pending2FA = new Map<string, { adminId: string; expiresAt: Date }>();

setInterval(() => {
  const now = new Date();
  for (const [key, val] of pending2FA) {
    if (val.expiresAt < now) pending2FA.delete(key);
  }
}, 60000);

export function setPending2FA(sessionToken: string, adminId: string) {
  pending2FA.set(sessionToken, {
    adminId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
}

export function getPending2FA(sessionToken: string) {
  const pending = pending2FA.get(sessionToken);
  if (!pending || pending.expiresAt < new Date()) {
    pending2FA.delete(sessionToken);
    return null;
  }
  return pending;
}

export function deletePending2FA(sessionToken: string) {
  pending2FA.delete(sessionToken);
}