<template>
  <Transition name="modal">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6"
      @click.self="$emit('close')"
    >
      <div class="modal-content glass-modal w-full md:max-w-6xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/5 flex flex-col shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-white/5">
        <h2 class="text-lg text-white font-medium">Переводчик</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="md:hidden flex-1 flex flex-col overflow-hidden relative">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button @click="showSourceLangDropdown = !showSourceLangDropdown" class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-white text-sm">
            {{ languages.find(l => l.code === sourceLang)?.name }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button @click="swapLanguages" class="p-2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </button>
          <button @click="showTargetLangDropdown = !showTargetLangDropdown" class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-white text-sm">
            {{ languages.find(l => l.code === targetLang)?.name }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="flex-1 p-4 border-b border-white/5">
            <textarea v-model="sourceText" placeholder="Введите текст..." class="w-full h-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-base" @input="debouncedTranslate"></textarea>
          </div>
          <div class="flex-1 p-4 bg-white/5">
            <div v-if="isTranslating" class="flex items-center justify-center h-full">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-1"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-2"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-3"></div>
              </div>
            </div>
            <div v-else-if="!translatedText" class="flex items-center justify-center h-full">
              <p class="text-gray-500 text-sm">Перевод появится здесь</p>
            </div>
            <div v-else class="text-white text-base">{{ translatedText }}</div>
          </div>
        </div>

        <div v-if="translatedText" class="p-4 border-t border-white/5">
          <button @click="copyTranslation" class="w-full py-3 bg-white/10 text-white rounded-2xl text-sm font-medium">{{ copied ? 'Скопировано!' : 'Копировать перевод' }}</button>
        </div>

        <div v-if="showSourceLangDropdown" class="absolute inset-x-0 bottom-0 bg-[#1a1a1d] rounded-t-3xl border-t border-white/5 max-h-[60vh] overflow-y-auto z-10 animate-slide-up">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <span class="text-white font-medium">Исходный язык</span>
            <button @click="showSourceLangDropdown = false" class="p-2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="divide-y divide-white/5">
            <button v-for="lang in languages" :key="lang.code" @click="selectSourceLang(lang.code)" class="w-full px-4 py-3 text-left text-sm" :class="sourceLang === lang.code ? 'text-white bg-white/5' : 'text-gray-400'">{{ lang.name }}</button>
          </div>
        </div>

        <div v-if="showTargetLangDropdown" class="absolute inset-x-0 bottom-0 bg-[#1a1a1d] rounded-t-3xl border-t border-white/5 max-h-[60vh] overflow-y-auto z-10 animate-slide-up">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <span class="text-white font-medium">Язык перевода</span>
            <button @click="showTargetLangDropdown = false" class="p-2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="divide-y divide-white/5">
            <button v-for="lang in languages" :key="lang.code" @click="selectTargetLang(lang.code)" class="w-full px-4 py-3 text-left text-sm" :class="targetLang === lang.code ? 'text-white bg-white/5' : 'text-gray-400'">{{ lang.name }}</button>
          </div>
        </div>
      </div>

      <div class="hidden md:flex flex-1 overflow-hidden">
        <div class="flex-1 flex flex-col border-r border-white/5">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <div class="relative">
              <button @click="showSourceLangDropdown = !showSourceLangDropdown" class="px-4 py-2 bg-white/5 text-white rounded-xl border border-white/5 hover:border-white/5 text-sm flex items-center gap-2">
                {{ languages.find(l => l.code === sourceLang)?.name }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div v-if="showSourceLangDropdown" class="absolute z-10 mt-2 w-64 bg-[#1a1a1d] rounded-2xl border border-white/5 overflow-hidden shadow-2xl max-h-80 overflow-y-auto animate-dropdown">
                <button v-for="lang in languages" :key="lang.code" @click="selectSourceLang(lang.code)" class="w-full px-4 py-3 text-left text-sm hover:bg-white/5" :class="sourceLang === lang.code ? 'text-white bg-white/5' : 'text-gray-400'">{{ lang.name }}</button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="swapLanguages" class="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
              <button @click="clearText" class="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div class="flex-1 p-6">
            <textarea v-model="sourceText" placeholder="Введите текст для перевода..." class="w-full h-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-base" @input="debouncedTranslate"></textarea>
          </div>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="p-4 border-b border-white/5 flex items-center justify-between">
            <div class="relative">
              <button @click="showTargetLangDropdown = !showTargetLangDropdown" class="px-4 py-2 bg-white/5 text-white rounded-xl border border-white/5 hover:border-white/5 text-sm flex items-center gap-2">
                {{ languages.find(l => l.code === targetLang)?.name }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div v-if="showTargetLangDropdown" class="absolute z-10 mt-2 w-64 bg-[#1a1a1d] rounded-2xl border border-white/5 overflow-hidden shadow-2xl max-h-80 overflow-y-auto animate-dropdown">
                <button v-for="lang in languages" :key="lang.code" @click="selectTargetLang(lang.code)" class="w-full px-4 py-3 text-left text-sm hover:bg-white/5" :class="targetLang === lang.code ? 'text-white bg-white/5' : 'text-gray-400'">{{ lang.name }}</button>
              </div>
            </div>
            <button v-if="translatedText" @click="copyTranslation" class="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
              <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <svg v-else class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </button>
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
              <svg class="w-12 h-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              <p class="text-gray-400 text-lg">Перевод появится здесь</p>
            </div>
            <div v-else class="text-white text-base leading-relaxed whitespace-pre-wrap">{{ translatedText }}</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ isOpen: Boolean })
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
  { code: 'uk', name: 'Украинский' }
]

const selectSourceLang = (code) => {
  sourceLang.value = code
  showSourceLangDropdown.value = false
  if (sourceText.value.trim()) translateText()
}

const selectTargetLang = (code) => {
  targetLang.value = code
  showTargetLangDropdown.value = false
  if (sourceText.value.trim()) translateText()
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
  isTranslating.value = true
  translatedText.value = ''
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang.value}&tl=${targetLang.value}&dt=t&q=${encodeURIComponent(sourceText.value)}`)
    const data = await response.json()
    if (data && data[0]) {
      translatedText.value = data[0].map(item => item[0]).join('')
    }
  } catch (error) {
    console.error('Translation error:', error)
  }
  isTranslating.value = false
}

const debouncedTranslate = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => { if (sourceText.value.trim()) translateText() }, 1000)
}

const clearText = () => { sourceText.value = ''; translatedText.value = '' }

const copyTranslation = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
