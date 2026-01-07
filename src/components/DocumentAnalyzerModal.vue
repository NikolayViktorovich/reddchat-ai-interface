<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1a1a1d] w-full md:max-w-5xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 flex flex-col md:flex-row shadow-2xl overflow-hidden">
        
        <div class="md:hidden flex items-center justify-between p-4 border-b border-white/10">
          <h2 class="text-lg text-white font-medium">Анализ документов</h2>
          <button @click="$emit('close')" class="p-2 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="md:hidden flex-1 flex flex-col overflow-hidden">
          <div v-if="!analysisResult" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              @click="$refs.mobileFileInput.click()"
              class="relative rounded-2xl p-8 text-center border-2 border-dashed border-white/20 active:border-white/40"
            >
              <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-white text-sm mb-1">Нажмите для выбора файла</p>
              <p class="text-gray-500 text-xs">PDF, DOC, DOCX, TXT, MD</p>
              <input
                ref="mobileFileInput"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                @change="handleFileSelect"
              />
            </div>

            <div v-if="uploadedFiles.length > 0" class="space-y-2">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-sm truncate">{{ file.name }}</p>
                    <p class="text-gray-500 text-xs">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button @click="removeFile(index)" class="p-2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="isAnalyzing" class="flex flex-col items-center justify-center py-12">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <p class="text-gray-400 text-sm">Анализируем документ...</p>
            </div>
          </div>

          <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
            <button @click="analysisResult = null" class="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>

            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-white text-sm font-medium mb-3">Основная информация</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-500 text-xs">Тип</p>
                  <p class="text-white">{{ analysisResult.documentType }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Размер</p>
                  <p class="text-white">{{ analysisResult.fileSize }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Слов</p>
                  <p class="text-white">{{ analysisResult.wordCount }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Язык</p>
                  <p class="text-white">{{ analysisResult.language }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Чтение</p>
                  <p class="text-white">~{{ analysisResult.readingTime }} мин</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Тональность</p>
                  <p class="text-white">{{ analysisResult.sentiment }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-white text-sm font-medium mb-2">Краткое содержание</h4>
              <p class="text-gray-300 text-sm leading-relaxed">{{ analysisResult.summary }}</p>
            </div>

            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-white text-sm font-medium mb-2">Ключевые темы</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(topic, index) in analysisResult.topics"
                  :key="index"
                  class="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-full"
                >
                  {{ topic }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!analysisResult" class="p-4 border-t border-white/10">
            <button
              @click="analyzeDocument"
              :disabled="uploadedFiles.length === 0 || isAnalyzing"
              class="w-full py-3 rounded-2xl text-sm font-medium"
              :class="uploadedFiles.length > 0 && !isAnalyzing
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-gray-500 border border-white/10'"
            >
              {{ isAnalyzing ? 'Анализ...' : 'Начать анализ' }}
            </button>
          </div>

          <div v-else class="p-4 border-t border-white/10 flex gap-3">
            <button @click="downloadReport" class="flex-1 py-3 bg-white/10 text-white rounded-2xl text-sm">
              Скачать отчёт
            </button>
            <button @click="shareReport" class="flex-1 py-3 bg-white/5 text-white rounded-2xl text-sm">
              Поделиться
            </button>
          </div>
        </div>

        <div class="hidden md:flex w-96 flex-col border-r border-white/10 p-6">
          <div class="mb-6">
            <h2 class="text-2xl text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Анализ документов</h2>
            <p class="text-gray-400 text-sm">Загрузите документ для анализа</p>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
              class="relative rounded-2xl p-6 text-center cursor-pointer border-2 border-dashed transition-all"
              :class="isDragging ? 'border-white/40 bg-white/5' : 'border-white/20 hover:border-white/30'"
            >
              <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-white text-sm mb-1">{{ isDragging ? 'Отпустите файл' : 'Перетащите файл сюда' }}</p>
              <p class="text-gray-500 text-xs">или нажмите для выбора</p>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                @change="handleFileSelect"
              />
            </div>

            <div class="text-xs text-gray-500">
              <p>PDF, DOC, DOCX, TXT, MD • Макс. 10 МБ</p>
            </div>

            <div v-if="uploadedFiles.length > 0" class="space-y-2">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-sm truncate">{{ file.name }}</p>
                    <p class="text-gray-500 text-xs">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button @click="removeFile(index)" class="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button
            @click="analyzeDocument"
            :disabled="uploadedFiles.length === 0 || isAnalyzing"
            class="w-full py-3 rounded-3xl mt-4"
            :class="uploadedFiles.length > 0 && !isAnalyzing
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'"
          >
            {{ isAnalyzing ? 'Анализ...' : 'Начать анализ' }}
          </button>
        </div>

        <div class="hidden md:flex flex-1 flex-col">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h3 class="text-lg text-white" style="font-family: 'Space Grotesk', sans-serif;">Результаты анализа</h3>
            <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div v-if="isAnalyzing" class="flex flex-col items-center justify-center h-full">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
              </div>
              <p class="text-gray-400 text-sm">Анализируем документ...</p>
            </div>

            <div v-else-if="!analysisResult" class="flex flex-col items-center justify-center h-full">
              <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-gray-400 text-lg mb-2">Результаты появятся здесь</p>
              <p class="text-gray-500 text-sm">Загрузите документ и нажмите "Начать анализ"</p>
            </div>

            <div v-else class="space-y-6">
              <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 class="text-white text-lg mb-4" style="font-family: 'Space Grotesk', sans-serif;">Основная информация</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Тип документа</p>
                    <p class="text-white">{{ analysisResult.documentType }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Размер файла</p>
                    <p class="text-white">{{ analysisResult.fileSize }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Количество слов</p>
                    <p class="text-white">{{ analysisResult.wordCount }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Язык</p>
                    <p class="text-white">{{ analysisResult.language }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Время чтения</p>
                    <p class="text-white">~{{ analysisResult.readingTime }} мин</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Тональность</p>
                    <p class="text-white">{{ analysisResult.sentiment }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 class="text-white text-lg mb-4" style="font-family: 'Space Grotesk', sans-serif;">Краткое содержание</h4>
                <p class="text-gray-300 text-sm leading-relaxed">{{ analysisResult.summary }}</p>
              </div>

              <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 class="text-white text-lg mb-4" style="font-family: 'Space Grotesk', sans-serif;">Ключевые темы</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(topic, index) in analysisResult.topics"
                    :key="index"
                    class="px-3 py-1.5 bg-white/5 text-gray-300 text-sm rounded-full"
                  >
                    {{ topic }}
                  </span>
                </div>
              </div>

              <div class="flex gap-3">
                <button @click="downloadReport" class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-3xl flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать отчёт
                </button>
                <button @click="shareReport" class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-3xl flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const isDragging = ref(false)
const uploadedFiles = ref([])
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const fileInput = ref(null)
const mobileFileInput = ref(null)

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  files.forEach(file => {
    if (file.size <= 10 * 1024 * 1024) {
      uploadedFiles.value.push(file)
    }
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
  if (uploadedFiles.value.length === 0) analysisResult.value = null
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const analyzeDocument = async () => {
  if (uploadedFiles.value.length === 0 || isAnalyzing.value) return
  
  isAnalyzing.value = true
  
  try {
    const file = uploadedFiles.value[0]
    const text = await readFileContent(file)
    
    const words = text.trim().split(/\s+/)
    const wordCount = words.length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    analysisResult.value = {
      documentType: getFileType(file.name),
      wordCount: wordCount.toLocaleString(),
      charCount: text.length.toLocaleString(),
      sentenceCount: sentences.length,
      language: detectLanguage(text),
      summary: generateSummary(text, sentences),
      topics: extractKeywords(text, words),
      sentiment: analyzeSentiment(text),
      readingTime: Math.ceil(wordCount / 200),
      fileName: file.name,
      fileSize: formatFileSize(file.size)
    }
  } catch (error) {
    console.error('Ошибка анализа:', error)
  }
  
  isAnalyzing.value = false
}

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}

const detectLanguage = (text) => {
  const cyrillicCount = (text.match(/[а-яёА-ЯЁ]/g) || []).length
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length
  return cyrillicCount > latinCount ? 'Русский' : 'Английский'
}

const generateSummary = (text, sentences) => {
  const firstSentences = sentences.slice(0, 3).join('. ')
  return firstSentences.length > 500 ? firstSentences.substring(0, 500) + '...' : firstSentences + '.'
}

const extractKeywords = (text, words) => {
  const stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'не', 'от', 'за', 'к', 'до', 'из', 'у', 'о', 'это', 'как', 'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were'])
  const wordFreq = {}
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\wа-яёА-ЯЁ]/g, '')
    if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
    }
  })
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
}

const analyzeSentiment = (text) => {
  const positiveWords = ['хорошо', 'отлично', 'прекрасно', 'успех', 'good', 'great', 'excellent']
  const negativeWords = ['плохо', 'ужасно', 'проблема', 'ошибка', 'bad', 'terrible', 'problem']
  const lowerText = text.toLowerCase()
  let positive = 0, negative = 0
  positiveWords.forEach(w => { if (lowerText.includes(w)) positive++ })
  negativeWords.forEach(w => { if (lowerText.includes(w)) negative++ })
  return positive > negative ? 'Позитивная' : negative > positive ? 'Негативная' : 'Нейтральная'
}

const getFileType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const types = { 'txt': 'Текстовый документ', 'md': 'Markdown', 'pdf': 'PDF', 'doc': 'Word', 'docx': 'Word' }
  return types[ext] || 'Документ'
}

const downloadReport = () => {
  if (!analysisResult.value) return
  const report = `ОТЧЁТ АНАЛИЗА\n\nФайл: ${analysisResult.value.fileName}\nСлов: ${analysisResult.value.wordCount}\nЯзык: ${analysisResult.value.language}\n\nСодержание:\n${analysisResult.value.summary}\n\nТемы: ${analysisResult.value.topics.join(', ')}`
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analysis-${Date.now()}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
}

const shareReport = async () => {
  if (!analysisResult.value) return
  const shareText = `Анализ: ${analysisResult.value.fileName}\nСлов: ${analysisResult.value.wordCount}\nТемы: ${analysisResult.value.topics.join(', ')}`
  if (navigator.share) {
    try { await navigator.share({ title: 'Анализ документа', text: shareText }) }
    catch (e) { navigator.clipboard.writeText(shareText) }
  } else {
    navigator.clipboard.writeText(shareText)
    alert('Скопировано в буфер обмена')
  }
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
