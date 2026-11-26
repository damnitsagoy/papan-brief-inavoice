const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TABLE = "brief_status";

const SLOTS = [
  "2026-12-02", "2026-12-04", "2026-12-07", "2026-12-09", "2026-12-11", "2026-12-14",
  "2026-12-16", "2026-12-18", "2026-12-21", "2026-12-23", "2026-12-24", "2026-12-25",
  "2027-01-01", "2027-01-04", "2027-01-06", "2027-01-08", "2027-01-11", "2027-01-13",
  "2027-01-15", "2027-01-18", "2027-01-20", "2027-01-22", "2027-01-25", "2027-01-27",
  "2027-01-29"
];
const MAX_STATUS = 5;

function sb(path, options) {
  return fetch(SUPABASE_URL + "/rest/v1/" + path, Object.assign({}, options, {
    headers: Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    }, (options && options.headers) || {})
  }));
}

async function readAll() {
  const r = await sb(TABLE + "?select=slot,status");
  if (!r.ok) throw new Error("read " + r.status);
  const rows = await r.json();
  const s = {};
  rows.forEach((row) => {
    if (SLOTS.includes(row.slot) && row.status >= 0 && row.status <= MAX_STATUS) s[row.slot] = row.status;
  });
  return s;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ error: "supabase belum disambung" });
    return;
  }
  try {
    if (req.method === "GET") {
      res.status(200).json({ s: await readAll() });
      return;
    }
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const slot = body && body.slot;
      const status = body && body.status;
      if (!SLOTS.includes(slot) || !Number.isInteger(status) || status < 0 || status > MAX_STATUS) {
        res.status(400).json({ error: "data tidak valid" });
        return;
      }
      const r = await sb(TABLE + "?on_conflict=slot", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ slot: slot, status: status, updated_at: new Date().toISOString() })
      });
      if (!r.ok) throw new Error("write " + r.status);
      res.status(200).json({ ok: true });
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method tidak didukung" });
  } catch (e) {
    res.status(500).json({ error: "gagal mengakses database" });
  }
};
