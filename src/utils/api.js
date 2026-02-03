const API_URL = import.meta.env.VITE_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = import.meta.env.VITE_API_KEY || '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'
const MODEL = import.meta.env.VITE_MODEL || 'tngtech/deepseek-r1t-chimera:free'

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

  const systemPrompt = 'Ты полезный и профессиональный AI-ассистент. Отвечай на русском языке. Используй Markdown форматирование: заголовки (##), списки (- или 1.), **жирный**, *курсив*, `код`, ```блоки кода с указанием языка```. Структурируй ответы для лучшей читаемости. НЕ ДУМАЙ ПОСЛЕ ТОГО КАК ПОЛЬЗОВАТЕЛЬ ОТПРАВИЛ ЗАПРОС, сразу давай ответ!'
  
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => {
      const messageContent = m.apiContent || m.content
      const msg = {
        role: m.role,
        content: typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent)
      }
      if (m.reasoning_details) {
        msg.reasoning_details = m.reasoning_details
      }
      return msg
    })
  ]

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://reddchat.app',
        'X-Title': 'REDDCHAT'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
        reasoning: {
          enabled: true
        }
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
