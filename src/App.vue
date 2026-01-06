<template>
  <div class="flex h-screen gradient-bg p-3">
    <div class="relative z-10 flex w-full">
      <Sidebar 
        :conversations="conversations"
        :currentConversationId="currentConversationId"
        @new-chat="createNewChat"
        @select-conversation="selectConversation"
        @delete-conversation="deleteConversation"
        @show-history="showHistory = true"
      />

      <div class="flex-1 flex flex-col">
        <ChatArea 
          :messages="currentMessages"
          :isLoading="isLoading"
          :showWelcome="showWelcome"
          @send-message="handleSendMessage"
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

const conversations = ref([])
const currentConversationId = ref(null)
const isLoading = ref(false)
const showSettings = ref(false)
const showHistory = ref(false)
const currentModel = ref('GPT-4 Turbo')
const confirmDialog = ref(null)
let currentTypingTimeout = null
let isCurrentlyTyping = false

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
  if (isCurrentlyTyping && currentTypingTimeout) {
    clearTimeout(currentTypingTimeout)
    isCurrentlyTyping = false
    
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

  setTimeout(() => {
    const fullResponse = generateMockResponse(content)
    
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
    isCurrentlyTyping = true
    
    let currentIndex = 0
    let lastWordCount = 0
    const typingSpeed = 15
    
    const typeNextChar = () => {
      if (currentIndex < fullResponse.length && isCurrentlyTyping) {
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
        isCurrentlyTyping = false
        saveToLocalStorage()
      }
    }
    
    currentTypingTimeout = setTimeout(typeNextChar, 100)
  }, 1500)
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

const saveToLocalStorage = () => {
  localStorage.setItem('conversations', JSON.stringify(conversations.value))
  localStorage.setItem('currentConversationId', currentConversationId.value)
  localStorage.setItem('currentModel', currentModel.value)
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
}

onMounted(() => {
  loadFromLocalStorage()
  if (conversations.value.length === 0) {
    createNewChat()
  }
})
</script>
