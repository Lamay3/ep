"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STATUS_LABEL, type Status } from "@/lib/form";
import type { Application } from "@/lib/store";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const date = (iso: string) => new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));

const ANSWERS: [string, keyof Application][] = [
  ["Ocupație și program obișnuit", "occupation"],
  ["Angajament privind imparțialitatea", "impartialityCommitment"],
  ["Cunoașterea regulamentului", "ruleKnowledge"],
  ["De ce este potrivit pentru Helper", "motivation"],
  ["Autodescriere", "selfDescription"],
  ["Istoric sancțiuni și lecții învățate", "sanctions"],
  ["Progres și bunuri în joc", "inGameAssets"],
  ["Reputație în comunitate", "reputationHistory"],
  ["Interacțiuni tensionate cu staff-ul", "staffConflicts"],
  ["Ce ar schimba după obținerea funcției", "improvementPlan"],
  ["Cum înțelege rolul de Helper", "helperResponsibilities"],
  ["Posibilitate de înregistrare video", "recordingSetup"],
  ["Situație practică: abaterea unui prieten", "friendScenario"],
];

export function AdminDashboard({ initialApplications, user }: { initialApplications: Application[]; user: { displayName: string } }) {
  const [apps, setApps] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState<Application | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => (filter === "all" || a.status === filter) &&
      (!q || `${a.fullName} ${a.discord} ${a.characterName} ${a.steamName} ${a.gameId} ${a.role}`.toLowerCase().includes(q)));
  }, [apps, query, filter]);

  const count = (s: Status) => apps.filter((a) => a.status === s).length;

  function show(a: Application) { setOpen(a); setNote(a.adminNote ?? ""); setStatus(a.status); }

  async function save() {
    if (!open) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${open.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, adminNote: note }) });
      const data = await res.json();
      if (res.ok && data.application) {
        setApps((p) => p.map((a) => (a.id === data.application.id ? data.application : a)));
        setOpen(data.application);
      } else window.alert(data.error ?? "Actualizarea nu a putut fi salvată.");
    } catch { window.alert("Nu m-am putut conecta la server."); }
    setSaving(false);
  }

  function exportCsv() {
    const head = ["Nume real", "Discord", "Personaj", "Steam/chat", "ID joc", "Oraș", "Ocupație", "Ore server", "Ore/zi", "Rol", "Status", "Data"];
    const body = rows.map((a) => [a.fullName, a.discord, a.characterName, a.steamName, a.gameId, a.city, a.occupation, a.serverHours, a.dailyHours, a.role, STATUS_LABEL[a.status], a.createdAt]);
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "aplicatii-helper-gta5eastpoint.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const nav = (label: string, icon: string, value: "all" | Status, n: number) => (
    <button className={`side-item${filter === value ? " active" : ""}`} onClick={() => setFilter(value)}>
      <span>{icon}</span><span>{label}</span><span className="count">{n}</span>
    </button>
  );

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" href="/admin">
          <Image className="brand-logo" src="/eastpoint-logo.png" alt="" width={80} height={80} unoptimized />
          <span>GTA5EASTPOINT <small>Application Center</small></span>
        </Link>
        <div className="side-label">Workspace</div>
        {nav("Aplicații", "▦", "all", apps.length)}
        {nav("Noi", "◷", "pending", count("pending"))}
        {nav("Acceptate", "✓", "accepted", count("accepted"))}
        <div className="side-label">Legături</div>
        <Link className="side-item" href="/"><span>↗</span><span>Vezi formularul</span></Link>
        <form className="sidebar-bottom" action="/api/admin/logout" method="post">
          <button className="side-item" type="submit"><span>↪</span><span>Deconectare</span></button>
        </form>
      </aside>

      <section className="admin-main">
        <div className="admin-top">
          <div className="admin-title"><h1>Aplicații Helper</h1><p>Evaluarea candidaților GTA5EastPoint.</p></div>
          <div className="admin-user"><span>{user.displayName}</span><div className="avatar">{initials(user.displayName)}</div></div>
        </div>

        <div className="metrics">
          <div className="metric"><p>Total aplicații</p><strong>{apps.length}</strong><span className="metric-trend">live</span></div>
          <div className="metric"><p>Aplicații noi</p><strong>{count("pending")}</strong></div>
          <div className="metric"><p>În analiză</p><strong>{count("review")}</strong></div>
          <div className="metric"><p>Acceptate</p><strong>{count("accepted")}</strong></div>
        </div>

        <div className="toolbar">
          <input className="search-input" placeholder="Caută după nume, Discord, Steam sau ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value as "all" | Status)}>
            <option value="all">Toate statusurile</option>
            <option value="pending">Noi</option><option value="review">În analiză</option>
            <option value="accepted">Acceptate</option><option value="rejected">Respinse</option>
          </select>
          <button className="ghost-btn" type="button" onClick={exportCsv}>Export CSV</button>
        </div>

        <div className="applications-panel">
          <table className="application-table">
            <thead><tr><th>Candidat</th><th>Rol</th><th>Disponibilitate</th><th>Trimisă</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => show(a)}>
                  <td><div className="applicant"><div className="mini-avatar">{initials(a.fullName)}</div><div><strong>{a.fullName}</strong><span>{a.discord}</span></div></div></td>
                  <td>{a.role}</td>
                  <td>{a.dailyHours} h/zi</td>
                  <td>{date(a.createdAt)}</td>
                  <td><span className={`status-pill status-${a.status}`}>{STATUS_LABEL[a.status]}</span></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="empty-table" colSpan={5}>Nu există aplicații care corespund filtrelor.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(null)} />
          <aside className="app-drawer" role="dialog" aria-label={`Aplicația lui ${open.fullName}`}>
            <div className="drawer-head">
              <div><h2>{open.fullName}</h2><p>{open.discord} · trimisă pe {date(open.createdAt)}</p></div>
              <button className="close-btn" onClick={() => setOpen(null)} aria-label="Închide">×</button>
            </div>
            <div className="detail-grid">
              {([
                ["Personaj", open.characterName], ["Vârstă", `${open.age} ani`], ["Grad", open.role], ["Activitate zilnică", `${open.dailyHours} h/zi`],
                ["Oraș", open.city], ["ID aplicație", open.id.slice(0, 8)], ["Ore GTA5EastPoint", `${open.serverHours} h`], ["ID joc", open.gameId],
                ["Nume Steam / chat", open.steamName], ["Membru din", open.serverTenure],
              ] as [string, string][]).map(([k, v]) => <div className="detail" key={k}><small>{k}</small><strong>{v}</strong></div>)}
            </div>
            {ANSWERS.map(([title, key]) => <div className="answer" key={key}><h3>{title}</h3><p>{String(open[key])}</p></div>)}
            <div className="answer">
              <h3>Notă internă</h3>
              <textarea className="admin-note" placeholder="Adaugă observații vizibile doar administratorilor..." value={note} onChange={(e) => setNote(e.target.value)} maxLength={4000} />
            </div>
            <div className="drawer-actions">
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <button className="primary-btn" onClick={save} disabled={saving}>{saving ? "Se salvează..." : "Salvează modificările"}</button>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
