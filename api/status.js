const crypto = require("crypto");

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PASSWORD = process.env.EDIT_PASSWORD || "";
const KEY = "papan-brief:status";

const SLOTS = [
  "2026-12-02", "2026-12-04", "2026-12-07", "2026-12-09", "2026-12-11", "2026-12-14",
  "2026-12-16", "2026-12-18", "2026-12-21", "2026-12-23", "2026-12-24", "2026-12-25",
  "2027-01-01", "2027-01-04", "2027-01-06", "2027-01-08", "2027-01-11", "2027-01-13",
  "2027-01-15", "2027-01-18", "2027-01-20", "2027-01-22", "2027-01-25", "2027-01-27",
  "2027-01-29"
];
const MAX_STATUS = 5;

// status per 26 nov 2026, dipakai sekali waktu database masih kosong
const SEED = {
  "2026-12-02": 1, "2026-12-04": 2, "2026-12-09": 2, "2026-12-11": 2,
  "2026-12-14": 2, "2026-12-24": 2, "2026-12-25": 2
};

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + REDIS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function samePassword(given) {
  if (!PASSWORD || typeof given !== "string") return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

async function readAll() {
  const flat = await redis(["HGETALL", KEY]);
  if (!flat || flat.length === 0) {
    const seeded = await redis(["EXISTS", KEY + ":seeded"]);
    if (!seeded) {
      const args = ["HSET", KEY];
      Object.keys(SEED).forEach((k) => args.push(k, String(SEED[k])));
      await redis(args);
      await redis(["SET", KEY + ":seeded", "1"]);
      return Object.assign({}, SEED);
    }
    return {};
  }
  const s = {};
  for (let i = 0; i < flat.length; i += 2) {
    const v = parseInt(flat[i + 1], 10);
    if (SLOTS.includes(flat[i]) && v >= 0 && v <= MAX_STATUS) s[flat[i]] = v;
  }
  return s;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!REDIS_URL || !REDIS_TOKEN) {
    res.status(500).json({ error: "database belum disambung" });
    return;
  }
  try {
    if (req.method === "GET") {
      res.status(200).json({ s: await readAll() });
      return;
    }
    if (req.method === "POST") {
      if (!samePassword(req.headers["x-edit-password"])) {
        res.status(401).json({ error: "password salah" });
        return;
      }
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const slot = body && body.slot;
      const status = body && body.status;
      if (!SLOTS.includes(slot) || !Number.isInteger(status) || status < 0 || status > MAX_STATUS) {
        res.status(400).json({ error: "data tidak valid" });
        return;
      }
      await readAll();
      await redis(["HSET", KEY, slot, String(status)]);
      res.status(200).json({ ok: true });
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method tidak didukung" });
  } catch (e) {
    res.status(500).json({ error: "gagal mengakses database" });
  }
};
