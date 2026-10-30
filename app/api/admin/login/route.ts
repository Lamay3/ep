import { NextResponse } from "next/server";
import { checkLogin, COOKIE, cookieOptions, makeToken, accounts, accountsProblem } from "@/lib/auth";

const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rec = attempts.get(ip);
  if (rec && rec.until > Date.now() && rec.n >= 6)
    return NextResponse.json({ error: "Prea multe încercări. Așteaptă câteva minute și reîncearcă." }, { status: 429 });

  if (accounts().length === 0) {
    const why = {
      missing: "Variabila ADMIN_USERS nu există la runtime. Verifică că e salvată (scope: Functions/Runtime, context: Production) și fă un deploy nou după ce o adaugi.",
      invalid: "ADMIN_USERS nu este JSON valid. Lipește-l pe un singur rând, exact ca în .env.example.",
      empty: "ADMIN_USERS nu conține niciun cont valid (fiecare cont are nevoie de username și password).",
    }[accountsProblem() ?? "missing"];
    return NextResponse.json({ error: `Nu există conturi configurate. ${why}` }, { status: 500 });
  }

  const { username, password } = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  let user = null;
  try { user = checkLogin(String(username ?? ""), String(password ?? "")); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }

  if (!user) {
    attempts.set(ip, { n: (rec && rec.until > Date.now() ? rec.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Username sau parolă incorectă." }, { status: 401 });
  }
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(user), cookieOptions);
  return res;
}
