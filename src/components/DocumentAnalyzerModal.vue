<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6 animate-fade-in" @click.self="$emit('close')">
    <div class="bg-[#1a1a1d] w-full md:max-w-5xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 flex flex-col md:flex-row overflow-hidden animate-slide-up md:animate-scale-in">
      
      <div class="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <h2 class="text-lg text-white font-medium">Анализ</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="md:hidden flex-1 flex flex-col overflow-hidden">
        <div v-if="!result" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div @click="$refs.mobileInput.click()" class="rounded-2xl p-8 text-center border-2 border-dashed border-white/20 active:border-white/40 transition-fast">
            <p class="text-white text-sm mb-1">Выберите файл</p>
            <p class="text-gray-500 text-xs">PDF, DOC, TXT, MD</p>
            <input ref="mobileInput" type="file" class="hidden" accept=".pdf,.doc,.docx,.txt,.md" @change="handleFile" />
          </div>
          <div v-if="files.length" class="space-y-2">
            <div v-for="(f, i) in files" :key="i" class="flex items-center justify-between p-3 bg-white/5 rounded-xl animate-fade-in">
              <div class="flex-1 min-w-0"><p class="text-white text-sm truncate">{{ f.name }}</p><p class="text-gray-500 text-xs">{{ formatSize(f.size) }}</p></div>
              <button @click="files.splice(i, 1)" class="p-2 text-gray-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div v-if="loading" class="flex flex-col items-center py-12">
            <div class="flex items-center gap-1.5"><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-1"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-2"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-3"></div></div>
            <p class="text-gray-400 text-sm mt-3">Анализируем...</p>
          </div>
        </div>
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
          <button @click="result = null" class="flex items-center gap-2 text-gray-400 text-sm"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>Назад</button>
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="text-white text-sm font-medium mb-3">Информация</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><p class="text-gray-500 text-xs">Слов</p><p class="text-white">{{ result.words }}</p></div>
              <div><p class="text-gray-500 text-xs">Язык</p><p class="text-white">{{ result.lang }}</p></div>
              <div><p class="text-gray-500 text-xs">Чтение</p><p class="text-white">~{{ result.time }} мин</p></div>
              <div><p class="text-gray-500 text-xs">Тон</p><p class="text-white">{{ result.tone }}</p></div>
            </div>
          </div>
          <div class="bg-white/5 rounded-xl p-4"><h4 class="text-white text-sm font-medium mb-2">Содержание</h4><p class="text-gray-300 text-sm">{{ result.summary }}</p></div>
          <div class="bg-white/5 rounded-xl p-4"><h4 class="text-white text-sm font-medium mb-2">Темы</h4><div class="flex flex-wrap gap-2"><span v-for="(t, i) in result.topics" :key="i" class="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-full">{{ t }}</span></div></div>
        </div>
        <div v-if="!result" class="p-4 border-t border-white/10">
          <button @click="analyze" :disabled="!files.length || loading" class="w-full py-3 rounded-2xl text-sm transition-fast" :class="files.length && !loading ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-gray-500 border border-white/10'">{{ loading ? 'Анализ...' : 'Начать' }}</button>
        </div>
      </div>

      <div class="hidden md:flex w-96 flex-col border-r border-white/10 p-6">
        <h2 class="text-2xl text-white mb-6">Анализ</h2>
        <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          <div @dragover.prevent="drag = true" @dragleave.prevent="drag = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()" class="rounded-2xl p-6 text-center cursor-pointer border-2 border-dashed transition-fast" :class="drag ? 'border-white/40 bg-white/5' : 'border-white/20'">
            <p class="text-white text-sm mb-1">{{ drag ? 'Отпустите' : 'Перетащите файл' }}</p>
            <p class="text-gray-500 text-xs">или нажмите</p>
            <input ref="fileInput" type="file" class="hidden" accept=".pdf,.doc,.docx,.txt,.md" @change="handleFile" />
          </div>
          <div v-if="files.length" class="space-y-2">
            <div v-for="(f, i) in files" :key="i" class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 animate-fade-in">
              <div class="flex-1 min-w-0"><p class="text-white text-sm truncate">{{ f.name }}</p><p class="text-gray-500 text-xs">{{ formatSize(f.size) }}</p></div>
              <button @click="files.splice(i, 1)" class="p-1.5 text-gray-400 hover:text-red-400 transition-fast"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        </div>
        <button @click="analyze" :disabled="!files.length || loading" class="w-full py-3 rounded-3xl mt-4 transition-fast" :class="files.length && !loading ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-gray-500 border border-white/10'">{{ loading ? 'Анализ...' : 'Начать' }}</button>
      </div>

      <div class="hidden md:flex flex-1 flex-col">
        <div class="flex items-center justify-between p-6 border-b border-white/10">
          <h3 class="text-lg text-white">Результаты</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-fast"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center h-full">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div></div>
            <p class="text-gray-400 text-sm mt-4">Анализируем...</p>
          </div>
          <div v-else-if="!result" class="flex items-center justify-center h-full"><p class="text-gray-400">Загрузите документ</p></div>
          <div v-else class="space-y-6 animate-fade-in">
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 class="text-white text-lg mb-4">Информация</h4>
              <div class="grid grid-cols-2 gap-4">
                <div><p class="text-gray-400 text-sm mb-1">Слов</p><p class="text-white">{{ result.words }}</p></div>
                <div><p class="text-gray-400 text-sm mb-1">Язык</p><p class="text-white">{{ result.lang }}</p></div>
                <div><p class="text-gray-400 text-sm mb-1">Чтение</p><p class="text-white">~{{ result.time }} мин</p></div>
                <div><p class="text-gray-400 text-sm mb-1">Тональность</p><p class="text-white">{{ result.tone }}</p></div>
              </div>
            </div>
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10"><h4 class="text-white text-lg mb-4">Содержание</h4><p class="text-gray-300 text-sm">{{ result.summary }}</p></div>
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10"><h4 class="text-white text-lg mb-4">Темы</h4><div class="flex flex-wrap gap-2"><span v-for="(t, i) in result.topics" :key="i" class="px-3 py-1.5 bg-white/5 text-gray-300 text-sm rounded-full">{{ t }}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const drag = ref(false)
const files = ref([])
const loading = ref(false)
const result = ref(null)

const handleFile = (e) => { if (e.target.files[0]?.size <= 10485760) files.value = [e.target.files[0]] }
const handleDrop = (e) => { drag.value = false; const f = e.dataTransfer.files[0]; if (f?.size <= 10485760) files.value = [f] }
const formatSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

const analyze = async () => {
  if (!files.value.length || loading.value) return
  loading.value = true
  try {
    const text = await new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(files.value[0]) })
    const words = text.trim().split(/\s+/)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const cyr = (text.match(/[а-яёА-ЯЁ]/g) || []).length
    const lat = (text.match(/[a-zA-Z]/g) || []).length
    const stops = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'не', 'от', 'the', 'is', 'at', 'on', 'a', 'an', 'as', 'are'])
    const freq = {}
    words.forEach(w => { const c = w.toLowerCase().replace(/[^\wа-яёА-ЯЁ]/g, ''); if (c.length > 3 && !stops.has(c)) freq[c] = (freq[c] || 0) + 1 })
    const topics = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w.charAt(0).toUpperCase() + w.slice(1))
    const pos = ['хорошо', 'отлично', 'успех', 'good', 'great'].filter(w => text.toLowerCase().includes(w)).length
    const neg = ['плохо', 'ужасно', 'проблема', 'bad', 'terrible'].filter(w => text.toLowerCase().includes(w)).length
    result.value = { words: words.length.toLocaleString(), lang: cyr > lat ? 'Русский' : 'English', time: Math.ceil(words.length / 200), tone: pos > neg ? 'Позитивная' : neg > pos ? 'Негативная' : 'Нейтральная', summary: sentences.slice(0, 3).join('. ').substring(0, 400) + '...', topics }
  } catch { result.value = null }
  loading.value = false
}
</script>
