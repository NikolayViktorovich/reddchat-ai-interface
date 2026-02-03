<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Mobile Header -->
    <div class="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
      <button @click="$emit('toggle-sidebar')" class="p-2 text-white hover:text-white/80 transition-colors">
        <div class="hamburger" :class="{ 'is-active': sidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div class="flex-1"></div>
      <Transition name="fade">
        <div v-if="!sidebarOpen" class="flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </Transition>
    </div>

    <!-- Programmer Mode Banner -->
    <div v-if="currentMode === 'programmer'" class="px-4 md:px-6 pt-4 pb-3">
      <div class="max-w-4xl mx-auto flex items-center justify-between bg-white/5 rounded-lg border border-white/10" style="padding: clamp(0.75rem, 1.5vw, 1rem);">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-white/10 flex items-center justify-center" style="width: clamp(1.75rem, 4vw, 2rem); height: clamp(1.75rem, 4vw, 2rem);">
            <svg class="text-white" style="width: clamp(0.875rem, 2vw, 1rem); height: clamp(0.875rem, 2vw, 1rem);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div>
            <p class="text-white font-medium" style="font-size: clamp(0.875rem, 1.5vw, 1rem);">Режим программиста</p>
            <p class="text-white/50" style="font-size: clamp(0.75rem, 1.2vw, 0.875rem);">Загружайте любые файлы кода</p>
          </div>
        </div>
        <button @click="$emit('change-mode', 'chat')" class="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" style="padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem); font-size: clamp(0.75rem, 1.2vw, 0.875rem);">Выйти</button>
      </div>
    </div>
    
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scrollbar-thin">
      <div v-if="showWelcome" class="h-full flex flex-col items-center px-4 md:px-6 pb-4 md:pb-32">
        <div class="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
          <h2 class="text-white/30 text-center font-light mb-8 md:mb-12" style="font-size: clamp(2rem, 5vw, 3rem);">
            Чем могу помочь?
          </h2>

          <div class="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 px-2">
            <button
              v-for="(prompt, index) in examplePrompts"
              :key="index"
              @click="inputMessage = prompt.full"
              class="bg-white/5 hover:bg-white/10 active:bg-white/10 text-white rounded-full border border-white/10 md:block"
              :class="index > 2 ? 'hidden md:block' : ''"
              style="padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.25rem); font-size: clamp(0.875rem, 1.5vw, 1rem);"
            >
              {{ prompt.short }}
            </button>
          </div>

          <div class="hidden md:block w-full max-w-3xl px-2 md:px-0">
            <MessageInput
              v-model="inputMessage"
              :disabled="isLoading"
              :is-generating="isGenerating"
              :file-accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'"
              @send="handleSendMessage"
              @stop="$emit('stop-generation')"
            />
          </div>
        </div>

        <div class="md:hidden w-full max-w-3xl px-2 pb-safe">
          <MessageInput
            v-model="inputMessage"
            :disabled="isLoading"
            :is-generating="isGenerating"
            :file-accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'"
            @send="handleSendMessage"
            @stop="$emit('stop-generation')"
          />
        </div>
      </div>

      <div v-else class="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <MessageBubble v-for="message in messages" :key="message.id" :message="message" />
      </div>
    </div>

    <div v-if="!showWelcome" class="input-area px-4 md:px-6 py-3 md:py-4 pb-4 md:pb-4">
      <div class="max-w-4xl mx-auto">
        <MessageInput
          v-model="inputMessage"
          :disabled="isLoading"
          :is-generating="isGenerating"
          :file-accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'"
          @send="handleSendMessage"
          @stop="$emit('stop-generation')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

const props = defineProps({
  messages: Array,
  isLoading: Boolean,
  showWelcome: Boolean,
  currentMode: String,
  isGenerating: Boolean,
  sidebarOpen: Boolean
})

const emit = defineEmits(['send-message', 'change-mode', 'stop-generation', 'toggle-sidebar'])

const inputMessage = ref('')
const messagesContainer = ref(null)
const userScrolledUp = ref(false)

const examplePrompts = [
  { short: 'Объясни алгоритм', full: 'Объясни мне подробно, как работает алгоритм быстрой сортировки' },
  { short: 'Помоги с кодом', full: 'Помоги мне разобраться с ошибкой в моем коде' },
  { short: 'Напиши функцию', full: 'Напиши функцию на Python для сортировки списка' }
]

const handleScroll = () => {
  if (!messagesContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  userScrolledUp.value = scrollHeight - scrollTop - clientHeight > 100
}

onMounted(() => { messagesContainer.value?.addEventListener('scroll', handleScroll, { passive: true }) })
onUnmounted(() => { messagesContainer.value?.removeEventListener('scroll', handleScroll) })

const handleSendMessage = (messageData) => {
  const { text, files } = messageData
  
  if (!text && !files.length) return
  
  let displayContent = text
  let apiContent = text
  
  if (files.length) {
    apiContent += '\n\nПрикрепленные файлы:\n'
    files.forEach(file => {
      apiContent += `\n--- ${file.name} ---\n${file.content}\n`
    })
  }
  
  emit('send-message', {
    displayContent,
    apiContent,
    files
  })
}

watch(() => props.messages, () => {
  nextTick(() => { 
    if (messagesContainer.value && !userScrolledUp.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })
</script>


<style scoped>
.hamburger {
  width: 20px;
  height: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background: currentColor;
  border-radius: 2px;
  transition: all 0.25s ease;
  transform-origin: center;
}

.hamburger.is-active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.is-active span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger.is-active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Mobile browser bottom bar fix */
@media (max-width: 767px) {
  .input-area {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    margin-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
    margin-bottom: env(safe-area-inset-bottom, 0px);
  }
  
  /* Fallback for Chrome Android */
  @supports not (padding-bottom: env(safe-area-inset-bottom)) {
    .input-area {
      padding-bottom: 20px;
    }
  }
}

.pb-safe {
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}

@supports not (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: 20px;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
