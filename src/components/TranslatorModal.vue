<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 class="text-2xl text-white mb-1" style="font-family: 'Space Grotesk', sans-serif;">Переводчик</h2>
            <p class="text-gray-400 text-sm">Перевод текста между языками</p>
          </div>
          <button 
            @click="$emit('close')"
            class="p-2 hover:bg-gray-800/70 rounded-xl transition-all duration-75 text-gray-400 hover:text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <div class="flex-1 flex flex-col border-r border-gray-700/30">
            <div class="p-4 border-b border-gray-700/30 flex items-center justify-between">
              <div class="relative">
                <button
                  @click="showSourceLangDropdown = !showSourceLangDropdown"
                  class="px-4 py-2 bg-gray-800/60 text-white rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all text-sm flex items-center gap-2"
                >
                  <span>{{ languages.find(l => l.code === sourceLang)?.name || 'Выберите язык' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="showSourceLangDropdown"
                    class="absolute z-10 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl max-h-80 overflow-y-auto"
                  >
                    <button
                      v-for="lang in languages"
                      :key="lang.code"
                      @click="selectSourceLang(lang.code)"
                      class="w-full px-4 py-3 text-left text-sm transition-all duration-75 hover:bg-gray-700/50"
                      :class="sourceLang === lang.code ? 'text-white bg-gray-700/30' : 'text-gray-400'"
                    >
                      {{ lang.name }}
                    </button>
                  </div>
                </transition>
              </div>
              
              <button
                @click="swapLanguages"
                class="p-2 hover:bg-gray-800/70 rounded-xl transition-all duration-75 text-gray-400 hover:text-white"
                title="Поменять языки местами"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            <div class="flex-1 p-6">
              <textarea
                v-model="sourceText"
                placeholder="Введите текст для перевода..."
                class="w-full h-full px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-base"
                @input="debouncedTranslate"
              ></textarea>
            </div>

            <div class="p-4 border-t border-gray-700/30 flex items-center justify-between">
              <p class="text-gray-500 text-xs">{{ sourceText.length }} / 5000 символов</p>
              <div class="flex gap-2">
                <button
                  @click="clearText"
                  class="px-4 py-2 bg-gray-800/60 hover:bg-gray-800/80 text-white rounded-xl transition-all duration-75 text-sm"
                >
                  Очистить
                </button>
                <button
                  @click="translateText"
                  :disabled="!sourceText.trim() || isTranslating"
                  class="px-4 py-2 rounded-xl transition-all duration-75 text-sm"
                  :class="sourceText.trim() && !isTranslating
                    ? 'bg-white hover:bg-gray-100 text-gray-900'
                    : 'bg-gray-800/40 text-gray-500 cursor-not-allowed'"
                >
                  {{ isTranslating ? 'Перевод...' : 'Перевести' }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col">
            <div class="p-4 border-b border-gray-700/30">
              <div class="relative">
                <button
                  @click="showTargetLangDropdown = !showTargetLangDropdown"
                  class="px-4 py-2 bg-gray-800/60 text-white rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all text-sm flex items-center gap-2"
                >
                  <span>{{ languages.find(l => l.code === targetLang)?.name || 'Выберите язык' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="showTargetLangDropdown"
                    class="absolute z-10 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl max-h-80 overflow-y-auto"
                  >
                    <button
                      v-for="lang in languages"
                      :key="lang.code"
                      @click="selectTargetLang(lang.code)"
                      class="w-full px-4 py-3 text-left text-sm transition-all duration-75 hover:bg-gray-700/50"
                      :class="targetLang === lang.code ? 'text-white bg-gray-700/30' : 'text-gray-400'"
                    >
                      {{ lang.name }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <div class="flex-1 p-6 overflow-y-auto">
              <div v-if="isTranslating" class="flex items-center justify-center h-full">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
                  <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
                  <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
                </div>
              </div>
              <div v-else-if="!translatedText" class="flex flex-col items-center justify-center h-full">
                <svg class="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <p class="text-gray-400 text-lg">Перевод появится здесь</p>
              </div>
              <div v-else class="text-white text-base leading-relaxed whitespace-pre-wrap">
                {{ translatedText }}
              </div>
            </div>

            <div class="p-4 border-t border-gray-700/30 flex items-center justify-end gap-2">
              <button
                v-if="translatedText"
                @click="copyTranslation"
                class="px-4 py-2 bg-gray-800/60 hover:bg-gray-800/80 text-white rounded-xl transition-all duration-75 text-sm flex items-center gap-2"
              >
                <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ copied ? 'Скопировано' : 'Копировать' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const sourceText = ref('')
const translatedText = ref('')
const sourceLang = ref('ru')
const targetLang = ref('en')
const isTranslating = ref(false)
const copied = ref(false)
const showSourceLangDropdown = ref(false)
const showTargetLangDropdown = ref(false)
let debounceTimeout = null

const languages = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'fr', name: 'Французский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'it', name: 'Итальянский' },
  { code: 'pt', name: 'Португальский' },
  { code: 'zh', name: 'Китайский' },
  { code: 'ja', name: 'Японский' },
  { code: 'ko', name: 'Корейский' },
  { code: 'ar', name: 'Арабский' },
  { code: 'tr', name: 'Турецкий' },
  { code: 'pl', name: 'Польский' },
  { code: 'uk', name: 'Украинский' },
  { code: 'nl', name: 'Нидерландский' },
  { code: 'sv', name: 'Шведский' },
  { code: 'cs', name: 'Чешский' },
  { code: 'hi', name: 'Хинди' }
]

const selectSourceLang = (code) => {
  sourceLang.value = code
  showSourceLangDropdown.value = false
  if (sourceText.value.trim()) {
    translateText()
  }
}

const selectTargetLang = (code) => {
  targetLang.value = code
  showTargetLangDropdown.value = false
  if (sourceText.value.trim()) {
    translateText()
  }
}

const swapLanguages = () => {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
  
  const tempText = sourceText.value
  sourceText.value = translatedText.value
  translatedText.value = tempText
}

const translateText = async () => {
  if (!sourceText.value.trim() || isTranslating.value) return
  
  if (sourceText.value.length > 5000) {
    alert('Максимальная длина текста: 5000 символов')
    return
  }
  
  isTranslating.value = true
  translatedText.value = ''
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText.value)}&langpair=${sourceLang.value}|${targetLang.value}`
    )
    
    if (!response.ok) {
      throw new Error('Translation API error')
    }
    
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData) {
      translatedText.value = data.responseData.translatedText
    } else {
      throw new Error('Invalid response')
    }
    
    isTranslating.value = false
  } catch (error) {
    console.error('Translation error:', error)
    
    try {
      const libreResponse = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: sourceText.value,
          source: sourceLang.value,
          target: targetLang.value,
          format: 'text'
        })
      })
      
      if (!libreResponse.ok) {
        throw new Error('LibreTranslate API error')
      }
      
      const libreData = await libreResponse.json()
      translatedText.value = libreData.translatedText
    } catch (libreError) {
      console.error('LibreTranslate error:', libreError)
      alert('Не удалось выполнить перевод. Попробуйте позже.')
    }
    
    isTranslating.value = false
  }
}

const debouncedTranslate = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(() => {
    if (sourceText.value.trim()) {
      translateText()
    }
  }, 1000)
}

const clearText = () => {
  sourceText.value = ''
  translatedText.value = ''
}

const copyTranslation = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.08s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.08s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
