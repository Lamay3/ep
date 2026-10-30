export interface Account { username: string; password: string; displayName: string }
export type AccountsProblem = "missing" | "invalid" | "empty";

/** Acceptă JSON curat, dar și valori cu ghilimele în plus (apar la import .env sau la copy-paste). */
function parseLoose(raw: string): unknown {
  const s = raw.trim();
  const strip = (q: string) => (s.length > 1 && s[0] === q && s[s.length - 1] === q ? s.slice(1, -1).trim() : null);
  const candidates = [s, strip("'"), strip('"')].filter((c): c is string => c !== null);
  for (const c of candidates) {
    try {
      let v: unknown = JSON.parse(c);
      if (typeof v === "string") v = JSON.parse(v); // valoare „dublu-codată”
      if (v && typeof v === "object") return v;
    } catch { /* încearcă următoarea variantă */ }
  }
  throw new Error("invalid");
}

const isAccount = (a: unknown): a is { username: string; password: string; displayName?: string } =>
  !!a && typeof a === "object" &&
  typeof (a as Account).username === "string" && (a as Account).username.trim() !== "" &&
  typeof (a as Account).password === "string" && (a as Account).password !== "";

export function readAccounts(raw: string | undefined): { list: Account[]; problem: AccountsProblem | null } {
  if (!raw || !raw.trim()) return { list: [], problem: "missing" };
  let parsed: unknown;
  try { parsed = parseLoose(raw); } catch { return { list: [], problem: "invalid" }; }
  const list = (Array.isArray(parsed) ? parsed : [parsed]).filter(isAccount).map((a) => ({
    username: a.username.trim(), password: a.password, displayName: a.displayName?.trim() || a.username.trim(),
  }));
  return { list, problem: list.length ? null : "empty" };
}
