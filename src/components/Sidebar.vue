<template>
  <div class="w-72 bg-gray-900/50 backdrop-blur-sm flex flex-col h-full rounded-3xl border border-gray-700/50 mr-3">
    <div class="flex-1 overflow-y-auto scrollbar-thin py-2 pt-4">
      <button
        @click="$emit('new-chat')"
        class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Новый чат</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm" @click="$emit('show-history')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>История диалогов</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm" @click="$emit('show-image-generator')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Генерация изображений</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm" @click="$emit('show-document-analyzer')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Анализ документов</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span>Помощник программиста</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>Переводчик</span>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-800/70 hover:text-white active:bg-gray-800/90 transition-all duration-75 text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Библиотека шаблонов</span>
      </button>

      <div class="mt-6 px-4">
        <p class="text-xs text-gray-500 mb-2 px-3">Недавние чаты</p>
        <div
          v-for="conv in conversations.slice(0, 5)"
          :key="conv.id"
          @click="$emit('select-conversation', conv.id)"
          class="group relative mb-1 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm"
          :class="conv.id === currentConversationId 
            ? 'bg-gray-800/70 text-white' 
            : 'hover:bg-gray-800/50 text-gray-400'"
        >
          <p class="truncate">{{ conv.title }}</p>
          <button
            @click.stop="$emit('delete-conversation', conv.id)"
            class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
          >
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="p-4 mb-3">
        <p class="text-white text-base font-semibold mb-1">Премиум возможности</p>
        <p class="text-white text-base font-bold mb-3">REDDCHAT Pro</p>
        <p class="text-gray-400 text-sm mb-4 leading-relaxed">Безлимитные запросы, генерация изображений, анализ кода и документов, приоритетная поддержка</p>
        <button class="w-full bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold py-3 rounded-2xl transition-all duration-75 shadow-lg">
          Активировать Pro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  conversations: Array,
  currentConversationId: Number
})

const emit = defineEmits(['new-chat', 'select-conversation', 'delete-conversation', 'show-history', 'show-image-generator', 'show-document-analyzer'])

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
