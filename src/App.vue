<template>
  <div class="flex h-screen h-[100dvh] gradient-bg p-2 md:p-3">
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
          ref="sidebarRef"
          v-show="sidebarOpen || isDesktop"
          :conversations="conversations"
          :currentConversationId="currentConversationId"
          :currentMode="currentMode"
          class="fixed lg:relative z-50 lg:z-auto"
          @new-chat="handleNewChat"
          @select-conversation="handleSelectConversation"
          @delete-conversation="handleDeleteConversation"
          @show-history="handleShowHistory"
          @show-translator="handleShowTranslator"
          @change-mode="handleChangeMode"
          @pin-conversation="pinConversation"
          @rename-conversation="renameConversation"
        />
      </Transition>

      <div class="flex-1 flex flex-col w-full">
        <ChatArea 
          :messages="currentMessages"
          :isLoading="isLoading"
          :showWelcome="showWelcome"
          :currentMode="currentMode"
          :isGenerating="isStreaming"
          :sidebarOpen="sidebarOpen"
          @send-message="handleSendMessage"
          @change-mode="handleChangeMode"
          @stop-generation="handleStopGeneration"
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
      @select-conversation="handleSelectConversation"
      @delete-conversation="handleDeleteConversation"
      @pin-conversation="pinConversation"
      @rename-conversation="handleRenameConversation"
    />

    <ConfirmDialog ref="confirmDialog" />

    <TranslatorModal
      :isOpen="showTranslator"
      @close="closeTranslator"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ChatArea from './components/ChatArea.vue'
import HistoryModal from './components/HistoryModal.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import TranslatorModal from './components/TranslatorModal.vue'
import { useConversations } from './composables/useConversations'
import { useChat } from './composables/useChat'
import { storage } from './utils/storage'
import { STORAGE_KEYS, MODES } from './constants'

const {
  conversations,
  currentConversationId,
  currentMessages,
  loadConversations,
  createConversation,
  selectConversation,
  deleteConversation,
  togglePin,
  renameConversation,
  addMessage,
  updateLastMessage
} = useConversations()

const { isLoading, isStreaming, sendChatMessage, stopGeneration } = useChat()

const showSettings = ref(false)
const showHistory = ref(false)
const showTranslator = ref(false)
const currentModel = ref('GPT-4 Turbo')
const currentMode = ref(MODES.CHAT)
const confirmDialog = ref(null)
const sidebarOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 1024)
const sidebarRef = ref(null)

const showWelcome = computed(() => !currentMessages.value.length)

const handleResize = () => isDesktop.value = window.innerWidth >= 1024

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadConversations()
  currentModel.value = storage.get(STORAGE_KEYS.CURRENT_MODEL, 'GPT-4 Turbo')
  currentMode.value = storage.get(STORAGE_KEYS.CURRENT_MODE, MODES.CHAT)
  if (!conversations.value.length) createConversation()
})

onUnmounted(() => window.removeEventListener('resize', handleResize))

const closeSidebar = () => sidebarOpen.value = false

const handleNewChat = () => {
  createConversation()
  closeSidebar()
}

const handleSelectConversation = (id) => {
  selectConversation(id)
  closeSidebar()
}

const handleShowHistory = () => {
  showHistory.value = true
  closeSidebar()
}

const handleShowTranslator = () => {
  showTranslator.value = true
  closeSidebar()
}

const handleChangeMode = (mode) => {
  currentMode.value = mode
  storage.set(STORAGE_KEYS.CURRENT_MODE, mode)
  closeSidebar()
}

const closeSettings = () => {
  showSettings.value = false
  sidebarOpen.value = false
  sidebarRef.value?.closeMenus()
}

const closeHistory = () => {
  showHistory.value = false
  sidebarOpen.value = false
  sidebarRef.value?.closeMenus()
}

const closeTranslator = () => {
  showTranslator.value = false
  sidebarOpen.value = false
  sidebarRef.value?.closeMenus()
}

const pinConversation = (id) => togglePin(id)

const handleRenameConversation = ({ id, title }) => renameConversation(id, title)

const handleDeleteConversation = async (id) => {
  const ok = await confirmDialog.value.show(
    'Удалить диалог?',
    'Вы уверены, что хотите удалить этот диалог? Это действие нельзя отменить.',
    'delete_conversation'
  )
  if (ok) deleteConversation(id)
}

const handleSendMessage = async (content) => {
  if (isStreaming.value) stopGeneration()
  if (!currentConversationId.value) createConversation()

  const isObj = typeof content === 'object'
  const displayContent = isObj ? content.displayContent : content
  const apiContent = isObj ? content.apiContent : content
  const files = isObj ? content.files : []

  addMessage({
    id: Date.now(),
    role: 'user',
    content: displayContent,
    apiContent,
    files,
    timestamp: new Date()
  })

  const aiMsg = {
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    reasoning: '',
    timestamp: new Date(),
    isTyping: true,
    isStopped: false
  }
  
  addMessage(aiMsg)

  await sendChatMessage(
    currentMessages.value,
    (chunk, type) => {
      if (type === 'reasoning') {
        aiMsg.reasoning += chunk
        updateLastMessage({ reasoning: aiMsg.reasoning })
      } else {
        aiMsg.content += chunk
        updateLastMessage({ content: aiMsg.content })
      }
    },
    (reasoningDetails) => {
      if (reasoningDetails) {
        updateLastMessage({ isTyping: false, reasoning_details: reasoningDetails })
      } else {
        updateLastMessage({ isTyping: false })
      }
    },
    e => {
      console.error('Chat error:', e)
      updateLastMessage({ content: `Ошибка: ${e.message}`, isTyping: false })
    }
  )
}

const handleStopGeneration = () => {
  stopGeneration()
  updateLastMessage({ isTyping: false, isStopped: true })
}

const updateModel = m => {
  currentModel.value = m
  storage.set(STORAGE_KEYS.CURRENT_MODEL, m)
}
</script>