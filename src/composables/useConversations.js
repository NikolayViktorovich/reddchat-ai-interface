import { ref, computed } from 'vue'
import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'

export function useConversations() {
  const conversations = ref([])
  const currentConversationId = ref(null)

  const load = () => {
    conversations.value = storage.get(STORAGE_KEYS.CONVERSATIONS, [])
    currentConversationId.value = storage.get(STORAGE_KEYS.CURRENT_CONVERSATION_ID, null)
  }

  const save = () => {
    storage.set(STORAGE_KEYS.CONVERSATIONS, conversations.value)
    storage.set(STORAGE_KEYS.CURRENT_CONVERSATION_ID, currentConversationId.value)
  }

  const current = computed(() => conversations.value.find(c => c.id === currentConversationId.value))
  const messages = computed(() => current.value?.messages || [])

  const create = () => {
    const conv = {
      id: Date.now(),
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      pinned: false
    }
    conversations.value.unshift(conv)
    currentConversationId.value = conv.id
    save()
    return conv
  }

  const select = (id) => {
    currentConversationId.value = id
    save()
  }

  const remove = (id) => {
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (currentConversationId.value === id) {
      currentConversationId.value = conversations.value[0]?.id || null
    }
    save()
  }

  const togglePin = (id) => {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.pinned = !conv.pinned
      save()
    }
  }

  const rename = (id, title) => {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.title = title
      save()
    }
  }

  const addMsg = (msg) => {
    const conv = current.value
    if (!conv) return

    conv.messages.push(msg)
    if (conv.messages.length === 1 && msg.role === 'user') {
      conv.title = msg.content.slice(0, 50) + (msg.content.length > 50 ? '...' : '')
    }
    save()
  }

  const updateLast = (updates) => {
    const conv = current.value
    if (!conv?.messages.length) return
    Object.assign(conv.messages[conv.messages.length - 1], updates)
    save()
  }

  return {
    conversations,
    currentConversationId,
    currentConversation: current,
    currentMessages: messages,
    loadConversations: load,
    saveConversations: save,
    createConversation: create,
    selectConversation: select,
    deleteConversation: remove,
    togglePin,
    renameConversation: rename,
    addMessage: addMsg,
    updateLastMessage: updateLast
  }
}
