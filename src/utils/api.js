const API_URL = import.meta.env.VITE_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = import.meta.env.VITE_API_KEY || ''
const MODEL = import.meta.env.VITE_MODEL || 'deepseek/deepseek-r1-0528:free'

class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

export async function sendMessage(messages, { signal } = {}) {
  if (!API_KEY) throw new APIError('API key not configured', 0, null)

  const systemPrompt = 'Ты полезный и профессиональный AI-ассистент. Отвечай на русском языке. Используй Markdown форматирование: заголовки (##), списки (- или 1.), **жирный**, *курсив*, `код`, ```блоки кода с указанием языка```. Структурируй ответы для лучшей читаемости.'
  
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }))
  ]

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      }),
      signal
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new APIError(err.error?.message || `HTTP ${res.status}`, res.status, err)
    }

    return res
  } catch (e) {
    if (e.name === 'AbortError' || e instanceof APIError) throw e
    throw new APIError(e.message, 0, null)
  }
}
