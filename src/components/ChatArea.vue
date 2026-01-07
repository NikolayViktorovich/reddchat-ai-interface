<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <transition name="mode-indicator">
      <div v-if="currentMode === 'programmer'" class="px-6 pt-4 pb-2">
        <div class="max-w-4xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
          <div class="flex items-center gap-3">
            <div>
              <p class="text-white text-sm">Режим программиста</p>
              <p class="text-gray-400 text-xs">Можно загружать файлы кода</p>
            </div>
          </div>
          <button 
            @click="$emit('change-mode', 'chat')"
            class="text-gray-400 hover:text-white text-xs transition-all duration-75"
          >
            Выйти
          </button>
        </div>
      </div>
    </transition>
    
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scrollbar-thin">
      <div v-if="showWelcome" class="h-full flex flex-col items-center justify-center px-6 pb-32">
        <h2 class="text-7xl text-white/30 mb-2 h-[84px] flex items-center justify-center" style="font-family: 'Josefin Sans', sans-serif; font-weight: 100; letter-spacing: -0.02em; line-height: 1.2;">
          {{ typingText }}
        </h2>

        <div class="flex flex-wrap justify-center gap-3 max-w-4xl mb-8 mt-8">
          <button
            v-for="(prompt, index) in examplePrompts"
            :key="index"
            @click="$emit('send-message', prompt)"
            class="px-4 py-2 bg-white/5 hover:bg-white/5 text-gray-300 text-sm rounded-full transition-all backdrop-blur-sm border border-white/10"
          >
            {{ prompt }}
          </button>
        </div>

        <div class="w-full max-w-3xl">
          <div v-if="attachedFiles.length > 0" class="mb-3 flex flex-wrap gap-2">
            <div
              v-for="(file, index) in attachedFiles"
              :key="index"
              class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-white">{{ file.name }}</span>
              <button
                @click="removeFile(index)"
                class="text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
            <button 
              @click="$refs.fileInputWelcome.click()"
              class="absolute left-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5/50 rounded-xl transition-colors"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              ref="fileInputWelcome"
              type="file"
              class="hidden"
              :accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'"
              multiple
              @change="handleFileSelect"
            />
            
            <input
              v-model="inputMessage"
              @keydown.enter.exact.prevent="sendMessage"
              type="text"
              placeholder="Напишите сообщение..."
              class="w-full pl-16 pr-16 py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
            />
            
            <button 
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-75"
              :class="inputMessage.trim() && !isLoading
                ? 'border-2 border-white/60 text-white/60 hover:bg-white/10 hover:border-white hover:text-white'
                : 'border-2 border-white/10 text-gray-500 cursor-not-allowed'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-8 mt-12">
          <button class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span>REDD AI</span>
          </button>
          <button class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Изображения</span>
          </button>
          <button class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Код</span>
          </button>
          <button class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Документы</span>
          </button>
        </div>
      </div>

      <div v-else class="max-w-4xl mx-auto px-6 py-6">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />

        <div v-if="isLoading" class="flex mb-8 animate-fade-in">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
            <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!showWelcome" class="px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <div v-if="attachedFiles.length > 0" class="mb-3 flex flex-wrap gap-2">
          <div
            v-for="(file, index) in attachedFiles"
            :key="index"
            class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-white">{{ file.name }}</span>
            <button
              @click="removeFile(index)"
              class="text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
          <button 
            @click="$refs.fileInput.click()"
            class="absolute left-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5/50 rounded-xl transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="currentMode === 'programmer' ? '*' : 'image/*,.pdf,.doc,.docx,.txt,.md'"
            multiple
            @change="handleFileSelect"
          />
          
          <input
            v-model="inputMessage"
            @keydown.enter.exact.prevent="sendMessage"
            type="text"
            placeholder="Напишите сообщение..."
            class="w-full pl-16 pr-16 py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
          />
          
          <button 
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-75"
            :class="inputMessage.trim() && !isLoading
              ? 'border-2 border-white/60 text-white/60 hover:bg-white/10 hover:border-white hover:text-white'
              : 'border-2 border-white/10 text-gray-500 cursor-not-allowed'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        <p class="text-center text-gray-500 text-xs mt-3">
          © 2026 REDDCHAT. Все права защищены. Проект создан в образовательных целях.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  messages: Array,
  isLoading: Boolean,
  showWelcome: Boolean,
  currentMode: String
})

const emit = defineEmits(['send-message', 'change-mode'])

const inputMessage = ref('')
const messagesContainer = ref(null)
const attachedFiles = ref([])
const fileInput = ref(null)
const fileInputWelcome = ref(null)

const examplePrompts = [
  'Объясни алгоритм сортировки',
  'Помоги с домашним заданием',
  'Напиши функцию на Python',
  'Разбери эту ошибку в коде',
  'Подготовь конспект лекции',
  'Оптимизируй этот код'
]

const typingText = ref('')
const typingWords = [
  'Искусственный интеллект',
  'Генерация текста',
  'Анализ данных',
  'Помощник программиста',
  'Творческие идеи',
  'Обучение и развитие'
]
let currentWordIndex = 0
let currentCharIndex = 0
let isDeleting = false
let typingTimeout = null

const typeText = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  const currentWord = typingWords[currentWordIndex]
  
  if (!isDeleting) {
    typingText.value = currentWord.substring(0, currentCharIndex + 1)
    currentCharIndex++
    
    if (currentCharIndex === currentWord.length) {
      isDeleting = true
      typingTimeout = setTimeout(typeText, 2000)
      return
    }
    typingTimeout = setTimeout(typeText, 100)
  } else {
    typingText.value = currentWord.substring(0, currentCharIndex - 1)
    currentCharIndex--
    
    if (currentCharIndex === 0) {
      isDeleting = false
      currentWordIndex = (currentWordIndex + 1) % typingWords.length
      typingTimeout = setTimeout(typeText, 500)
      return
    }
    typingTimeout = setTimeout(typeText, 50)
  }
}

onMounted(() => {
  typeText()
})

onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

const sendMessage = () => {
  if (inputMessage.value.trim() && !props.isLoading) {
    let messageContent = inputMessage.value.trim()
    
    if (attachedFiles.value.length > 0) {
      messageContent += '\n\n📎 Прикрепленные файлы:\n'
      attachedFiles.value.forEach(file => {
        messageContent += `- ${file.name}\n`
      })
    }
    
    emit('send-message', messageContent)
    inputMessage.value = ''
    attachedFiles.value = []
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  attachedFiles.value.push(...files)
}

const removeFile = (index) => {
  attachedFiles.value.splice(index, 1)
}

watch(() => props.messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true })
</script>


<style scoped>
.mode-indicator-enter-active,
.mode-indicator-leave-active {
  transition: all 0.08s ease;
}

.mode-indicator-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.mode-indicator-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
