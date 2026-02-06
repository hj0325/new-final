const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_RETRIES = 2;

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function lastOrEmpty(arr) {
  return arr.length > 0 ? String(arr[arr.length - 1] || '') : '';
}

function clampNumber(n, min, max, fallback = 0) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function cleanOneSentence(text) {
  const t = String(text || '').trim();
  if (!t) return '';
  // 개행/따옴표/불필요한 라벨 제거 (한 문장만)
  return t
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/^답변\s*[:：]\s*/i, '')
    .trim();
}

function buildContext(payload) {
  const {
    keyword,
    dominantEmojis,
    dominantKeywords,
    positiveEmojis,
    negativeEmojis,
    positiveKeywords,
    negativeKeywords,
    leftSliderValue,
    rightSliderValue,
  } = payload || {};

  const posK = safeArr(positiveKeywords);
  const negK = safeArr(negativeKeywords);
  const domK = safeArr(dominantKeywords);

  return {
    dateKeyword: keyword ? String(keyword) : '',
    dominantEmojis: safeArr(dominantEmojis).map(String),
    dominantKeywords: domK.map(String),
    positiveEmojis: safeArr(positiveEmojis).map(String),
    negativeEmojis: safeArr(negativeEmojis).map(String),
    positiveKeywords: posK.map(String),
    negativeKeywords: negK.map(String),
    weights: {
      left: clampNumber(leftSliderValue, 0, 10, 0),
      right: clampNumber(rightSliderValue, 0, 10, 0),
    },
    lastKeywords: {
      positive: lastOrEmpty(posK) || lastOrEmpty(domK),
      negative: lastOrEmpty(negK),
    },
  };
}

function computeToneHint(ctx) {
  const l = ctx.weights.left;
  const r = ctx.weights.right;
  if (l === r) return '기쁨과 조심스러움이 비슷하게 섞인 편';
  if (l > r) return '밝은 마음이 더 무거운 편';
  return '조심스러운 마음이 더 무거운 편';
}

function fallbackSentence(mode, payload) {
  const ctx = buildContext(payload);
  const l = ctx.weights.left;
  const r = ctx.weights.right;
  const toneSentence =
    l === r
      ? '마음이 두 가지로 살짝 섞였구나'
      : l > r
        ? '반짝이는 기분이 더 큰 오늘이구나'
        : '조심스러운 마음이 더 큰 오늘이구나';

  if (mode === 'shape') {
    const s = (payload && payload.shapeInfo) || {};
    const shapeName = s && s.name ? String(s.name) : '도형';
    // 실패 시에도 어색하지 않게: 키워드 원문을 문장에 그대로 끼워 넣지 않음
    return `좋아, ${toneSentence}—${shapeName}부터 살펴보며 감정생물을 만들어보자.`;
  }

  if (mode === 'birth') {
    const s = (payload && payload.shapeInfo) || {};
    const shapeName = s && s.name ? String(s.name) : '도형';
    return `오늘의 감정생물은 ${shapeName}처럼 ${toneSentence} 나날을 보냈어.`;
  }

  return `좋아, ${toneSentence}—오늘의 감정생물을 함께 만들어보자.`;
}

function buildSystemPrompt(mode) {
  if (mode === 'shape') {
    return [
      '너는 아이를 다정하게 도와주는 동화 속 도우미야.',
      '사용자가 고른 감정 이모티콘/키워드/무게(저울)를 참고해서, 아이가 만들 "감정생물"의 성격을 한 문장으로 말해줘.',
      '또한 도형의 성격을 읽은 뒤 도우미가 답장하듯, 그 도형을 어떻게 느끼는지 덧붙여 자연스럽게 말해줘.',
      '키워드가 "~했어/놀았어/넘어졌어" 같은 구어체라도, 문장을 더 자연스럽게 고쳐서 사용해.',
      '규칙: 한국어, 따뜻하고 동화 같은 말투, 1문장만, 너무 길지 않게(약 20~44자), 이모지/따옴표/번호/줄바꿈 금지.',
      '반드시 JSON으로만 출력해: {"text":"..."}',
    ].join('\n');
  }

  if (mode === 'birth') {
    return [
      '너는 아이를 다정하게 도와주는 동화 속 도우미야.',
      '오늘의 감정 결과(이모티콘, 키워드, 저울, 이미 정해진 감정생물 문장)와 사용자가 선택한 도형을 바탕으로, 이 감정생물의 "성격"을 한 문장으로 정의해줘.',
      '예: "밝은 마음으로 재밌는 하루를 보낸, 뾰족하지만 넓은 마음을 가진 친구야." 처럼 도형의 특징과 오늘의 감정을 한 문장에 녹여줘.',
      '규칙: 한국어, 따뜻하고 동화 같은 말투, 1문장만, 20~50자 내외, 이모지/따옴표/번호/줄바꿈 금지.',
      '반드시 JSON으로만 출력해: {"text":"..."}',
    ].join('\n');
  }

  return [
    '너는 아이를 다정하게 도와주는 동화 속 도우미야.',
    '사용자가 고른 감정 이모티콘/키워드/무게(저울)를 종합해서, 아이가 오늘 만들 "감정생물"의 성격을 한 문장으로 만들어줘.',
    '키워드가 "~했어/놀았어/넘어졌어" 같은 구어체라도, 문장을 더 자연스럽게 고쳐서 사용해.',
    '규칙: 한국어, 따뜻하고 동화 같은 말투, 1문장만, 너무 길지 않게(약 20~44자), 이모지/따옴표/번호/줄바꿈 금지.',
    '반드시 JSON으로만 출력해: {"text":"..."}',
  ].join('\n');
}

function buildUserPrompt(mode, payload) {
  const ctx = buildContext(payload);
  const { basePersonalityText, shapeInfo } = payload || {};

  const common = [
    `- 날짜(사용자 입력): ${ctx.dateKeyword || '(없음)'}`,
    `- 우세 이모티콘: ${ctx.dominantEmojis.join(' ') || '(없음)'}`,
    `- 우세 키워드: ${ctx.dominantKeywords.join(', ') || '(없음)'}`,
    `- 긍정 키워드(일부): ${ctx.positiveKeywords.slice(-5).join(', ') || '(없음)'}`,
    `- 부정 키워드(일부): ${ctx.negativeKeywords.slice(-5).join(', ') || '(없음)'}`,
    `- 저울 무게(왼쪽/오른쪽): ${ctx.weights.left}/${ctx.weights.right}`,
    `- 분위기 힌트: ${computeToneHint(ctx)}`,
  ].join('\n');

  if (mode === 'shape') {
    const s = shapeInfo || {};
    const shapeName = s.name ? String(s.name) : '';
    const shapeDesc = s.description ? String(s.description) : '';
    const base = basePersonalityText ? String(basePersonalityText) : '';

    return [
      '다음 정보를 보고 "상단 안내문" 한 문장을 써줘.',
      '',
      common,
      `- 이미 정한 감정생물 성격(기존 한 문장): ${base || '(없음)'}`,
      `- 이번에 확인한 도형: ${shapeName || '(없음)'}`,
      `- 도형 성격 설명: ${shapeDesc || '(없음)'}`,
      '',
      '요청: 기존 성격 문장과 도형 성격을 자연스럽게 이어, 도우미가 답장하듯 한 문장으로 말해줘.',
      '형식: {"text":"..."}',
    ].join('\n');
  }

  if (mode === 'birth') {
    const s = shapeInfo || {};
    const shapeName = s.name ? String(s.name) : '';
    const shapeDesc = s.description ? String(s.description) : '';
    const base = basePersonalityText ? String(basePersonalityText) : '';

    return [
      '다음 정보를 보고 "오늘의 감정 생물 탄생" 모달에 쓸 "캐릭터 설명" 한 문장을 써줘.',
      '',
      common,
      `- 오늘 정해진 감정생물 문장: ${base || '(없음)'}`,
      `- 선택한 도형 이름: ${shapeName || '(없음)'}`,
      `- 도형 성격 설명: ${shapeDesc || '(없음)'}`,
      '',
      '요청: 오늘의 감정 결과와 도형의 성격을 한 문장으로 정의한 캐릭터 설명을 써줘. 따뜻하고 동화 같은 말투로.',
      '형식: {"text":"..."}',
    ].join('\n');
  }

  return [
    '다음 정보를 보고 "상단 안내문" 한 문장을 써줘.',
    '',
    common,
    '',
    '요청: 아이가 오늘 만들 감정생물의 성격을 다정하게 한 문장으로 정의해줘.',
    '형식: {"text":"..."}',
  ].join('\n');
}

function parseJsonText(raw) {
  const cleaned = String(raw || '').trim();
  if (!cleaned) return '';
  try {
    const obj = JSON.parse(cleaned);
    return cleanOneSentence(obj && obj.text ? obj.text : '');
  } catch (e) {
    // 모델이 JSON을 어겼을 때도 최대한 복구
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        return cleanOneSentence(obj && obj.text ? obj.text : '');
      } catch (_) {}
    }
    return cleanOneSentence(cleaned);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOpenAI({ apiKey, payload, mode, model, timeoutMs, attempt }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(OPENAI_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        max_tokens: 120,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(mode) },
          { role: 'user', content: buildUserPrompt(mode, payload) },
        ],
      }),
    });

    const json = await r.json().catch(() => ({}));
    const raw = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content
      ? json.choices[0].message.content
      : '';
    const text = parseJsonText(raw);

    if (!r.ok) {
      // 보안: error.message에 키 일부가 포함될 수 있어 로그/응답에 남기지 않음
      const errType =
        (json && json.error && (json.error.type || json.error.code)) ||
        `openai_status_${r.status}`;
      return { ok: false, text: '', status: r.status, errMsg: String(errType), attempt };
    }

    if (!text) {
      return { ok: false, text: '', status: 200, errMsg: 'Empty model output', attempt };
    }

    return { ok: true, text, status: 200, errMsg: '', attempt };
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }
  // 빠른 형식 검증: 잘못된 키로 불필요한 호출/로그를 만들지 않기 위함
  if (!/^sk-/.test(apiKey.trim())) {
    // eslint-disable-next-line no-console
    console.warn('[mood-tracker/compose] invalid_key_format');
    const payload = req.body || {};
    const mode = (payload.mode === 'shape' ? 'shape' : payload.mode === 'birth' ? 'birth' : 'base');
    return res.status(200).json({
      ok: false,
      source: 'fallback',
      error: 'invalid_key_format',
      text: fallbackSentence(mode, payload),
    });
  }

  const payload = req.body || {};
  const mode = (payload.mode === 'shape' ? 'shape' : payload.mode === 'birth' ? 'birth' : 'base');

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const timeoutMs = clampNumber(process.env.OPENAI_TIMEOUT_MS, 2000, 20000, DEFAULT_TIMEOUT_MS);
  const retries = clampNumber(process.env.OPENAI_RETRIES, 0, 3, DEFAULT_RETRIES);

  try {
    // 1) OpenAI 여러 번 시도 (짧은 백오프)
    for (let attempt = 0; attempt <= retries; attempt++) {
      const result = await callOpenAI({ apiKey, payload, mode, model, timeoutMs, attempt: attempt + 1 });
      if (result.ok) {
        return res.status(200).json({
          ok: true,
          source: 'openai',
          text: result.text,
        });
      }

      // 마지막 시도면 중단
      if (attempt === retries) {
        // 서버 로그(키/PII 없이)로만 남김
        // eslint-disable-next-line no-console
        console.warn('[mood-tracker/compose] openai_failed', {
          mode,
          status: result.status,
          err: result.errMsg,
          attempt: result.attempt,
        });
        break;
      }

      await sleep(250 * (attempt + 1));
    }

    // 2) 실패해도 항상 자연스러운 fallback 문장을 반환 (UI가 "안 바뀌는" 문제 방지)
    return res.status(200).json({
      ok: false,
      source: 'fallback',
      text: fallbackSentence(mode, payload),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[mood-tracker/compose] unexpected_error', {
      mode,
      err: e && e.name ? e.name : 'Error',
    });
    return res.status(200).json({
      ok: false,
      source: 'fallback',
      text: fallbackSentence(mode, payload),
    });
  }
}

