<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1a1a1d] w-full md:max-w-7xl h-[90vh] md:h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 flex flex-col md:flex-row shadow-2xl overflow-hidden">
        
        <div class="md:hidden flex items-center justify-between p-4 border-b border-white/10">
          <h2 class="text-lg text-white font-medium">История диалогов</h2>
          <button @click="$emit('close')" class="p-2 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="md:hidden flex-1 flex flex-col overflow-hidden">
          <div class="p-3 border-b border-white/10">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск..."
                class="w-full pl-10 pr-3 py-2.5 bg-white/5 text-white text-sm placeholder-gray-400 rounded-xl border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          <div v-if="!mobileSelectedConv" class="flex-1 overflow-y-auto">
            <div v-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center h-full p-6">
              <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p class="text-gray-400 text-sm">{{ searchQuery ? 'Ничего не найдено' : 'История пуста' }}</p>
            </div>

            <div v-else class="divide-y divide-white/5">
              <div
                v-for="conv in filteredConversations"
                :key="conv.id"
                class="flex items-center justify-between p-4 active:bg-white/5"
                @click="mobileSelectedConv = conv"
              >
                <div class="flex-1 min-w-0 mr-3">
                  <h3 class="text-white text-sm truncate">{{ conv.title }}</h3>
                  <p class="text-gray-500 text-xs mt-1">{{ formatDate(conv.createdAt) }} • {{ conv.messages.length }} сообщ.</p>
                </div>
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center gap-3 p-4 border-b border-white/10">
              <button @click="mobileSelectedConv = null" class="p-1 text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="flex-1 min-w-0">
                <h3 class="text-white text-sm truncate">{{ mobileSelectedConv.title }}</h3>
                <p class="text-gray-500 text-xs">{{ formatDate(mobileSelectedConv.createdAt) }}</p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-for="message in mobileSelectedConv.messages"
                :key="message.id"
                class="flex gap-2"
                :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-3 py-2 text-sm"
                  :class="message.role === 'user' ? 'bg-white/10 text-white' : 'bg-white/5 text-white'"
                >
                  {{ message.content }}
                </div>
              </div>
            </div>

            <div class="p-4 border-t border-white/10">
              <button
                @click="openMobileConversation"
                class="w-full py-3 bg-white/10 text-white rounded-2xl text-sm font-medium"
              >
                Открыть диалог
              </button>
            </div>
          </div>
        </div>

        <div class="hidden md:flex w-96 flex-col border-r border-white/10">
          <div class="p-6 border-b border-white/10">
            <h2 class="text-xl text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">История диалогов</h2>
            <p class="text-gray-400 text-sm">Всего: {{ conversations.length }}</p>
          </div>

          <div class="p-4 border-b border-white/10">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск..."
                class="w-full pl-10 pr-3 py-2 bg-white/5 text-white text-sm placeholder-gray-400 rounded-xl border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-3">
            <div v-if="filteredConversations.length === 0" class="text-center py-12">
              <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p class="text-gray-400 text-sm">{{ searchQuery ? 'Ничего не найдено' : 'История пуста' }}</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="conv in filteredConversations"
                :key="conv.id"
                class="group relative bg-transparent hover:bg-white/5 rounded-xl p-3 cursor-pointer transition-all duration-75"
                :class="{ 'bg-white/10': conv.id === selectedConvId }"
                @click="selectedConvId = conv.id"
                @dblclick="openConversation"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-white text-sm mb-1 truncate">{{ conv.title }}</h3>
                    <p class="text-gray-400 text-xs mb-1">{{ formatDate(conv.createdAt) }}</p>
                    <p class="text-gray-500 text-xs">{{ conv.messages.length }} сообщений</p>
                  </div>
                  <button
                    @click.stop="deleteConversation(conv.id)"
                    class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-red-400"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden md:flex flex-1 flex-col">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <div v-if="selectedConversation">
              <h2 class="text-xl text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">{{ selectedConversation.title }}</h2>
              <p class="text-gray-400 text-sm">{{ formatDate(selectedConversation.createdAt) }}</p>
            </div>
            <div v-else>
              <h2 class="text-xl text-white" style="font-family: 'Space Grotesk', sans-serif;">Предпросмотр</h2>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div v-if="!selectedConversation" class="flex flex-col items-center justify-center h-full">
              <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p class="text-gray-400 text-lg">Выбери разговор для предпросмотра</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="message in selectedConversation.messages"
                :key="message.id"
                class="flex gap-3"
                :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  v-if="message.role === 'assistant'"
                  class="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                >
                  <svg class="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div class="max-w-2xl rounded-2xl px-4 py-3 bg-white/5 text-white">
                  <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                </div>
                <div
                  v-if="message.role === 'user'"
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  conversations: Array,
  currentConversationId: Number
})

const emit = defineEmits(['close', 'select-conversation', 'delete-conversation'])

const searchQuery = ref('')
const selectedConvId = ref(null)
const mobileSelectedConv = ref(null)

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return props.conversations
  const query = searchQuery.value.toLowerCase()
  return props.conversations.filter(conv => 
    conv.title.toLowerCase().includes(query) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(query))
  )
})

const selectedConversation = computed(() => {
  return props.conversations.find(c => c.id === selectedConvId.value)
})

const openConversation = () => {
  if (selectedConvId.value) {
    emit('select-conversation', selectedConvId.value)
    emit('close')
  }
}

const openMobileConversation = () => {
  if (mobileSelectedConv.value) {
    emit('select-conversation', mobileSelectedConv.value.id)
    emit('close')
    mobileSelectedConv.value = null
  }
}

const deleteConversation = (id) => {
  emit('delete-conversation', id)
  if (selectedConvId.value === id) selectedConvId.value = null
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.1s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>
