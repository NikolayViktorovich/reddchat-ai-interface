<template>
  <div 
    v-if="true"
    class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6 animate-fade-in" 
    @click.self="$emit('close')"
  >
    <div class="glass-modal w-full md:max-w-lg md:rounded-2xl rounded-t-3xl border-t md:border border-white/5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up md:animate-scale-in">
      <div class="flex items-center justify-between p-4 md:p-6 border-b border-white/5">
        <h2 class="text-lg text-white font-medium">Настройки</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div>
          <h3 class="text-sm text-gray-400 mb-3">Модель</h3>
          <div class="space-y-2">
            <label v-for="model in models" :key="model.id" class="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border" :class="selectedModel === model.name ? 'bg-white/10 border-white/5' : 'bg-white/5 border-white/5 hover:bg-white/10'">
              <input type="radio" :value="model.name" v-model="selectedModel" class="mt-1 accent-white" />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-white text-sm">{{ model.name }}</span>
                  <span v-if="model.recommended" class="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">Рекомендуется</span>
                </div>
                <p class="text-gray-500 text-xs">{{ model.description }}</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm text-gray-400">Температура</h3>
            <span class="text-sm text-white">{{ temperature }}</span>
          </div>
          <input type="range" v-model="temperature" min="0" max="2" step="0.1" class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>Точный</span>
            <span>Креативный</span>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm text-gray-400">Максимум токенов</h3>
            <span class="text-sm text-white">{{ maxTokens }}</span>
          </div>
          <input type="range" v-model="maxTokens" min="256" max="4096" step="256" class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>

        <div>
          <h3 class="text-sm text-gray-400 mb-3">Язык интерфейса</h3>
          <select v-model="selectedLanguage" class="w-full px-4 py-3 bg-white/5 border border-white/5 text-white rounded-xl focus:outline-none">
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div class="p-4 md:p-6 border-t border-white/5 flex gap-3">
        <button @click="$emit('close')" class="flex-1 py-3 bg-white/5 text-white rounded-2xl text-sm hover:bg-white/10">Отмена</button>
        <button @click="saveSettings" class="flex-1 py-3 bg-white/10 text-white rounded-2xl text-sm border border-white/5 hover:bg-white/15">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ currentModel: String })
const emit = defineEmits(['close', 'update-model'])

const selectedModel = ref(props.currentModel)
const temperature = ref(0.7)
const maxTokens = ref(2048)
const selectedLanguage = ref('ru')

const models = [
  { id: 1, name: 'GPT-4 Turbo', description: 'Самая мощная модель', recommended: true },
  { id: 2, name: 'GPT-4', description: 'Сбалансированная модель' },
  { id: 3, name: 'GPT-3.5 Turbo', description: 'Быстрая модель' }
]

const saveSettings = () => { emit('update-model', selectedModel.value); emit('close') }
</script>
