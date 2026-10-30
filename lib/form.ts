export type Status = "pending" | "review" | "accepted" | "rejected";
export const STATUS_LABEL: Record<Status, string> = {
  pending: "Nouă",
  review: "În analiză",
  accepted: "Acceptată",
  rejected: "Respinsă",
};

export const MIN_WORDS = 20;
export const RECORDING_OPTIONS = [
  "Da, folosesc OBS sau alt program",
  "Pot instala și configura un program",
  "Nu am momentan această posibilitate",
];

type Base = { key: string; label: string; full?: boolean };
export type FieldDef =
  | (Base & { kind: "text"; placeholder: string; max: number; autoComplete?: string })
  | (Base & { kind: "number"; placeholder: string; min: number; max: number })
  | (Base & { kind: "textarea"; placeholder: string; max: number; words?: boolean })
  | (Base & { kind: "check" })
  | (Base & { kind: "choice"; options: string[] })
  | (Base & { kind: "callout"; value: string; note: string });

export type StepDef = { title: string; hint: string; error: string; fields: FieldDef[] };

export const WORDS_ERROR = "Răspunsurile marcate trebuie să conțină cel puțin 20 de cuvinte.";

export const STEPS: StepDef[] = [
  {
    title: "Despre tine",
    hint: "Date de contact și contextul personal relevant pentru programul de staff.",
    error: "Completează toate datele personale și de contact.",
    fields: [
      { kind: "text", key: "fullName", label: "Numele real complet *", placeholder: "Numele folosit pentru evaluarea internă", max: 100, full: true, autoComplete: "name" },
      { kind: "number", key: "age", label: "Vârsta reală *", placeholder: "Ex: 19", min: 14, max: 70 },
      { kind: "text", key: "city", label: "Orașul / zona de reședință *", placeholder: "Ex: Brașov", max: 100 },
      { kind: "text", key: "occupation", label: "Ocupația și programul tău obișnuit *", placeholder: "Ex: elev, student, angajat — menționează intervalele importante", max: 180, full: true },
      { kind: "text", key: "discord", label: "Username Discord pentru contact *", placeholder: "Ex: eastpoint.player", max: 80, full: true, autoComplete: "username" },
    ],
  },
  {
    title: "Integritate și caracter",
    hint: "Cum gândești, cât de bine cunoști regulile și ce te recomandă.",
    error: "Completează toate răspunsurile despre integritate și caracter.",
    fields: [
      { kind: "check", key: "impartialityCommitment", label: "Înțeleg că un membru staff aplică aceleași standarde tuturor, inclusiv prietenilor, și mă angajez să cer preluarea cazului dacă nu pot rămâne obiectiv.", full: true },
      { kind: "textarea", key: "ruleKnowledge", label: "Cum îți evaluezi cunoașterea regulamentului și ce faci când nu ești sigur de o regulă? *", placeholder: "Descrie metoda ta de verificare și oferă un exemplu de regulă pe care o consideri importantă.", max: 2200, full: true },
      { kind: "textarea", key: "motivation", label: "De ce consideri că ești potrivit pentru funcția de Helper? *", placeholder: "Argumentează prin comportament, experiențe și rezultate, nu doar prin timpul petrecut pe server.", max: 2200, full: true, words: true },
      { kind: "textarea", key: "selfDescription", label: "Descrie-te așa cum te-ar descrie un coleg care te cunoaște bine. *", placeholder: "Include calități, limite personale și felul în care reacționezi la feedback.", max: 2200, full: true, words: true },
    ],
  },
  {
    title: "Profilul din joc",
    hint: "Identitatea, experiența și activitatea ta pe GTA5EastPoint.",
    error: "Completează identitatea și activitatea din joc.",
    fields: [
      { kind: "callout", key: "_role", label: "Poziție disponibilă", value: "HELPER", note: "Aplicația este evaluată exclusiv pentru acest rol.", full: true },
      { kind: "text", key: "characterName", label: "Numele complet al personajului *", placeholder: "Așa cum apare în buletinul din joc", max: 100 },
      { kind: "text", key: "steamName", label: "Numele afișat în chat / Steam *", placeholder: "Username-ul vizibil celorlalți", max: 100 },
      { kind: "text", key: "gameId", label: "ID-ul actual din joc *", placeholder: "Ex: 1042", max: 40 },
      { kind: "number", key: "serverHours", label: "Ore jucate pe GTA5EastPoint *", placeholder: "Ex: 350", min: 0, max: 30000 },
      { kind: "text", key: "serverTenure", label: "De când faci parte din comunitate și cât de constant ai jucat? *", placeholder: "Ex: din februarie 2026, cu activitate constantă în ultimele 4 luni", max: 180, full: true },
      { kind: "number", key: "dailyHours", label: "Câte ore poți acorda realist serverului într-o zi obișnuită? *", placeholder: "Ex: 3", min: 1, max: 16, full: true },
    ],
  },
  {
    title: "Istoric și reputație",
    hint: "Transparență despre sancțiuni, conflicte și imaginea creată în comunitate.",
    error: "Completează istoricul și reputația. Dacă nu se aplică, scrie clar «Nu am».",
    fields: [
      { kind: "textarea", key: "sanctions", label: "Prezintă sancțiunile primite și ce ai învățat din ele. *", placeholder: "Include avertismente, kick-uri sau ban-uri. Dacă nu ai sancțiuni, scrie «Nu am».", max: 1800, full: true },
      { kind: "textarea", key: "inGameAssets", label: "Descrie pe scurt progresul și bunurile importante ale personajului. *", placeholder: "Informația ne ajută să înțelegem implicarea în economie; valoarea averii nu oferă un avantaj.", max: 1200, full: true },
      { kind: "textarea", key: "reputationHistory", label: "Există motive pentru care unii jucători te-ar putea percepe negativ? *", placeholder: "Explică sincer situațiile, inclusiv neînțelegerile rezolvate. Dacă nu, argumentează pe scurt.", max: 1800, full: true },
      { kind: "textarea", key: "staffConflicts", label: "Ai avut discuții tensionate sau neînțelegeri cu membri staff? *", placeholder: "Descrie faptele, cum ai reacționat și cum s-a încheiat. Dacă nu ai avut, scrie «Nu am».", max: 1800, full: true },
    ],
  },
  {
    title: "Rolul de Helper",
    hint: "Responsabilități, schimbări propuse și decizii într-o situație dificilă.",
    error: "Completează toate răspunsurile despre rol și confirmă declarația finală.",
    fields: [
      { kind: "textarea", key: "improvementPlan", label: "Ce ai schimba concret în comportamentul tău dacă ai primi funcția? *", placeholder: "Vorbește despre disciplină, comunicare, disponibilitate sau alte obiceiuri relevante.", max: 2200, full: true, words: true },
      { kind: "textarea", key: "helperResponsibilities", label: "Cum înțelegi rolul unui Helper pe GTA5EastPoint? *", placeholder: "Explică responsabilitățile, limitele gradului și relația cu jucătorii și restul echipei.", max: 2200, full: true, words: true },
      { kind: "choice", key: "recordingSetup", label: "Poți înregistra dovezi video atunci când situația o cere? *", options: RECORDING_OPTIONS, full: true },
      { kind: "textarea", key: "friendScenario", label: "Observi un prieten apropiat încălcând o regulă, dar dovezile nu sunt încă suficiente. Cum procedezi? *", placeholder: "Descrie verificarea, comunicarea, documentarea și decizia, inclusiv când ai cere ajutorul unui superior.", max: 2200, full: true, words: true },
      { kind: "check", key: "consent", label: "Declar că informațiile sunt reale și îmi aparțin. Înțeleg că o minciună intenționată poate duce la respingerea aplicației și la măsuri conform regulamentului GTA5EastPoint.", full: true },
    ],
  },
];

export type FormValues = Record<string, string | boolean>;

export const INITIAL: FormValues = Object.fromEntries(
  STEPS.flatMap((s) => s.fields)
    .filter((f) => f.kind !== "callout")
    .map((f) => [f.key, f.kind === "check" ? false : ""]),
);

export const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Validarea unui pas (folosită în browser). Returnează mesajul de eroare sau "". */
export function validateStep(index: number, v: FormValues): string {
  const step = STEPS[index];
  const fields = step.fields.filter((f) => f.kind !== "callout");
  if (fields.some((f) => (f.kind === "check" ? v[f.key] !== true : !String(v[f.key] ?? "").trim()))) return step.error;
  if (fields.some((f) => f.kind === "textarea" && f.words && countWords(String(v[f.key])) < MIN_WORDS)) return WORDS_ERROR;
  return "";
}

export type ParsedApplication = Record<string, string | number>;

/** Validare completă pe server: nu ne bazăm niciodată doar pe browser. */
export function parseApplication(body: unknown): { ok: true; data: ParsedApplication } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Cerere invalidă." };
  const b = body as Record<string, unknown>;
  const data: ParsedApplication = {};
  for (const step of STEPS) {
    for (const f of step.fields) {
      if (f.kind === "callout") continue;
      const raw = b[f.key];
      const name = f.label.replace(/\s*\*$/, "");
      if (f.kind === "check") {
        if (raw !== true) return { ok: false, error: step.error };
        if (f.key === "impartialityCommitment") data[f.key] = "Confirmat";
        continue;
      }
      if (f.kind === "number") {
        const n = Number(raw);
        if (raw === "" || raw == null || !Number.isFinite(n) || n < f.min || n > f.max)
          return { ok: false, error: `Valoarea pentru „${name}” trebuie să fie între ${f.min} și ${f.max}.` };
        data[f.key] = Math.round(n);
        continue;
      }
      const s = typeof raw === "string" ? raw.trim() : "";
      if (!s) return { ok: false, error: step.error };
      if (f.kind === "choice") {
        if (!f.options.includes(s)) return { ok: false, error: `Alege o variantă validă pentru „${name}”.` };
      } else if (s.length > f.max) return { ok: false, error: `Răspunsul pentru „${name}” este prea lung (maxim ${f.max} caractere).` };
      if (f.kind === "textarea" && f.words && countWords(s) < MIN_WORDS) return { ok: false, error: WORDS_ERROR };
      data[f.key] = s;
    }
  }
  return { ok: true, data };
}
