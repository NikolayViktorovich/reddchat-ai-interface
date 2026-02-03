<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 animate-fade-in"
    @click.self="cancel"
  >
    <div class="bg-black rounded-xl border border-white/10 w-full max-w-md shadow-2xl animate-scale-in">
      <div class="p-5 border-b border-white/10">
        <h2 class="text-base text-white">{{ title }}</h2>
      </div>

      <div class="p-5">
        <p class="text-white text-sm leading-relaxed mb-4">{{ message }}</p>
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative">
            <input type="checkbox" v-model="dontAskAgain" class="sr-only peer" />
            <div class="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-white peer-checked:border-white transition-all duration-75 flex items-center justify-center">
              <svg v-if="dontAskAgain" class="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span class="text-sm text-white/70 group-hover:text-white transition-colors">Больше не спрашивать</span>
        </label>
      </div>

      <div class="p-5 border-t border-white/10 flex items-center justify-end gap-3">
        <button @click="cancel" class="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm">Отмена</button>
        <button @click="confirm" class="px-5 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-all text-sm">Подтвердить</button>
      </div>
    </div>
  </div>
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
  if (key && localStorage.getItem(`confirm_${key}`) === 'true') return Promise.resolve(true)
  title.value = dialogTitle
  message.value = dialogMessage
  storageKey.value = key
  dontAskAgain.value = false
  isOpen.value = true
  return new Promise((resolve) => { resolvePromise = resolve })
}

const confirm = () => {
  isOpen.value = false
  if (dontAskAgain.value && storageKey.value) localStorage.setItem(`confirm_${storageKey.value}`, 'true')
  if (resolvePromise) { resolvePromise(true); resolvePromise = null }
}

const cancel = () => {
  isOpen.value = false
  if (resolvePromise) { resolvePromise(false); resolvePromise = null }
}

defineExpose({ show })
</script>
