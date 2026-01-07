<template>
  <div class="w-60 h-full glass-sidebar flex flex-col rounded-3xl border border-white/20 mr-0 lg:mr-3 font-light">
    <div class="px-5 pt-10 pb-8 text-center">
      <p class="text-3xl text-white/90 tracking-wide" style="font-family: 'Orbitron', sans-serif; font-weight: 300;">REDD</p>
      <p class="text-3xl text-white/90 tracking-wide -mt-1" style="font-family: 'Orbitron', sans-serif; font-weight: 600;">CHAT</p>
    </div>
    
    <div class="flex-1 overflow-y-auto scrollbar-thin py-2">
      <button
        @click="$emit('new-chat')"
        class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm"
      >
        <svg class="w-5 h-5 icon-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Чат</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm" @click="$emit('show-history')">
        <svg class="w-5 h-5 icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>История</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm" @click="$emit('show-image-generator')">
        <svg class="w-5 h-5 icon-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Генератор изображений</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm" @click="$emit('show-document-analyzer')">
        <svg class="w-5 h-5 icon-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Анализ</span>
      </button>

      <button 
        class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 text-sm"
        :class="currentMode === 'programmer' ? 'text-white' : 'text-gray-300 hover:text-white'"
        @click="$emit('change-mode', 'programmer')"
      >
        <svg class="w-5 h-5 icon-code" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span>Режим программиста</span>
      </button>

      <button 
        class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm"
        @click="$emit('show-translator')"
      >
        <svg class="w-5 h-5 icon-swing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>Перевод</span>
      </button>

      <div class="mt-6 px-4">
        <p class="text-xs text-gray-400 mb-2 px-3">Недавние чаты</p>
        <div
          v-for="conv in conversations.slice(0, 5)"
          :key="conv.id"
          @click="$emit('select-conversation', conv.id)"
          class="group relative mb-1 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm"
          :class="conv.id === currentConversationId 
            ? 'text-white' 
            : 'text-gray-300 hover:text-white'"
        >
          <p class="truncate">{{ conv.title }}</p>
          <button
            @click.stop="$emit('delete-conversation', conv.id)"
            class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-opacity"
          >
            <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  conversations: Array,
  currentConversationId: Number,
  currentMode: String
})

const emit = defineEmits(['new-chat', 'select-conversation', 'delete-conversation', 'show-history', 'show-image-generator', 'show-document-analyzer', 'show-translator', 'change-mode'])

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
.sidebar-btn svg {
  transition: transform 0.2s ease;
}

/* Rotate animation for + icon */
.sidebar-btn:hover .icon-rotate {
  transform: rotate(90deg);
}

/* Bounce animation for chat icon */
.sidebar-btn:hover .icon-bounce {
  animation: bounce 0.4s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Pulse animation for image icon */
.sidebar-btn:hover .icon-pulse {
  animation: pulse 0.4s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Shake animation for document icon */
.sidebar-btn:hover .icon-shake {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* Code brackets animation */
.sidebar-btn:hover .icon-code {
  animation: code 0.4s ease;
}

@keyframes code {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.1); }
}

/* Swing animation for translate icon */
.sidebar-btn:hover .icon-swing {
  animation: swing 0.4s ease;
}

@keyframes swing {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}
</style>
