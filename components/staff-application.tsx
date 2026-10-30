"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { EntranceLoader } from "./entrance-loader";
import { INITIAL, MIN_WORDS, STEPS, countWords, validateStep, type FieldDef, type FormValues } from "@/lib/form";

const BENEFITS = [
  ["Imparțialitate", "Prieteniile nu pot influența o decizie de staff."],
  ["Transparență", "Istoricul sincer valorează mai mult decât o imagine cosmetizată."],
  ["Responsabilitate", "Un Helper explică, documentează și cere ajutor când este necesar."],
];

function WordHint({ value }: { value: string }) {
  const n = countWords(value);
  return <small className={n >= MIN_WORDS ? "word-hint is-valid" : "word-hint"}>Minimum {MIN_WORDS} de cuvinte · {n}/{MIN_WORDS}</small>;
}

export function StaffApplication() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState("");
  const [trap, setTrap] = useState("");
  const card = useRef<HTMLElement>(null);

  const last = STEPS.length - 1;
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const current = STEPS[step];

  function set(key: string, v: string | boolean) {
    setValues((p) => ({ ...p, [key]: v }));
    setError("");
  }
  function go(to: number) {
    setStep(to);
    setError("");
    card.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateStep(step, values);
    if (problem) return setError(problem);
    if (step < last) return go(step + 1);
    setBusy(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website: trap, age: Number(values.age), serverHours: Number(values.serverHours), dailyHours: Number(values.dailyHours) }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error ?? "Aplicația nu a putut fi trimisă.");
      setDoneId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare. Încearcă din nou.");
    } finally {
      setBusy(false);
    }
  }

  function renderField(f: FieldDef) {
    const cls = `field${f.full ? " full" : ""}`;
    switch (f.kind) {
      case "callout":
        return (
          <div key={f.key} className="field full role-callout">
            <span className="field-label">{f.label}</span>
            <strong>{f.value}</strong>
            <small>{f.note}</small>
          </div>
        );
      case "check":
        return (
          <label key={f.key} className="consent field full">
            <input type="checkbox" checked={values[f.key] === true} onChange={(e) => set(f.key, e.target.checked)} />
            <span>{f.label}</span>
          </label>
        );
      case "choice":
        return (
          <div key={f.key} className="field full">
            <span className="field-label">{f.label}</span>
            <div className="choice-grid" role="radiogroup">
              {f.options.map((o) => (
                <label key={o} className="choice">
                  <input type="radio" name={f.key} checked={values[f.key] === o} onChange={() => set(f.key, o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case "textarea":
        return (
          <div key={f.key} className={cls}>
            <label htmlFor={f.key}>{f.label}</label>
            <textarea id={f.key} maxLength={f.max} placeholder={f.placeholder} value={String(values[f.key])} onChange={(e) => set(f.key, e.target.value)} />
            {f.words && <WordHint value={String(values[f.key])} />}
          </div>
        );
      case "number":
        return (
          <div key={f.key} className={cls}>
            <label htmlFor={f.key}>{f.label}</label>
            <input id={f.key} type="number" inputMode="numeric" min={f.min} max={f.max} placeholder={f.placeholder} value={String(values[f.key])} onChange={(e) => set(f.key, e.target.value)} />
          </div>
        );
      default:
        return (
          <div key={f.key} className={cls}>
            <label htmlFor={f.key}>{f.label}</label>
            <input id={f.key} autoComplete={f.autoComplete} maxLength={f.max} placeholder={f.placeholder} value={String(values[f.key])} onChange={(e) => set(f.key, e.target.value)} />
          </div>
        );
    }
  }

  return (
    <>
      <EntranceLoader />
      <main className="public-shell eastpoint-theme">
        <header className="topbar">
          <Link className="brand" href="/" aria-label="GTA5EastPoint Application Center">
            <Image className="brand-logo" src="/eastpoint-logo.png" alt="" width={80} height={80} priority unoptimized />
            <span>GTA5EASTPOINT <small>Application Center</small></span>
          </Link>
          <Link className="admin-link" href="/admin">Panou staff <span aria-hidden="true">↗</span></Link>
        </header>

        <section className="eastpoint-banner" aria-label="Aplicații staff GTA5EastPoint">
          <span className="sr-only">GTA5EastPoint Application Center — recrutare pentru gradul Helper.</span>
        </section>

        <div className="apply-layout">
          <section className="intro">
            <span className="eyebrow"><span className="eyebrow-dot" /> Recrutare Helper</span>
            <h2>Încrederea se câștigă prin <span>caracter și consecvență.</span></h2>
            <p className="intro-copy">Formularul este creat special pentru GTA5EastPoint. Evaluăm sinceritatea, maturitatea și felul în care ai reprezenta comunitatea, nu răspunsurile „perfecte”.</p>
            <div className="benefits">
              {BENEFITS.map(([title, text], i) => (
                <div className="benefit" key={title}>
                  <span className="benefit-icon">{String(i + 1).padStart(2, "0")}</span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="form-card" aria-live="polite" ref={card}>
            {doneId ? (
              <div className="success-state">
                <div>
                  <div className="success-icon">✓</div>
                  <h2>Aplicația a fost înregistrată!</h2>
                  <p>Echipa GTA5EastPoint îți va analiza răspunsurile și te va contacta pe Discord dacă treci mai departe. Cod aplicație: <strong>{doneId.slice(0, 8).toUpperCase()}</strong></p>
                  <button className="primary-btn" type="button" onClick={() => { setValues(INITIAL); setStep(0); setDoneId(""); }}>Trimite altă aplicație</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="form-heading">
                  <div><h2>{current.title}</h2><p>{current.hint}</p></div>
                  <span className="step-count">Pasul {step + 1} din {STEPS.length}</span>
                </div>
                <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>

                <div className="field-grid" key={step}>
                  {current.fields.map(renderField)}
                  {step === 0 && (
                    <div className="field" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input id="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                    </div>
                  )}
                </div>

                {error && <div className="error-box" role="alert" key={error}>{error}</div>}

                <div className="form-actions">
                  {step > 0 ? <button className="ghost-btn" type="button" onClick={() => go(step - 1)}>← Înapoi</button> : <span />}
                  {step < last
                    ? <button className="primary-btn" type="submit">Continuă →</button>
                    : <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Se trimite..." : "Trimite aplicația →"}</button>}
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
