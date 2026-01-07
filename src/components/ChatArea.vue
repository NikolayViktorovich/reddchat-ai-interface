<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
      <button @click="$emit('toggle-sidebar')" class="p-2 text-gray-400 active:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 class="text-white text-sm font-semibold tracking-wider" style="font-family: 'Orbitron', sans-serif;">REDDCHAT</h1>
      <div class="w-10"></div>
    </div>

    <div v-if="currentMode === 'programmer'" class="px-4 md:px-6 pt-3 pb-2">
      <div class="max-w-4xl mx-auto flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          <div>
            <p class="text-white text-sm">Режим программиста</p>
            <p class="text-gray-400 text-xs">Загружайте любые файлы кода</p>
          </div>
        </div>
        <button @click="$emit('change-mode', 'chat')" class="text-gray-400 text-xs px-3 py-1.5 bg-white/5 rounded-lg">Выйти</button>
      </div>
    </div>
    
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scrollbar-thin">
      <div v-if="showWelcome" class="h-full flex flex-col items-center justify-center px-4 md:px-6 pb-20 md:pb-32">
        <h2 class="text-3xl sm:text-5xl md:text-7xl text-white/30 mb-2 h-[50px] sm:h-[70px] md:h-[84px] flex items-center justify-center text-center" style="font-family: 'Josefin Sans', sans-serif; font-weight: 100;">
          {{ typingText }}
        </h2>

        <div class="hidden md:flex flex-wrap justify-center gap-3 max-w-4xl mb-8 mt-8 px-2">
          <button
            v-for="(prompt, index) in examplePrompts"
            :key="index"
            @click="inputMessage = prompt.full"
            class="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm rounded-full border border-white/10"
          >
            {{ prompt.short }}
          </button>
        </div>

        <div class="w-full max-w-3xl px-2 md:px-0">
          <div class="flex md:hidden flex-wrap justify-center gap-2 mb-4">
            <button
              v-for="(prompt, index) in examplePrompts.slice(0, 3)"
              :key="index"
              @click="inputMessage = prompt.full"
              class="px-3 py-1.5 bg-white/5 active:bg-white/10 text-gray-400 text-xs rounded-full border border-white/10"
            >
              {{ prompt.short }}
            </button>
          </div>
          
          <div v-if="attachedFiles.length" class="mb-3 flex flex-wrap gap-2">
            <div v-for="(file, index) in attachedFiles" :key="index" class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-white">{{ file.name }}</span>
              <button @click="removeFile(index)" class="text-gray-400 active:text-red-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="relative bg-white/5 rounded-3xl border border-white/10">
            <button @click="$refs.fileInputWelcome.click()" class="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 p-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input ref="fileInputWelcome" type="file" class="hidden" :accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'" multiple @change="handleFileSelect" />
            <input v-model="inputMessage" @keydown.enter.exact.prevent="sendMessage" type="text" placeholder="Напишите сообщение..." class="w-full pl-12 md:pl-16 pr-14 md:pr-16 py-4 md:py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm" />
            <button v-if="!isGenerating" @click="sendMessage" :disabled="!canSend" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2" :class="canSend ? 'border-white/60 text-white/60 active:bg-white/10' : 'border-white/10 text-gray-500'">
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button v-else @click="$emit('stop-generation')" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-red-500/60 text-red-500/60 active:bg-red-500/10">
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <MessageBubble v-for="message in messages" :key="message.id" :message="message" />
        <div v-if="isLoading" class="flex mb-8">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!showWelcome" class="px-4 md:px-6 py-3 md:py-4">
      <div class="max-w-4xl mx-auto">
        <div v-if="attachedFiles.length" class="mb-3 flex flex-wrap gap-2">
          <div v-for="(file, index) in attachedFiles" :key="index" class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-white">{{ file.name }}</span>
            <button @click="removeFile(index)" class="text-gray-400 active:text-red-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="relative bg-white/5 rounded-3xl border border-white/10">
          <button @click="$refs.fileInput.click()" class="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 p-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref="fileInput" type="file" class="hidden" :accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'" multiple @change="handleFileSelect" />
          <input v-model="inputMessage" @keydown.enter.exact.prevent="sendMessage" type="text" placeholder="Напишите сообщение..." class="w-full pl-12 md:pl-16 pr-14 md:pr-16 py-4 md:py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm" />
          <button v-if="!isGenerating" @click="sendMessage" :disabled="!canSend" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2" :class="canSend ? 'border-white/60 text-white/60 active:bg-white/10' : 'border-white/10 text-gray-500'">
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button v-else @click="$emit('stop-generation')" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-red-500/60 text-red-500/60 active:bg-red-500/10">
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        </div>
        <p class="text-center text-gray-500 text-xs mt-2 md:mt-3">© 2026 REDDCHAT</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  messages: Array,
  isLoading: Boolean,
  showWelcome: Boolean,
  currentMode: String,
  isGenerating: Boolean
})

const emit = defineEmits(['send-message', 'change-mode', 'stop-generation', 'toggle-sidebar'])

const inputMessage = ref('')
const messagesContainer = ref(null)
const attachedFiles = ref([])
const userScrolledUp = ref(false)

const canSend = computed(() => (inputMessage.value.trim() || attachedFiles.value.length) && !props.isLoading)

const examplePrompts = [
  { short: 'Объясни алгоритм', full: 'Объясни мне подробно, как работает алгоритм быстрой сортировки' },
  { short: 'Помоги с кодом', full: 'Помоги мне разобраться с ошибкой в моем коде' },
  { short: 'Напиши функцию', full: 'Напиши функцию на Python для сортировки списка' },
  { short: 'Оптимизируй код', full: 'Проанализируй мой код и предложи оптимизации' },
  { short: 'Объясни концепцию', full: 'Объясни концепцию замыканий в JavaScript' },
  { short: 'Сравни технологии', full: 'Сравни React и Vue для разработки веб-приложений' }
]

const typingText = ref('')
const typingWords = ['Искусственный интеллект', 'Генерация текста', 'Анализ данных', 'Помощник программиста']
let wordIdx = 0, charIdx = 0, deleting = false, timeout = null

const typeText = () => {
  const word = typingWords[wordIdx]
  if (!deleting) {
    typingText.value = word.substring(0, ++charIdx)
    if (charIdx === word.length) { deleting = true; timeout = setTimeout(typeText, 2000); return }
  } else {
    typingText.value = word.substring(0, --charIdx)
    if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % typingWords.length; timeout = setTimeout(typeText, 500); return }
  }
  timeout = setTimeout(typeText, deleting ? 50 : 100)
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  userScrolledUp.value = scrollHeight - scrollTop - clientHeight > 100
}

onMounted(() => { typeText(); messagesContainer.value?.addEventListener('scroll', handleScroll, { passive: true }) })
onUnmounted(() => { clearTimeout(timeout); messagesContainer.value?.removeEventListener('scroll', handleScroll) })

const sendMessage = () => {
  if (!canSend.value) return
  const files = [...attachedFiles.value]
  let apiContent = inputMessage.value.trim()
  if (files.length) {
    apiContent += '\n\nПрикрепленные файлы:\n'
    files.forEach(f => { apiContent += `\n--- ${f.name} ---\n${f.content}\n` })
  }
  emit('send-message', { displayContent: inputMessage.value.trim(), apiContent, files })
  inputMessage.value = ''
  attachedFiles.value = []
}

const handleFileSelect = async (e) => {
  for (const file of e.target.files) {
    const content = await new Promise((res) => {
      const r = new FileReader()
      r.onload = () => res(r.result)
      r.onerror = () => res('[Ошибка чтения]')
      file.type.startsWith('image/') ? r.readAsDataURL(file) : r.readAsText(file)
    })
    attachedFiles.value.push({ name: file.name, content, type: file.type })
  }
  e.target.value = ''
}

const removeFile = (i) => attachedFiles.value.splice(i, 1)

watch(() => props.messages, () => {
  nextTick(() => { if (messagesContainer.value && !userScrolledUp.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight })
}, { deep: true })
</script>
