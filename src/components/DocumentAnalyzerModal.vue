<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 w-full max-w-5xl h-[90vh] flex shadow-2xl overflow-hidden">
        
        <div class="w-96 flex flex-col border-r border-gray-700/30 p-6">
          <div class="mb-6">
            <h2 class="text-2xl text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Анализ документов</h2>
            <p class="text-gray-400 text-sm">Загрузите документ для анализа</p>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              class="relative rounded-2xl p-6 text-center transition-all duration-75 cursor-pointer overflow-hidden group"
              @click="$refs.fileInput.click()"
            >
              <div 
                class="absolute inset-0 bg-gradient-to-br from-gray-800/40 via-gray-800/20 to-transparent transition-all duration-75"
                :class="isDragging ? 'opacity-100 scale-105' : 'opacity-60 group-hover:opacity-100'"
              ></div>
              
              <div 
                class="absolute inset-0 border-2 border-dashed rounded-2xl transition-all duration-75"
                :class="isDragging ? 'border-white/60 animate-pulse' : 'border-gray-700/40 group-hover:border-gray-600/60'"
              ></div>
              
              <div 
                class="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transition-all duration-75"
                :class="isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              ></div>
              <div 
                class="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transition-all duration-75"
                :class="isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              ></div>
              
              <div class="relative flex flex-col items-center">
                <div 
                  class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center mb-3 transition-all duration-75 border border-gray-600/30"
                  :class="isDragging ? 'scale-110 rotate-6' : 'group-hover:scale-105'"
                >
                  <svg 
                    class="w-7 h-7 text-gray-300 transition-all duration-75" 
                    :class="isDragging ? 'animate-bounce' : ''"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p class="text-white text-sm mb-1 font-medium">
                  {{ isDragging ? 'Отпустите файл' : 'Перетащите файл сюда' }}
                </p>
                <p class="text-gray-500 text-xs">или нажмите для выбора</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                @change="handleFileSelect"
              />
            </div>

            <div class="text-xs text-gray-500">
              <p class="mb-1">Поддерживаемые форматы:</p>
              <p>PDF, DOC, DOCX, TXT, MD</p>
              <p class="mt-2">Максимальный размер: 10 МБ</p>
            </div>

            <div v-if="uploadedFiles.length > 0" class="space-y-2">
              <p class="text-sm text-gray-400">Загруженные файлы:</p>
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-800/40 rounded-xl border border-gray-700/30"
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
                <button
                  @click="removeFile(index)"
                  class="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all duration-75 text-gray-400 hover:text-red-400"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Тип анализа</label>
              <div class="space-y-2">
                <button
                  v-for="type in analysisTypes"
                  :key="type.value"
                  @click="selectedAnalysisType = type.value"
                  class="w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-75"
                  :class="selectedAnalysisType === type.value 
                    ? 'bg-white text-gray-900' 
                    : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60'"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon" />
                    </svg>
                    <div>
                      <p class="font-medium">{{ type.label }}</p>
                      <p class="text-xs opacity-70">{{ type.description }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            @click="analyzeDocument"
            :disabled="uploadedFiles.length === 0 || isAnalyzing"
            class="w-full py-3 rounded-2xl transition-all duration-75 mt-4"
            :class="uploadedFiles.length > 0 && !isAnalyzing
              ? 'bg-white hover:bg-gray-100 text-gray-900'
              : 'bg-gray-800/40 text-gray-500 cursor-not-allowed'"
          >
            {{ isAnalyzing ? 'Анализ...' : 'Начать анализ' }}
          </button>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h3 class="text-lg text-white" style="font-family: 'Space Grotesk', sans-serif;">Результаты анализа</h3>
            <button 
              @click="$emit('close')"
              class="p-2 hover:bg-gray-800/70 rounded-xl transition-all duration-75 text-gray-400 hover:text-white"
            >
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
              <svg class="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-400 text-lg mb-2">Результаты появятся здесь</p>
              <p class="text-gray-500 text-sm">Загрузите документ и нажмите "Начать анализ"</p>
            </div>

            <div v-else class="space-y-6">
              <div class="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/30">
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
                    <p class="text-gray-400 text-sm mb-1">Символов</p>
                    <p class="text-white">{{ analysisResult.charCount }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-sm mb-1">Предложений</p>
                    <p class="text-white">{{ analysisResult.sentenceCount }}</p>
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

              <div class="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/30">
                <h4 class="text-white text-lg mb-4" style="font-family: 'Space Grotesk', sans-serif;">Краткое содержание</h4>
                <p class="text-gray-300 text-sm leading-relaxed">{{ analysisResult.summary }}</p>
              </div>

              <div class="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/30">
                <h4 class="text-white text-lg mb-4" style="font-family: 'Space Grotesk', sans-serif;">Ключевые темы</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(topic, index) in analysisResult.topics"
                    :key="index"
                    class="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-sm rounded-full"
                  >
                    {{ topic }}
                  </span>
                </div>
              </div>

              <div class="flex gap-3">
                <button 
                  @click="downloadReport"
                  class="flex-1 px-4 py-3 bg-gray-800/60 hover:bg-gray-800/80 text-white rounded-xl transition-all duration-75 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Скачать отчёт
                </button>
                <button 
                  @click="shareReport"
                  class="flex-1 px-4 py-3 bg-gray-800/60 hover:bg-gray-800/80 text-white rounded-xl transition-all duration-75 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const isDragging = ref(false)
const uploadedFiles = ref([])
const selectedAnalysisType = ref('summary')
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const fileInput = ref(null)

const analysisTypes = [
  {
    value: 'summary',
    label: 'Краткое содержание',
    description: 'Основные идеи документа',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    value: 'detailed',
    label: 'Детальный анализ',
    description: 'Полный разбор содержания',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    value: 'keywords',
    label: 'Ключевые слова',
    description: 'Извлечение важных терминов',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
  },
  {
    value: 'sentiment',
    label: 'Тональность',
    description: 'Анализ эмоциональной окраски',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]

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
  if (uploadedFiles.value.length === 0) {
    analysisResult.value = null
  }
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
    const charCount = text.length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentenceCount = sentences.length
    
    const language = detectLanguage(text)
    const readingTime = Math.ceil(wordCount / 200)
    
    let summary = ''
    let topics = []
    let sentiment = 'Нейтральная'
    
    try {
      const textForAnalysis = text.substring(0, 3000)
      
      if (selectedAnalysisType.value === 'summary' || selectedAnalysisType.value === 'detailed') {
        summary = await generateAISummary(textForAnalysis, language)
      } else {
        summary = generateSummary(text, sentences)
      }
      
      if (selectedAnalysisType.value === 'keywords') {
        topics = await extractAIKeywords(textForAnalysis, language)
      } else {
        topics = extractKeywords(text, words)
      }
      
      if (selectedAnalysisType.value === 'sentiment') {
        sentiment = await analyzeAISentiment(textForAnalysis, language)
      } else {
        sentiment = analyzeSentiment(text)
      }
    } catch (apiError) {
      console.warn('AI API недоступен, используем локальный анализ:', apiError)
      summary = generateSummary(text, sentences)
      topics = extractKeywords(text, words)
      sentiment = analyzeSentiment(text)
    }
    
    analysisResult.value = {
      documentType: getFileType(file.name),
      wordCount: wordCount.toLocaleString(),
      charCount: charCount.toLocaleString(),
      sentenceCount: sentenceCount,
      language: language,
      summary: summary,
      topics: topics,
      sentiment: sentiment,
      readingTime: readingTime,
      fileName: file.name,
      fileSize: formatFileSize(file.size)
    }
    
    isAnalyzing.value = false
  } catch (error) {
    console.error('Ошибка анализа:', error)
    isAnalyzing.value = false
  }
}

const generateAISummary = async (text, language) => {
  try {
    const model = language === 'Русский' 
      ? 'facebook/bart-large-cnn'
      : 'facebook/bart-large-cnn'
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: 150,
            min_length: 50,
            do_sample: false
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error('API error')
    }
    
    const result = await response.json()
    
    if (result && result[0] && result[0].summary_text) {
      return result[0].summary_text
    }
    
    throw new Error('Invalid response')
  } catch (error) {
    throw error
  }
}

const extractAIKeywords = async (text, language) => {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/yanekyuk/bert-uncased-keyword-extractor',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text
        })
      }
    )
    
    if (!response.ok) {
      throw new Error('API error')
    }
    
    const result = await response.json()
    
    if (Array.isArray(result) && result.length > 0) {
      return result.slice(0, 8).map(item => {
        const word = item.word || item.entity_group || item
        return typeof word === 'string' 
          ? word.charAt(0).toUpperCase() + word.slice(1).replace(/[#_]/g, '')
          : 'Ключевое слово'
      })
    }
    
    throw new Error('Invalid response')
  } catch (error) {
    throw error
  }
}

const analyzeAISentiment = async (text, language) => {
  try {
    const model = language === 'Русский'
      ? 'blanchefort/rubert-base-cased-sentiment'
      : 'distilbert-base-uncased-finetuned-sst-2-english'
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text
        })
      }
    )
    
    if (!response.ok) {
      throw new Error('API error')
    }
    
    const result = await response.json()
    
    if (Array.isArray(result) && result[0] && Array.isArray(result[0])) {
      const topSentiment = result[0].reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      )
      
      const label = topSentiment.label.toLowerCase()
      
      if (label.includes('positive') || label === 'positive' || label === '5 stars' || label === '4 stars') {
        return 'Позитивная'
      } else if (label.includes('negative') || label === 'negative' || label === '1 star' || label === '2 stars') {
        return 'Негативная'
      } else {
        return 'Нейтральная'
      }
    }
    
    throw new Error('Invalid response')
  } catch (error) {
    throw error
  }
}

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target.result
      
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        resolve(content)
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.pdf')) {
        resolve(content)
      } else {
        resolve(content)
      }
    }
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}

const detectLanguage = (text) => {
  const cyrillicCount = (text.match(/[а-яёА-ЯЁ]/g) || []).length
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length
  
  if (cyrillicCount > latinCount) {
    return 'Русский'
  } else if (latinCount > cyrillicCount) {
    return 'Английский'
  } else {
    return 'Смешанный'
  }
}

const generateSummary = (text, sentences) => {
  if (selectedAnalysisType.value === 'summary') {
    const firstSentences = sentences.slice(0, 3).join('. ')
    return firstSentences.length > 500 
      ? firstSentences.substring(0, 500) + '...' 
      : firstSentences + '.'
  } else if (selectedAnalysisType.value === 'detailed') {
    const detailedSentences = sentences.slice(0, 5).join('. ')
    return detailedSentences.length > 800 
      ? detailedSentences.substring(0, 800) + '...' 
      : detailedSentences + '.'
  } else {
    return sentences[0] || 'Не удалось создать краткое содержание.'
  }
}

const extractKeywords = (text, words) => {
  const stopWords = new Set([
    'и', 'в', 'на', 'с', 'по', 'для', 'не', 'от', 'за', 'к', 'до', 'из', 'у', 'о', 'это', 'как', 'его', 'но', 'да', 'ты', 'вы', 'он', 'она', 'они', 'мы', 'я',
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
  ])
  
  const wordFreq = {}
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\wа-яёА-ЯЁ]/g, '')
    if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
    }
  })
  
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
  
  return sortedWords.length > 0 ? sortedWords : ['Документ', 'Текст', 'Анализ']
}

const analyzeSentiment = (text) => {
  const positiveWords = ['хорошо', 'отлично', 'прекрасно', 'замечательно', 'успех', 'радость', 'счастье', 'good', 'great', 'excellent', 'wonderful', 'success', 'happy']
  const negativeWords = ['плохо', 'ужасно', 'проблема', 'ошибка', 'неудача', 'грусть', 'bad', 'terrible', 'problem', 'error', 'failure', 'sad']
  
  const lowerText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    const matches = lowerText.match(new RegExp(word, 'g'))
    if (matches) positiveCount += matches.length
  })
  
  negativeWords.forEach(word => {
    const matches = lowerText.match(new RegExp(word, 'g'))
    if (matches) negativeCount += matches.length
  })
  
  if (positiveCount > negativeCount) {
    return 'Позитивная'
  } else if (negativeCount > positiveCount) {
    return 'Негативная'
  } else {
    return 'Нейтральная'
  }
}

const getFileType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const types = {
    'txt': 'Текстовый документ',
    'md': 'Markdown документ',
    'pdf': 'PDF документ',
    'doc': 'Word документ',
    'docx': 'Word документ'
  }
  return types[ext] || 'Документ'
}

const downloadReport = () => {
  if (!analysisResult.value) return
  
  const report = `
ОТЧЁТ АНАЛИЗА ДОКУМЕНТА
========================

Файл: ${analysisResult.value.fileName}
Размер: ${analysisResult.value.fileSize}
Тип: ${analysisResult.value.documentType}

СТАТИСТИКА
----------
Количество слов: ${analysisResult.value.wordCount}
Количество символов: ${analysisResult.value.charCount}
Количество предложений: ${analysisResult.value.sentenceCount}
Язык: ${analysisResult.value.language}
Время чтения: ~${analysisResult.value.readingTime} мин

КРАТКОЕ СОДЕРЖАНИЕ
------------------
${analysisResult.value.summary}

КЛЮЧЕВЫЕ ТЕМЫ
-------------
${analysisResult.value.topics.join(', ')}

ТОНАЛЬНОСТЬ
-----------
${analysisResult.value.sentiment}

---
Создано с помощью REDDCHAT
${new Date().toLocaleString('ru-RU')}
`
  
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analysis-${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const shareReport = async () => {
  if (!analysisResult.value) return
  
  const shareText = `Анализ документа "${analysisResult.value.fileName}"\n\nСлов: ${analysisResult.value.wordCount}\nЯзык: ${analysisResult.value.language}\nТональность: ${analysisResult.value.sentiment}\n\nКлючевые темы: ${analysisResult.value.topics.join(', ')}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Анализ документа - REDDCHAT',
        text: shareText
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        copyToClipboard(shareText)
      }
    }
  } else {
    copyToClipboard(shareText)
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Результаты анализа скопированы в буфер обмена')
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
</style>
