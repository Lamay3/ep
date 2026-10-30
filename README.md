# GTA5EastPoint – Application Center (v2)

Site complet: pagina publică de aplicare (5 pași), panoul staff și API-ul. Next.js 16, React 19, fără bază de date externă.

## Pornire locală
```bash
npm install
cp .env.example .env.local     # completează SESSION_SECRET și ADMIN_USERS
npm run dev                    # http://localhost:3000   (panou: /admin)
```
Local, aplicațiile se salvează în `.data/applications.json`.

## Publicare pe Netlify
> ⚠️ Site-ul are API-uri (formular + panou), deci rulează ca aplicație server. **Drag-and-drop („Deploy manually”) NU funcționează** pentru el. Folosește una din variantele de mai jos.

**Varianta A – Git (recomandată, se actualizează singur la fiecare push)**
1. Dezarhivează, creează un repo pe GitHub/GitLab și urcă fișierele.
2. Netlify → *Add new site → Import an existing project* → alege repo-ul. Setările de build sunt deja în `netlify.toml` (`npm run build`, Node 22); Next.js e detectat automat.
3. Înainte de primul deploy adaugă variabilele de mediu (pasul de mai jos).

**Varianta B – fără Git (Netlify CLI)**
```bash
npm install -g netlify-cli
netlify login
netlify init            # creează / leagă site-ul
netlify deploy --build --prod
```

### Variabile de mediu (obligatorii)
În **Site configuration → Environment variables** adaugă:
- `SESSION_SECRET` – șir lung aleatoriu (`openssl rand -hex 32`)
- `ADMIN_USERS` – conturile staff, JSON pe **un singur rând** (vezi modelele cu 5 conturi din `.env.example`)

Fără ele panoul `/admin` nu pornește. După ce le salvezi, fă **Deploy → Trigger deploy**.
Pe Netlify, aplicațiile se salvează automat în **Netlify Blobs** (nu trebuie configurat nimic).

## Conturi panou staff (5 modele)
Conturile se definesc doar în `ADMIN_USERS` (nu există bază de date de utilizatori). `.env.example` conține 5 modele:

| username | nume afișat | rol sugerat |
|---|---|---|
| `owner` | Owner | fondator / proprietar |
| `admin` | Administrator | administrator principal |
| `headstaff` | Head Staff | conducerea echipei |
| `moderator` | Moderator | evaluează aplicații |
| `recrutare` | Manager Recrutare | responsabil recrutare Helperi |

- Fiecare cont are propria parolă (minim 10 caractere; recomandat 16+).
- Toate conturile au aceleași drepturi în panou; „numele afișat” e doar eticheta din colțul dreapta-sus.
- Adăugare / ștergere / schimbare parolă: editezi `ADMIN_USERS` în Netlify și faci redeploy.
- Nu pune parolele reale în Git. `.env.example` are doar parole-model.

## Structură
- `app/globals.css` – tot designul (culori, animații, responsive)
- `components/staff-application.tsx` – formularul public · `entrance-loader.tsx` – loading screen (doar logo)
- `components/admin-dashboard.tsx`, `admin-login.tsx` – panoul staff
- `lib/form.ts` – câmpurile, textele și validarea formularului (folosite și în browser, și pe server)
- `lib/store.ts` – salvarea aplicațiilor · `lib/auth.ts` – sesiuni și conturi
- `app/api/*` – `POST /api/applications`, `POST /api/admin/login`, `POST /api/admin/logout`, `PATCH /api/admin/applications/:id`
- `public/` – logo, favicon, iconițe, imaginile de share, bannerul

Fonturi: Inter (text) și Plus Jakarta Sans (titluri), incluse în proiect, fără cereri către Google.
