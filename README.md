# papan brief inavoice

Tracker brief konten inavoice, desember 2026 sampai januari 2027. Semua orang yang punya link bisa lihat dan ganti status. Data disimpan di Supabase.

## Setup

**Supabase**
1. Buka project Supabase, masuk **SQL Editor → New query**.
2. Paste isi `supabase.sql`, klik **Run**.
3. Buka **Project Settings → API Keys**, copy **Secret key** (`sb_secret_...`). Project URL ada di **Project Settings → Data API** (atau tombol **Connect** di atas), bentuknya `https://xxxx.supabase.co`.

**Vercel**
1. **Add New → Project**, import repo `papan-brief-inavoice`, preset **Other**.
2. Sebelum Deploy, buka **Environment Variables**, isi:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = secret key
3. Klik **Deploy**. Kalau project sudah telanjur ter-deploy, isi variabelnya di **Settings → Environment Variables**, lalu **Redeploy**.

Secret key itu rahasia. Cuma ditaruh di Vercel, jangan di kode atau di chat.

## File

- `index.html`: halaman
- `api/status.js`: baca dan simpan status ke Supabase
- `supabase.sql`: bikin tabel dan isi status awal
