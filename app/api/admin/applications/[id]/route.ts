import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { Status } from "@/lib/form";
import { getApplication, saveApplication } from "@/lib/store";

const STATUSES: Status[] = ["pending", "review", "accepted", "rejected"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Sesiunea a expirat. Reconectează-te." }, { status: 401 });
  const { id } = await params;
  const { status, adminNote } = (await req.json().catch(() => ({}))) as { status?: Status; adminNote?: string };
  if (!status || !STATUSES.includes(status)) return NextResponse.json({ error: "Status invalid." }, { status: 400 });
  if (typeof adminNote !== "string" || adminNote.length > 4000) return NextResponse.json({ error: "Nota internă e prea lungă (maxim 4000 de caractere)." }, { status: 400 });

  const app = await getApplication(id);
  if (!app) return NextResponse.json({ error: "Aplicația nu există." }, { status: 404 });
  const application = { ...app, status, adminNote: adminNote.trim() };
  await saveApplication(application);
  return NextResponse.json({ application });
}
