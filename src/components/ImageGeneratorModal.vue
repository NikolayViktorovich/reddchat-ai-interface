<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6 animate-fade-in" @click.self="$emit('close')">
    <div class="glass-modal w-full md:max-w-5xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/5 flex flex-col md:flex-row overflow-hidden animate-slide-up md:animate-scale-in">
      
      <div class="md:hidden flex items-center justify-between p-4 border-b border-white/5">
        <h2 class="text-lg text-white font-medium">Генерация</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="md:hidden flex-1 flex flex-col overflow-hidden">
        <div v-if="!showMobileResults" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label class="text-sm text-gray-400 mb-2 block">Описание</label>
            <textarea v-model="prompt" placeholder="Опишите изображение..." class="w-full h-28 px-4 py-3 bg-white/5 text-white placeholder-gray-500 rounded-2xl border border-white/5 focus:outline-none resize-none text-sm"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-400 mb-2 block">Стиль</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="s in styles" :key="s.value" @click="selectedStyle = s.value" class="px-4 py-2.5 rounded-xl text-sm transition-fast" :class="selectedStyle === s.value ? 'bg-white/10 text-white border border-white/5' : 'bg-white/5 text-gray-400 border border-white/5'">{{ s.label }}</button>
            </div>
          </div>
          <div v-if="generatedImages.length" class="pt-2">
            <button @click="showMobileResults = true" class="w-full py-3 bg-white/5 text-white rounded-2xl text-sm">Результаты ({{ generatedImages.length }})</button>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center gap-3 p-4 border-b border-white/5">
            <button @click="showMobileResults = false" class="p-1 text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span class="text-white">Результаты</span>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="isGenerating" class="flex flex-col items-center justify-center h-full">
              <div class="flex items-center gap-1.5"><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-1"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-2"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-dot-3"></div></div>
              <p class="text-gray-400 text-sm mt-3">Создаём...</p>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
              <div v-for="(img, i) in generatedImages" :key="i" class="bg-white/5 rounded-xl overflow-hidden border border-white/5 animate-fade-in" @click="preview = img">
                <img :src="img.url" :alt="img.prompt" class="w-full h-auto" loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-white/5">
          <button @click="generate" :disabled="!prompt.trim() || isGenerating" class="w-full py-3 rounded-2xl text-sm transition-fast" :class="prompt.trim() && !isGenerating ? 'bg-white/10 text-white border border-white/5' : 'bg-white/5 text-gray-500 border border-white/5'">{{ isGenerating ? 'Генерация...' : 'Создать' }}</button>
        </div>
      </div>

      <div class="hidden md:flex w-96 flex-col border-r border-white/5 p-6">
        <h2 class="text-2xl text-white mb-6">Генерация</h2>
        <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          <div>
            <label class="text-sm text-gray-400 mb-2 block">Описание</label>
            <textarea v-model="prompt" placeholder="Опишите изображение..." class="w-full h-32 px-4 py-3 bg-white/5 text-white placeholder-gray-500 rounded-2xl border border-white/5 focus:outline-none resize-none text-sm"></textarea>
          </div>
          <div>
            <label class="text-sm text-gray-400 mb-2 block">Стиль</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="s in styles" :key="s.value" @click="selectedStyle = s.value" class="px-4 py-2 rounded-xl text-sm transition-fast" :class="selectedStyle === s.value ? 'bg-white/10 text-white border border-white/5' : 'bg-white/5 text-gray-400 border border-white/5'">{{ s.label }}</button>
            </div>
          </div>
        </div>
        <button @click="generate" :disabled="!prompt.trim() || isGenerating" class="w-full py-3 rounded-3xl mt-4 transition-fast" :class="prompt.trim() && !isGenerating ? 'bg-white/10 text-white border border-white/5' : 'bg-white/5 text-gray-500 border border-white/5'">{{ isGenerating ? 'Генерация...' : 'Создать' }}</button>
      </div>

      <div class="hidden md:flex flex-1 flex-col">
        <div class="flex items-center justify-between p-6 border-b border-white/5">
          <h3 class="text-lg text-white">Результат</h3>
          <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div v-if="isGenerating" class="flex flex-col items-center justify-center h-full">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div><div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div></div>
            <p class="text-gray-400 text-sm mt-4">Создаём...</p>
          </div>
          <div v-else-if="!generatedImages.length" class="flex flex-col items-center justify-center h-full">
            <p class="text-gray-400">Изображения появятся здесь</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-4">
            <div v-for="(img, i) in generatedImages" :key="i" class="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 cursor-pointer animate-fade-in" @click="preview = img">
              <img :src="img.url" :alt="img.prompt" class="w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="preview" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in" @click="preview = null">
      <div class="relative animate-scale-in" @click.stop>
        <img :src="preview.url" :alt="preview.prompt" class="max-w-full max-h-[85vh] rounded-2xl" />
        <button @click="preview = null" class="absolute top-4 right-4 p-3 bg-white/10 rounded-xl">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ isOpen: Boolean })
defineEmits(['close'])

const prompt = ref('')
const selectedStyle = ref('realistic')
const isGenerating = ref(false)
const generatedImages = ref([])
const preview = ref(null)
const showMobileResults = ref(false)

const styles = [
  { label: 'Реалистичный', value: 'realistic' },
  { label: 'Художественный', value: 'artistic' },
  { label: 'Аниме', value: 'anime' },
  { label: 'Цифровое', value: 'digital' }
]

const stylePrompts = {
  realistic: ', photorealistic, highly detailed, 8k',
  artistic: ', artistic painting, oil painting, masterpiece',
  anime: ', anime style, manga art, vibrant colors',
  digital: ', digital art, concept art, trending on artstation'
}

const generate = async () => {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  showMobileResults.value = true
  
  try {
    const formData = new FormData()
    formData.append('prompt', prompt.value + (stylePrompts[selectedStyle.value] || ''))
    formData.append('output_format', 'jpeg')
    
    const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer sk-31UHbA1wu6lMDcoZSioFaEH8pklLr1T0a5dXi7ehLVUEBc86', 'Accept': 'image/*' },
      body: formData
    })
    
    if (!res.ok) throw new Error(`Ошибка ${res.status}`)
    const blob = await res.blob()
    generatedImages.value.unshift({ url: URL.createObjectURL(blob), prompt: prompt.value, timestamp: Date.now() })
  } catch (e) {
    alert('Ошибка генерации')
  }
  isGenerating.value = false
}
</script>
