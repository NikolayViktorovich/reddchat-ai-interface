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
            <h2 class="text-2xl text-white mb-2" style="font-family: 'Space Grotesk', sans-serif;">Генерация изображений</h2>
            <p class="text-gray-400 text-sm">Создайте изображение по описанию</p>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin space-y-4">
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Описание изображения</label>
              <textarea
                v-model="prompt"
                placeholder="Опишите что вы хотите увидеть..."
                class="w-full h-32 px-4 py-3 bg-gray-800/60 text-white placeholder-gray-500 rounded-2xl border border-gray-700/50 focus:outline-none focus:border-gray-600 transition-all resize-none text-sm"
              ></textarea>
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Размер</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="size in sizes"
                  :key="size.value"
                  @click="selectedSize = size.value"
                  class="px-4 py-2 rounded-xl text-sm transition-all duration-75"
                  :class="selectedSize === size.value 
                    ? 'bg-white text-gray-900' 
                    : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60'"
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
                  class="w-full px-4 py-3 bg-gray-800/60 text-white rounded-2xl border border-gray-700/50 hover:border-gray-600 focus:outline-none focus:border-gray-600 transition-all text-sm flex items-center justify-between"
                >
                  <span>{{ styles.find(s => s.value === selectedStyle)?.label }}</span>
                  <svg class="w-4 h-4 transition-transform duration-75" :class="showStyleDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition name="dropdown">
                  <div
                    v-if="showStyleDropdown"
                    class="absolute z-10 w-full mt-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
                  >
                    <button
                      v-for="style in styles"
                      :key="style.value"
                      @click="selectStyle(style.value)"
                      class="w-full px-4 py-3 text-left text-sm transition-all duration-75 hover:bg-gray-700/50"
                      :class="selectedStyle === style.value ? 'text-white bg-gray-700/30' : 'text-gray-400'"
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
                  class="flex-1 px-4 py-2 rounded-xl text-sm transition-all duration-75"
                  :class="selectedQuality === quality 
                    ? 'bg-white text-gray-900' 
                    : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60'"
                >
                  {{ quality }}
                </button>
              </div>
            </div>
          </div>

          <button
            @click="generateImage"
            :disabled="!prompt.trim() || isGenerating"
            class="w-full py-3 rounded-2xl transition-all duration-75 mt-4"
            :class="prompt.trim() && !isGenerating
              ? 'bg-white hover:bg-gray-100 text-gray-900'
              : 'bg-gray-800/40 text-gray-500 cursor-not-allowed'"
          >
            {{ isGenerating ? 'Генерация...' : 'Создать изображение' }}
          </button>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h3 class="text-lg text-white" style="font-family: 'Space Grotesk', sans-serif;">Результат</h3>
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
            <div v-if="isGenerating" class="flex flex-col items-center justify-center h-full">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-1"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-2"></div>
                <div class="w-2.5 h-2.5 bg-gray-400 rounded-full animate-dot-3"></div>
              </div>
              <p class="text-gray-400 text-sm">Создаём изображение...</p>
              <p class="text-gray-500 text-xs mt-2">Обычно занимает 10-15 секунд</p>
            </div>

            <div v-else-if="generatedImages.length === 0" class="flex flex-col items-center justify-center h-full">
              <svg class="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-400 text-lg mb-2">Изображения появятся здесь</p>
              <p class="text-gray-500 text-sm">Опишите что хотите увидеть и нажмите "Создать"</p>
            </div>

            <div v-else class="grid grid-cols-2 gap-4">
              <div
                v-for="(image, index) in generatedImages"
                :key="index"
                class="group relative bg-gray-800/40 rounded-2xl overflow-hidden border border-gray-700/30 hover:border-gray-600/50 transition-all duration-75 cursor-pointer"
                @click="openImagePreview(image)"
              >
                <img :src="image.url" :alt="image.prompt" class="w-full h-auto" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-75 flex items-center justify-center gap-2">
                  <button 
                    @click.stop="downloadImage(image)"
                    class="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-75"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button 
                    @click.stop="shareImage(image)"
                    class="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-75"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
          class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          @click="closeImagePreview"
        >
          <div class="relative max-w-6xl max-h-[90vh]" @click.stop>
            <img :src="previewImage.url" :alt="previewImage.prompt" class="max-w-full max-h-[90vh] rounded-2xl" />
            
            <div class="absolute top-4 right-4 flex gap-2">
              <button 
                @click="downloadImage(previewImage)"
                class="p-3 bg-gray-900/80 hover:bg-gray-900 rounded-xl transition-all duration-75 backdrop-blur-sm"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button 
                @click="shareImage(previewImage)"
                class="p-3 bg-gray-900/80 hover:bg-gray-900 rounded-xl transition-all duration-75 backdrop-blur-sm"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button 
                @click="closeImagePreview"
                class="p-3 bg-gray-900/80 hover:bg-gray-900 rounded-xl transition-all duration-75 backdrop-blur-sm"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl p-4">
              <p class="text-white text-sm">{{ previewImage.prompt }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ previewImage.size }} • {{ previewImage.style }} • {{ previewImage.quality }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const prompt = ref('')
const selectedSize = ref('1024x1024')
const selectedStyle = ref('realistic')
const selectedQuality = ref('standard')
const isGenerating = ref(false)
const generatedImages = ref([])
const showStyleDropdown = ref(false)
const previewImage = ref(null)

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

const qualities = ['standard', 'hd']

const selectStyle = (value) => {
  selectedStyle.value = value
  showStyleDropdown.value = false
}

const generateImage = async () => {
  if (!prompt.value.trim() || isGenerating.value) return
  
  isGenerating.value = true
  
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
    
    if (selectedQuality.value === 'hd') {
      formData.append('mode', 'image-to-image')
    }
    
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-31UHbA1wu6lMDcoZSioFaEH8pklLr1T0a5dXi7ehLVUEBc86',
        'Accept': 'image/*'
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ошибка ${response.status}: ${errorText}`)
    }
    
    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)
    
    const mockImage = {
      url: imageUrl,
      prompt: prompt.value,
      size: selectedSize.value,
      style: selectedStyle.value,
      quality: selectedQuality.value,
      model: 'stable-diffusion-3',
      timestamp: Date.now()
    }
    
    generatedImages.value.unshift(mockImage)
    isGenerating.value = false
  } catch (error) {
    console.error('Ошибка генерации:', error)
    alert(error.message || 'Не удалось сгенерировать изображение. Попробуйте ещё раз.')
    isGenerating.value = false
  }
}

const openImagePreview = (image) => {
  previewImage.value = image
}

const closeImagePreview = () => {
  previewImage.value = null
}

const downloadImage = async (image) => {
  try {
    if (image.url.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = image.url
      link.download = `reddchat-${image.timestamp || Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (image.url.startsWith('blob:')) {
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
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка при скачивании:', error)
    alert('Не удалось скачать изображение')
  }
}

const shareImage = async (image) => {
  if (navigator.share) {
    try {
      let blob
      
      if (image.url.startsWith('data:')) {
        const base64Data = image.url.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'image/png' })
      } else if (image.url.startsWith('blob:')) {
        const response = await fetch(image.url)
        blob = await response.blob()
      } else {
        const response = await fetch(image.url)
        blob = await response.blob()
      }
      
      const file = new File([blob], `reddchat-${image.timestamp || Date.now()}.png`, { type: 'image/png' })
      
      await navigator.share({
        title: 'REDDCHAT - Сгенерированное изображение',
        text: image.prompt,
        files: [file]
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        copyImageLink(image)
      }
    }
  } else {
    copyImageLink(image)
  }
}

const copyImageLink = (image) => {
  const shareText = `Изображение создано с помощью REDDCHAT\nПромпт: ${image.prompt}\nСтиль: ${image.style}`
  navigator.clipboard.writeText(shareText)
  alert('Информация об изображении скопирована в буфер обмена')
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
