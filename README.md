# papan brief inavoice

Tracker brief konten inavoice, desember 2026 sampai januari 2027. Semua orang yang punya link bisa lihat dan ganti status.

## Setup di Vercel

1. Di vercel.com, klik **Add New → Project**, lalu import repo `papan-brief-inavoice`. Framework preset: **Other**. Klik **Deploy**.
2. Di project itu, buka **Storage**, pilih **Upstash** (Redis), lalu buat database gratis dan sambungkan ke project ini. Vercel otomatis ngisi `KV_REST_API_URL` dan `KV_REST_API_TOKEN`.
3. Buka **Deployments**, klik **Redeploy** di deploy terakhir supaya pengaturan baru kepakai.

Status awal (per 26 nov 2026) otomatis masuk waktu halaman pertama kali dibuka.

## Cara pakai

- Ganti status lewat dropdown di tiap kartu, langsung tersimpan.
- Halaman ngecek perubahan dari tim tiap 15 detik.

## File

- `index.html`: halaman
- `api/status.js`: baca dan simpan status ke Redis
