const STATIONS = [
  { id: "class95",     name: "Class 95",      freq: "95.0",  color: "#e63946", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/CLASS95AAC.aac" },
  { id: "gold905",     name: "Gold 90.5",      freq: "90.5",  color: "#f4a261", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/GOLD905AAC.aac" },
  { id: "987fm",       name: "987FM",          freq: "98.7",  color: "#2a9d8f", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/987FMAAC.aac" },
  { id: "yes933",      name: "YES 93.3",       freq: "93.3",  color: "#e9c46a", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/YES933AAC.aac" },
  { id: "capital958",  name: "Capital 95.8",   freq: "95.8",  color: "#f7b731", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/CAPITAL958AAC.aac" },
  { id: "hao963",      name: "Hao FM 96.3",    freq: "96.3",  color: "#26c6da", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/HAO963AAC.aac" },
  { id: "love972",     name: "Love 97.2",      freq: "97.2",  color: "#e76f51", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOVE972AAC.aac" },
  { id: "symphony924", name: "Symphony 92.4",  freq: "92.4",  color: "#a8dadc", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/SYMPHONY924AAC.aac" },
  { id: "ria897",      name: "Ria 89.7",       freq: "89.7",  color: "#b388ff", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/RIA897AAC.aac" },
  { id: "warna942",    name: "Warna 94.2",     freq: "94.2",  color: "#4fc3f7", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/WARNA942AAC.aac" },
  { id: "cna938",      name: "CNA 938",        freq: "93.8",  color: "#8ac926", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/CNA938AAC.aac" },
  { id: "oli968",      name: "Oli 96.8",       freq: "96.8",  color: "#ff595e", stream: "https://playerservices.streamtheworld.com/api/livestream-redirect/OLI968AAC.aac" },
  { id: "kiss92",      name: "Kiss92",         freq: "92.0",  color: "#ff006e", stream: "https://live.kiss92.sg/stream" },
  { id: "onefm",       name: "One FM 91.3",    freq: "91.3",  color: "#3a86ff", stream: "https://live.onefm.sg/stream" },
  { id: "ufm100",      name: "UFM 100.3",      freq: "100.3", color: "#8338ec", stream: "https://live.ufm1003.sg/stream" },
  { id: "moneyfm",     name: "Money FM 89.3",  freq: "89.3",  color: "#06d6a0", stream: "https://live.moneyfm893.sg/stream" },
];

async function fetchNowPlaying(station) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(station.stream, {
      headers: { "Icy-MetaData": "1", "User-Agent": "Mozilla/5.0", "Accept": "*/*" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const metaint = parseInt(response.headers.get("icy-metaint") || "0", 10);
    if (!metaint) return { ...meta(station), title: null, artist: null };
    const reader = response.body.getReader();
    let chunks = [], totalRead = 0;
    const maxRead = metaint + 4096;
    while (totalRead < maxRead) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalRead += value.length;
    }
    reader.cancel();
    const combined = new Uint8Array(totalRead);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
    if (combined.length <= metaint) return { ...meta(station), title: null, artist: null };
    const metaLen = combined[metaint] * 16;
    if (!metaLen || combined.length < metaint + 1 + metaLen) return { ...meta(station), title: null, artist: null };
    const metaText = new TextDecoder("utf-8", { fatal: false }).decode(combined.slice(metaint + 1, metaint + 1 + metaLen));
    const match = metaText.match(/StreamTitle='([^']*)'/);
    const raw = match ? match[1].trim() : null;
    if (!raw) return { ...meta(station), title: null, artist: null };
    const parts = raw.split(" - ");
    if (parts.length >= 2) return { ...meta(station), artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
    return { ...meta(station), artist: null, title: raw };
  } catch (err) {
    clearTimeout(timeout);
    return { ...meta(station), title: null, artist: null, error: err.message };
  }
}

function meta(s) {
  return { id: s.id, name: s.name, freq: s.freq, color: s.color };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" } });
    }
    const results = await Promise.all(STATIONS.map(fetchNowPlaying));
    return new Response(JSON.stringify({ stations: results, ts: Date.now() }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  },
};
