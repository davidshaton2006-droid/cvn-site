/**
 * Cloudflare Worker: relays the ЦВН site's lead form to a Telegram forum group,
 * routing each submission into the topic that matches "Тема обращения".
 *
 * Setup: see telegram-worker/README.md for the full step-by-step guide.
 *
 * Required environment variables (set in Cloudflare dashboard → Workers → Settings → Variables):
 *   TELEGRAM_BOT_TOKEN   (secret)  — token from @BotFather
 *   TELEGRAM_CHAT_ID     (secret)  — the forum supergroup's chat id, e.g. -1001234567890
 *   TOPIC_THREADS        (plain)   — JSON map of form "topic" value -> message_thread_id, e.g.
 *                                    {"Срочный выкуп недвижимости":2,"Займ под залог недвижимости":3,"Инвестиции в недвижимость":4}
 *                                    Any topic value not found in this map (including "Другой вопрос")
 *                                    is posted to the group's General topic (no thread id).
 *   ALLOWED_ORIGINS      (plain, optional) — comma-separated list of extra allowed origins.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  'https://cvn-dom.ru',
  'https://www.cvn-dom.ru',
  'https://davidshaton2006-droid.github.io',
];

function corsHeaders(origin, env) {
  const extra = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = [...DEFAULT_ALLOWED_ORIGINS, ...extra];
  const isLocal = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allow = isLocal || allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clip(str, max) {
  const s = String(str || '').trim();
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
        status: 405, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'bad_json' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const name = clip(body.name, 120);
    const phone = clip(body.phone, 40);
    const topic = clip(body.topic, 120);
    const comment = clip(body.comment, 800);
    const page = clip(body.page, 120);

    if (!name || !phone) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_fields' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ ok: false, error: 'server_not_configured' }), {
        status: 500, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    let threadMap = {};
    try { threadMap = JSON.parse(env.TOPIC_THREADS || '{}'); } catch { threadMap = {}; }
    const threadId = threadMap[topic];

    const lines = [
      '🆕 <b>Новая заявка с сайта</b>',
      `👤 ${escapeHtml(name)}`,
      `📞 ${escapeHtml(phone)}`,
      `📌 ${escapeHtml(topic || 'Не указано')}`,
    ];
    if (comment) lines.push(`💬 ${escapeHtml(comment)}`);
    if (page) lines.push(`🔗 ${escapeHtml(page)}`);
    const text = lines.join('\n');

    const tgPayload = {
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    };
    if (threadId) tgPayload.message_thread_id = threadId;

    const tgResp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgPayload),
    });

    if (!tgResp.ok) {
      const errText = await tgResp.text().catch(() => '');
      console.error('Telegram API error', tgResp.status, errText);
      return new Response(JSON.stringify({ ok: false, error: 'telegram_failed' }), {
        status: 502, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
