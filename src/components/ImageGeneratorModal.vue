<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1a1a1d] w-full md:max-w-5xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 flex flex-col md:flex-row shadow-2xl overflow-hidden">
        
        <div class="md:hidden flex items-center justify-between p-4 border-b border-white/10">
          <h2 class="text-lg text-white font-medium">Генерация изображений</h2>
          <button @click="$emit('close')" class="p-2 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="md:hidden flex-1 flex flex-col overflow-hidden">
          <div v-if="!showMobileResults" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Описание</label>
              <textarea
                v-model="prompt"
                placeholder="Опишите что хотите увидеть..."
                class="w-full h-28 px-4 py-3 bg-white/5 text-white placeholder-gray-500 rounded-2xl border border-white/10 focus:outline-none resize-none text-sm"
              ></textarea>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Размер</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="size in sizes"
                  :key="size.value"
                  @click="selectedSize = size.value"
                  class="px-4 py-2.5 rounded-xl text-sm"
                  :class="selectedSize === size.value 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 border border-white/10'"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Стиль</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="style in styles"
                  :key="style.value"
                  @click="selectedStyle = style.value"
                  class="px-4 py-2.5 rounded-xl text-sm text-left"
                  :class="selectedStyle === style.value 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 border border-white/10'"
                >
                  {{ style.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Качество</label>
              <div class="flex gap-2">
                <button
                  v-for="quality in qualities"
                  :key="quality"
                  @click="selectedQuality = quality"
                  class="flex-1 px-4 py-2.5 rounded-xl text-sm"
                  :class="selectedQuality === quality 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 border border-white/10'"
                >
                  {{ quality }}
                </button>
              </div>
            </div>

            <div v-if="generatedImages.length > 0" class="pt-2">
              <button @click="showMobileResults = true" class="w-full py-3 bg-white/5 text-white rounded-2xl text-sm">
                Посмотреть результаты ({{ generatedImages.length }})
              </button>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center gap-3 p-4 border-b border-white/10">
              <button @click="showMobileResults = false" class="p-1 text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="text-white font-medium">Результаты</span>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="isGenerating" class="flex flex-col items-center justify-center h-full">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <p class="text-gray-400 text-sm">Создаём изображение...</p>
              </div>
              
              <div v-else class="grid grid-cols-2 gap-3">
                <div
                  v-for="(image, index) in generatedImages"
                  :key="index"
                  class="relative bg-white/5 rounded-xl overflow-hidden border border-white/10"
                  @click="openImagePreview(image)"
                >
                  <img :src="image.url" :alt="image.prompt" class="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-white/10">
            <button
              @click="generateImage"
              :disabled="!prompt.trim() || isGenerating"
              class="w-full py-3 rounded-2xl text-sm font-medium"
              :class="prompt.trim() && !isGenerating
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-gray-500 border border-white/10'"
            >
              {{ isGenerating ? 'Генерация...' : 'Создать изображение' }}
            </button>
          </div>
        </div>

        <div class="hidden md:flex w-96 flex-col border-r border-white/10 p-6">
          <div class="mb-6">
            <h2 class="text-2xl text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Генерация изображений</h2>
            <p class="text-gray-400 text-sm">Создайте изображение по описанию</p>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Описание изображения</label>
              <textarea
                v-model="prompt"
                placeholder="Опишите что вы хотите увидеть..."
                class="w-full h-32 px-4 py-3 bg-white/5 text-white placeholder-gray-500 rounded-2xl border border-white/10 focus:outline-none resize-none text-sm"
              ></textarea>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Размер</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="size in sizes"
                  :key="size.value"
                  @click="selectedSize = size.value"
                  class="px-4 py-2 rounded-xl text-sm"
                  :class="selectedSize === size.value 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Стиль</label>
              <div class="relative">
                <button
                  @click="showStyleDropdown = !showStyleDropdown"
                  class="w-full px-4 py-3 bg-white/5 text-white rounded-2xl border border-white/10 hover:border-white/20 text-sm flex items-center justify-between"
                >
                  <span>{{ styles.find(s => s.value === selectedStyle)?.label }}</span>
                  <svg class="w-4 h-4" :class="showStyleDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div v-if="showStyleDropdown" class="absolute z-10 w-full mt-2 bg-[#1a1a1d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <button
                      v-for="style in styles"
                      :key="style.value"
                      @click="selectStyle(style.value)"
                      class="w-full px-4 py-3 text-left text-sm hover:bg-white/5"
                      :class="selectedStyle === style.value ? 'text-white bg-white/5' : 'text-gray-400'"
                    >
                      {{ style.label }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Качество</label>
              <div class="flex gap-2">
                <button
                  v-for="quality in qualities"
                  :key="quality"
                  @click="selectedQuality = quality"
                  class="flex-1 px-4 py-2 rounded-xl text-sm"
                  :class="selectedQuality === quality 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'"
                >
                  {{ quality }}
                </button>
              </div>
            </div>
          </div>

          <button
            @click="generateImage"
            :disabled="!prompt.trim() || isGenerating"
            class="w-full py-3 rounded-3xl mt-4"
            :class="prompt.trim() && !isGenerating
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'"
          >
            {{ isGenerating ? 'Генерация...' : 'Создать изображение' }}
          </button>
        </div>

        <div class="hidden md:flex flex-1 flex-col">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h3 class="text-lg text-white" style="font-family: 'Space Grotesk', sans-serif;">Результат</h3>
            <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div v-if="isGenerating" class="flex flex-col items-center justify-center h-full">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
              </div>
              <p class="text-gray-400 text-sm">Создаём изображение...</p>
            </div>

            <div v-else-if="generatedImages.length === 0" class="flex flex-col items-center justify-center h-full">
              <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-gray-400 text-lg mb-2">Изображения появятся здесь</p>
              <p class="text-gray-500 text-sm">Опишите что хотите увидеть</p>
            </div>

            <div v-else class="grid grid-cols-2 gap-4">
              <div
                v-for="(image, index) in generatedImages"
                :key="index"
                class="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 cursor-pointer"
                @click="openImagePreview(image)"
              >
                <img :src="image.url" :alt="image.prompt" class="w-full h-auto" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button @click.stop="downloadImage(image)" class="p-3 bg-white/20 hover:bg-white/30 rounded-xl">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="previewImage"
          class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          @click="closeImagePreview"
        >
          <div class="relative max-w-full max-h-full" @click.stop>
            <img :src="previewImage.url" :alt="previewImage.prompt" class="max-w-full max-h-[85vh] rounded-2xl" />
            <div class="absolute top-4 right-4 flex gap-2">
              <button @click="downloadImage(previewImage)" class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button @click="closeImagePreview" class="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const prompt = ref('')
const selectedSize = ref('1024x1024')
const selectedStyle = ref('realistic')
const selectedQuality = ref('STANDART')
const isGenerating = ref(false)
const generatedImages = ref([])
const showStyleDropdown = ref(false)
const previewImage = ref(null)
const showMobileResults = ref(false)

const sizes = [
  { label: '1024×1024', value: '1024x1024' },
  { label: '512×512', value: '512x512' },
  { label: '768×768', value: '768x768' },
  { label: '256×256', value: '256x256' }
]

const styles = [
  { label: 'Реалистичный', value: 'realistic' },
  { label: 'Художественный', value: 'artistic' },
  { label: 'Аниме', value: 'anime' },
  { label: 'Цифровое искусство', value: 'digital' },
  { label: '3D рендер', value: '3d' }
]

const qualities = ['STANDART', 'HD']

const selectStyle = (value) => {
  selectedStyle.value = value
  showStyleDropdown.value = false
}

const generateImage = async () => {
  if (!prompt.value.trim() || isGenerating.value) return
  
  isGenerating.value = true
  showMobileResults.value = true
  
  try {
    const stylePrompts = {
      'realistic': ', photorealistic, highly detailed, 8k quality',
      'artistic': ', artistic painting, oil painting style, masterpiece',
      'anime': ', anime style, manga art, vibrant colors',
      'digital': ', digital art, concept art, trending on artstation',
      '3d': ', 3d render, octane render, cinematic lighting'
    }
    
    const enhancedPrompt = prompt.value + (stylePrompts[selectedStyle.value] || '')
    
    const formData = new FormData()
    formData.append('prompt', enhancedPrompt)
    formData.append('output_format', 'jpeg')
    
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-31UHbA1wu6lMDcoZSioFaEH8pklLr1T0a5dXi7ehLVUEBc86',
        'Accept': 'image/*'
      },
      body: formData
    })
    
    if (!response.ok) throw new Error(`Ошибка ${response.status}`)
    
    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)
    
    generatedImages.value.unshift({
      url: imageUrl,
      prompt: prompt.value,
      size: selectedSize.value,
      style: selectedStyle.value,
      quality: selectedQuality.value,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Ошибка генерации:', error)
    alert('Не удалось сгенерировать изображение')
  }
  
  isGenerating.value = false
}

const openImagePreview = (image) => { previewImage.value = image }
const closeImagePreview = () => { previewImage.value = null }

const downloadImage = async (image) => {
  try {
    const response = await fetch(image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reddchat-${image.timestamp || Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка при скачивании:', error)
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
.dropdown-enter-active, .dropdown-leave-active { 
  transition: opacity 0.1s ease; 
}
.dropdown-enter-from, .dropdown-leave-to { 
  opacity: 0; 
}
</style>
