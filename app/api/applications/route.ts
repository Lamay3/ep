import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { parseApplication } from "@/lib/form";
import { saveApplication, type Application } from "@/lib/store";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 }); }

  // câmp-capcană pentru boți: oamenii nu-l văd, deci nu-l completează
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ id: randomUUID() });

  const parsed = parseApplication(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const app = {
    ...parsed.data,
    id: randomUUID(),
    role: "Helper",
    status: "pending",
    adminNote: "",
    createdAt: new Date().toISOString(),
  } as unknown as Application;

  try { await saveApplication(app); }
  catch (e) {
    console.error("saveApplication", e);
    return NextResponse.json({ error: "Aplicația nu a putut fi salvată. Încearcă din nou în câteva minute." }, { status: 500 });
  }
  return NextResponse.json({ id: app.id }, { status: 201 });
}
