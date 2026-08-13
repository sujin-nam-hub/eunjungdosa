// 은정도사 AI 백엔드 (Vercel 서버리스 함수)
const WINDOW_MS = 60 * 60 * 1000; // 1시간 창
const MAX_PER_IP = 20;            // IP당 1시간 최대 요청 수
const MAX_TOKENS_CAP = 1600;      // 요청당 출력 토큰 상한
const DAILY_CAP = 300;            // 하루 전체 최대 요청 수

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST만 허용돼요' }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: '서버에 API 키가 설정되지 않았어요 (ANTHROPIC_API_KEY)' }); return; }

  const daily = globalThis.__eunjeongDaily || (globalThis.__eunjeongDaily = { day: '', count: 0 });
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) { daily.day = today; daily.count = 0; }
  if (daily.count >= DAILY_CAP) { res.status(429).json({ error: '오늘 사용량이 가득 찼어요. 내일 다시 만나요랑 🐯' }); return; }
  daily.count += 1;

  const store = globalThis.__eunjeongHits || (globalThis.__eunjeongHits = new Map());
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  let rec = store.get(ip);
  if (!rec || now > rec.reset) rec = { count: 0, reset: now + WINDOW_MS };
  rec.count += 1;
  store.set(ip, rec);
  if (rec.count > MAX_PER_IP) { res.status(429).json({ error: '오늘은 이용량이 많아요. 잠시 후 다시 물어봐줘랑 🐯' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const { prompt, system } = body;
  let messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    if (typeof prompt === 'string' && prompt.trim()) { messages = [{ role: 'user', content: prompt }]; }
    else { res.status(400).json({ error: '잘못된 요청이에요' }); return; }
  }
  if (messages.length > 14) messages = messages.slice(-14);
  const totalChars = JSON.stringify(messages).length + (system ? system.length : 0);
  if (totalChars > 8000) { res.status(400).json({ error: '내용이 너무 길어요' }); return; }
  const maxTokens = Math.min(Math.max(parseInt(body.max_tokens, 10) || 1200, 100), MAX_TOKENS_CAP);

  try {
    const payload = { model: 'claude-sonnet-5', max_tokens: maxTokens, messages };
    if (typeof system === 'string' && system.trim()) payload.system = system;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (data && data.content && data.content[0]) { res.status(200).json({ text: data.content[0].text }); }
    else { res.status(502).json({ error: (data && data.error && data.error.message) || 'AI 응답 오류' }); }
  } catch (e) { res.status(502).json({ error: '연결 실패: ' + e.message }); }
}
