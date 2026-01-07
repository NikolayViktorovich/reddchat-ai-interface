<template>
  <div class="flex h-screen gradient-bg p-2 md:p-3">
    <div class="relative z-10 flex w-full">
      <Transition name="overlay">
        <div 
          v-if="sidebarOpen" 
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="sidebarOpen = false"
        ></div>
      </Transition>
      
      <Transition name="sidebar">
        <Sidebar 
          v-show="sidebarOpen || isDesktop"
          :conversations="conversations"
          :currentConversationId="currentConversationId"
          :currentMode="currentMode"
          class="fixed lg:relative z-50 lg:z-auto"
          @new-chat="handleNewChat"
          @select-conversation="handleSelectConversation"
          @delete-conversation="deleteConversation"
          @show-history="handleShowHistory"
          @show-image-generator="handleShowImageGenerator"
          @show-document-analyzer="handleShowDocumentAnalyzer"
          @show-translator="handleShowTranslator"
          @change-mode="handleChangeMode"
        />
      </Transition>

      <div class="flex-1 flex flex-col w-full">
        <ChatArea 
          :messages="currentMessages"
          :isLoading="isLoading"
          :showWelcome="showWelcome"
          :currentMode="currentMode"
          :isGenerating="isCurrentlyTyping"
          :sidebarOpen="sidebarOpen"
          @send-message="handleSendMessage"
          @change-mode="changeMode"
          @stop-generation="stopGeneration"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>
    </div>

    <SettingsModal 
      v-if="showSettings"
      :currentModel="currentModel"
      @close="closeSettings"
      @update-model="updateModel"
    />

    <HistoryModal
      :isOpen="showHistory"
      :conversations="conversations"
      :currentConversationId="currentConversationId"
      @close="closeHistory"
      @select-conversation="selectConversation"
      @delete-conversation="deleteConversation"
    />

    <ConfirmDialog ref="confirmDialog" />

    <ImageGeneratorModal
      :isOpen="showImageGenerator"
      @close="closeImageGenerator"
    />

    <DocumentAnalyzerModal
      :isOpen="showDocumentAnalyzer"
      @close="closeDocumentAnalyzer"
    />

    <TranslatorModal
      :isOpen="showTranslator"
      @close="closeTranslator"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ChatArea from './components/ChatArea.vue'
import SettingsModal from './components/SettingsModal.vue'
import HistoryModal from './components/HistoryModal.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ImageGeneratorModal from './components/ImageGeneratorModal.vue'
import DocumentAnalyzerModal from './components/DocumentAnalyzerModal.vue'
import TranslatorModal from './components/TranslatorModal.vue'

const conversations = ref([])
const currentConversationId = ref(null)
const isLoading = ref(false)
const showSettings = ref(false)
const showHistory = ref(false)
const showImageGenerator = ref(false)
const showDocumentAnalyzer = ref(false)
const showTranslator = ref(false)
const currentModel = ref('GPT-4 Turbo')
const currentMode = ref('chat')
const confirmDialog = ref(null)
let currentTypingTimeout = null
const isCurrentlyTyping = ref(false)
const sidebarOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 1024)

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadFromLocalStorage()
  if (conversations.value.length === 0) {
    createNewChat()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const currentMessages = computed(() => {
  const conv = conversations.value.find(c => c.id === currentConversationId.value)
  return conv ? conv.messages : []
})

const showWelcome = computed(() => {
  return currentMessages.value.length === 0
})

const createNewChat = () => {
  const newConv = {
    id: Date.now(),
    title: 'Новый чат',
    messages: [],
    createdAt: new Date()
  }
  conversations.value.unshift(newConv)
  currentConversationId.value = newConv.id
  saveToLocalStorage()
}

const handleNewChat = () => {
  createNewChat()
  sidebarOpen.value = false
}

const handleSelectConversation = (id) => {
  selectConversation(id)
  sidebarOpen.value = false
}

const handleShowHistory = () => {
  showHistory.value = true
  sidebarOpen.value = false
}

const handleShowImageGenerator = () => {
  showImageGenerator.value = true
  sidebarOpen.value = false
}

const handleShowDocumentAnalyzer = () => {
  showDocumentAnalyzer.value = true
  sidebarOpen.value = false
}

const handleShowTranslator = () => {
  showTranslator.value = true
  sidebarOpen.value = false
}

const handleChangeMode = (mode) => {
  changeMode(mode)
  sidebarOpen.value = false
}

const closeSettings = () => {
  showSettings.value = false
  sidebarOpen.value = false
}

const closeHistory = () => {
  showHistory.value = false
  sidebarOpen.value = false
}

const closeImageGenerator = () => {
  showImageGenerator.value = false
  sidebarOpen.value = false
}

const closeDocumentAnalyzer = () => {
  showDocumentAnalyzer.value = false
  sidebarOpen.value = false
}

const closeTranslator = () => {
  showTranslator.value = false
  sidebarOpen.value = false
}

const selectConversation = (id) => {
  currentConversationId.value = id
}

const deleteConversation = async (id) => {
  const confirmed = await confirmDialog.value.show(
    'Удалить диалог?',
    'Вы уверены, что хотите удалить этот диалог? Это действие нельзя отменить.',
    'delete_conversation'
  )
  
  if (confirmed) {
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (currentConversationId.value === id) {
      currentConversationId.value = conversations.value[0]?.id || null
    }
    saveToLocalStorage()
  }
}

const handleSendMessage = async (content) => {
  if (isCurrentlyTyping.value && currentTypingTimeout) {
    clearTimeout(currentTypingTimeout)
    isCurrentlyTyping.value = false
    
    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      const lastMessage = conv.messages[conv.messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isTyping) {
        lastMessage.isTyping = false
        lastMessage.isStopped = true
      }
    }
  }
  
  if (!currentConversationId.value) {
    createNewChat()
  }

  const conv = conversations.value.find(c => c.id === currentConversationId.value)
  if (!conv) return

  const displayContent = typeof content === 'object' ? content.displayContent : content
  const apiContent = typeof content === 'object' ? content.apiContent : content
  const files = typeof content === 'object' ? content.files : []

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: displayContent,
    apiContent: apiContent,
    files: files,
    timestamp: new Date()
  }

  conv.messages.push(userMessage)

  if (conv.messages.length === 1) {
    conv.title = displayContent.slice(0, 50) + (displayContent.length > 50 ? '...' : '')
  }

  isLoading.value = true
  saveToLocalStorage()

  try {
    const systemPrompt = {
      role: 'system',
      content: 'Ты полезный и профессиональный AI-ассистент. Отвечай на русском языке. Используй Markdown форматирование: заголовки (##), списки (- или 1.), **жирный**, *курсив*, `код`, ```блоки кода с указанием языка```. Структурируй ответы для лучшей читаемости.'
    }
    
    const apiMessages = [
      systemPrompt,
      ...conv.messages.map(m => ({ 
        role: m.role, 
        content: m.apiContent || m.content 
      }))
    ]
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://reddchat-ai-interface.vercel.app',
        'X-Title': 'AI Chat',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nex-agi/deepseek-v3.1-nex-n1:free',
        messages: apiMessages,
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'API Error')
    }

    const aiMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
      isStopped: false
    }
    conv.messages.push(aiMessage)
    isLoading.value = false
    isCurrentlyTyping.value = true

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done || !isCurrentlyTyping.value) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              const messageIndex = conv.messages.findIndex(m => m.id === aiMessage.id)
              if (messageIndex !== -1) {
                conv.messages[messageIndex].content += content
              }
            }
          } catch (e) {}
        }
      }
    }

    const messageIndex = conv.messages.findIndex(m => m.id === aiMessage.id)
    if (messageIndex !== -1) {
      conv.messages[messageIndex].isTyping = false
    }
    isCurrentlyTyping.value = false
    saveToLocalStorage()
  } catch (error) {
    console.error('API Error:', error)
    isLoading.value = false
    
    const errorMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: `Ошибка: ${error.message}`,
      timestamp: new Date(),
      isTyping: false
    }
    conv.messages.push(errorMessage)
    saveToLocalStorage()
  }
}

const stopGeneration = () => {
  if (currentTypingTimeout) {
    clearTimeout(currentTypingTimeout)
    currentTypingTimeout = null
  }
  
  const conv = conversations.value.find(c => c.id === currentConversationId.value)
  if (conv) {
    const lastMessage = conv.messages[conv.messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isTyping) {
      lastMessage.isTyping = false
      lastMessage.isStopped = true
    }
  }
  
  isCurrentlyTyping.value = false
  saveToLocalStorage()
}

const updateModel = (model) => {
  currentModel.value = model
  saveToLocalStorage()
}

const changeMode = (mode) => {
  currentMode.value = mode
  saveToLocalStorage()
}

const saveToLocalStorage = () => {
  localStorage.setItem('conversations', JSON.stringify(conversations.value))
  localStorage.setItem('currentConversationId', currentConversationId.value)
  localStorage.setItem('currentModel', currentModel.value)
  localStorage.setItem('currentMode', currentMode.value)
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('conversations')
  if (saved) {
    conversations.value = JSON.parse(saved)
  }
  
  const savedId = localStorage.getItem('currentConversationId')
  if (savedId) {
    currentConversationId.value = parseInt(savedId)
  }
  
  const savedModel = localStorage.getItem('currentModel')
  if (savedModel) {
    currentModel.value = savedModel
  }
  
  const savedMode = localStorage.getItem('currentMode')
  if (savedMode) {
    currentMode.value = savedMode
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadFromLocalStorage()
  if (conversations.value.length === 0) {
    createNewChat()
  }
})
</script>