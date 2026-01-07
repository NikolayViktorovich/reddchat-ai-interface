<template>
  <transition name="fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      @click.self="cancel"
    >
      <div class="bg-[#1a1a1d] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        
        <div class="p-6 border-b border-white/10">
          <h2 class="text-xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif;">{{ title }}</h2>
        </div>

        
        <div class="p-6">
          <p class="text-gray-300 text-base leading-relaxed mb-4">{{ message }}</p>
          
          
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input 
                type="checkbox" 
                v-model="dontAskAgain"
                class="sr-only peer"
              />
              <div class="w-5 h-5 rounded-md border-2 border-white/15 bg-white/5 peer-checked:bg-white peer-checked:border-white transition-all duration-75 flex items-center justify-center">
                <svg 
                  v-if="dontAskAgain"
                  class="w-3 h-3 text-gray-900" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Больше не спрашивать</span>
          </label>
        </div>

        
        <div class="p-6 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            @click="cancel"
            class="px-6 py-2.5 bg-white/5 hover:bg-gray-800/80 text-white rounded-xl transition-all duration-75"
          >
            Отмена
          </button>
          <button
            @click="confirm"
            class="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl transition-all duration-75"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const dontAskAgain = ref(false)
const storageKey = ref('')
let resolvePromise = null

const show = (dialogTitle, dialogMessage, key = '') => {
  if (key && localStorage.getItem(`confirm_${key}`) === 'true') {
    return Promise.resolve(true)
  }
  
  title.value = dialogTitle
  message.value = dialogMessage
  storageKey.value = key
  dontAskAgain.value = false
  isOpen.value = true
  
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  isOpen.value = false
  
  if (dontAskAgain.value && storageKey.value) {
    localStorage.setItem(`confirm_${storageKey.value}`, 'true')
  }
  
  if (resolvePromise) {
    resolvePromise(true)
    resolvePromise = null
  }
}

const cancel = () => {
  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
}

defineExpose({ show })
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
