import { ref } from 'vue'
import { sendMessage } from '../utils/api'

export function useChat() {
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const controller = ref(null)

  const send = async (messages, onChunk, onComplete, onError) => {
    isLoading.value = true
    controller.value = new AbortController()

    try {
      const res = await sendMessage(messages, { signal: controller.value.signal })
      isLoading.value = false
      isStreaming.value = true

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let reasoningDetails = null

      while (true) {
        const { done, value } = await reader.read()
        if (done || !isStreaming.value) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          
          const data = trimmed.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta
            
            if (delta?.reasoning) {
              onChunk?.(delta.reasoning, 'reasoning')
            }
            else if (delta?.content) {
              onChunk?.(delta.content, 'content')
            }
            
            if (delta?.reasoning_details) {
              reasoningDetails = delta.reasoning_details
            }
          } catch {}
        }
      }

      isStreaming.value = false
      onComplete?.(reasoningDetails)
    } catch (e) {
      isLoading.value = false
      isStreaming.value = false
      e.name === 'AbortError' ? onComplete?.() : onError?.(e)
    }
  }

  const stop = () => {
    controller.value?.abort()
    controller.value = null
    isStreaming.value = false
  }

  return {
    isLoading,
    isStreaming,
    sendChatMessage: send,
    stopGeneration: stop
  }
}
