<template>
  <div class="flex h-screen gradient-bg p-2 md:p-3">
    <div class="relative z-10 flex w-full">
      <div 
        v-if="sidebarOpen" 
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="sidebarOpen = false"
      ></div>
      
      <Sidebar 
        :conversations="conversations"
        :currentConversationId="currentConversationId"
        :currentMode="currentMode"
        :class="[
          'fixed lg:relative z-50 lg:z-auto transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
        @new-chat="handleNewChat"
        @select-conversation="handleSelectConversation"
        @delete-conversation="deleteConversation"
        @show-history="handleShowHistory"
        @show-image-generator="handleShowImageGenerator"
        @show-document-analyzer="handleShowDocumentAnalyzer"
        @show-translator="handleShowTranslator"
        @change-mode="handleChangeMode"
      />

      <div class="flex-1 flex flex-col w-full">
        <ChatArea 
          :messages="currentMessages"
          :isLoading="isLoading"
          :showWelcome="showWelcome"
          :currentMode="currentMode"
          :isGenerating="isCurrentlyTyping"
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
      @close="showSettings = false"
      @update-model="updateModel"
    />

    <HistoryModal
      :isOpen="showHistory"
      :conversations="conversations"
      :currentConversationId="currentConversationId"
      @close="showHistory = false"
      @select-conversation="selectConversation"
      @delete-conversation="deleteConversation"
    />

    <ConfirmDialog ref="confirmDialog" />

    <ImageGeneratorModal
      :isOpen="showImageGenerator"
      @close="showImageGenerator = false"
    />

    <DocumentAnalyzerModal
      :isOpen="showDocumentAnalyzer"
      @close="showDocumentAnalyzer = false"
    />

    <TranslatorModal
      :isOpen="showTranslator"
      @close="showTranslator = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content,
    timestamp: new Date()
  }

  conv.messages.push(userMessage)

  if (conv.messages.length === 1) {
    conv.title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
  }

  isLoading.value = true
  saveToLocalStorage()

  try {
    const systemPrompt = {
      role: 'system',
      content: 'Ты полезный AI-ассистент. Отвечай на русском языке. Используй Markdown форматирование: заголовки (##), списки (- или 1.), **жирный**, *курсив*, `код`, ```блоки кода с указанием языка```. Структурируй ответы для лучшей читаемости.'
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: 'mistralai/devstral-2512:free',
        messages: [
          systemPrompt,
          ...conv.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ]
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error')
    }
    
    const fullResponse = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.'
    
    const aiMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      displayContent: '',
      timestamp: new Date(),
      isTyping: true,
      isStopped: false,
      wordCount: 0
    }
    conv.messages.push(aiMessage)
    isLoading.value = false
    isCurrentlyTyping.value = true
    
    let currentIndex = 0
    let lastWordCount = 0
    const typingSpeed = 15
    
    const typeNextChar = () => {
      if (currentIndex < fullResponse.length && isCurrentlyTyping.value) {
        const messageIndex = conv.messages.findIndex(m => m.id === aiMessage.id)
        if (messageIndex !== -1) {
          const currentText = fullResponse.substring(0, currentIndex + 1)
          conv.messages[messageIndex].content = currentText
          
          const wordCount = currentText.trim().split(/\s+/).length
          if (wordCount > lastWordCount) {
            conv.messages[messageIndex].wordCount = wordCount
            lastWordCount = wordCount
          }
        }
        currentIndex++
        currentTypingTimeout = setTimeout(typeNextChar, typingSpeed)
      } else {
        const messageIndex = conv.messages.findIndex(m => m.id === aiMessage.id)
        if (messageIndex !== -1) {
          conv.messages[messageIndex].isTyping = false
        }
        isCurrentlyTyping.value = false
        saveToLocalStorage()
      }
    }
    
    currentTypingTimeout = setTimeout(typeNextChar, 100)
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

const generateMockResponse = (userInput) => {
  const responses = [
    `Отличный вопрос! Давайте разберем это подробнее.\n\nВот несколько ключевых моментов:\n\n1. **Первый аспект**: Это важно учитывать при работе с данной темой\n2. **Второй аспект**: Здесь нужно обратить внимание на детали\n3. **Третий аспект**: Это поможет вам лучше понять концепцию\n\nЕсли нужны дополнительные разъяснения, спрашивайте!`,
    
    `Понимаю ваш запрос. Вот что я могу предложить:\n\n\`\`\`javascript\nconst example = () => {\n  console.log('Пример кода');\n  return 'Результат';\n}\n\`\`\`\n\nЭтот код демонстрирует базовый подход к решению задачи.`,
    
    `Интересная тема! Позвольте мне объяснить:\n\n> Ключевая идея заключается в том, что нужно учитывать контекст и специфику вашей задачи.\n\nОсновные рекомендации:\n- Начните с простого\n- Тестируйте каждый шаг\n- Документируйте процесс\n\nЧто именно вас интересует больше всего?`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
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
  loadFromLocalStorage()
  if (conversations.value.length === 0) {
    createNewChat()
  }
})
</script>
