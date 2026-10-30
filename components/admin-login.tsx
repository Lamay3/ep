"use client";

import Image from "next/image";
import { useState } from "react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok) return window.location.reload();
      setMessage(data.error ?? "Autentificarea nu a reușit.");
    } catch { setMessage("Nu m-am putut conecta la server. Verifică internetul și reîncearcă."); }
    setBusy(false);
  }

  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="setup-logo-frame">
          <Image className="brand-logo setup-logo" src="/eastpoint-logo.png" alt="GTA5EastPoint" width={78} height={78} priority unoptimized />
        </div>
        <h1>Conectare staff</h1>
        <p>Accesul este permis doar membrilor echipei care au cont configurat.</p>
        <form className="setup-form" onSubmit={submit}>
          <input type="text" autoComplete="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" autoComplete="current-password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="primary-btn" disabled={busy}>{busy ? "Se verifică..." : "Intră în panou"}</button>
          {message && <p className="setup-message" role="alert">{message}</p>}
        </form>
      </section>
    </main>
  );
}
