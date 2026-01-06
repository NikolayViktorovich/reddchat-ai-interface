<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
      
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-black">Настройки</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      
      <div class="p-6 overflow-y-auto scrollbar-thin" style="max-height: calc(90vh - 140px);">
        
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-black mb-3">Модель</h3>
          <div class="space-y-2">
            <label
              v-for="model in models"
              :key="model.id"
              class="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
              :class="selectedModel === model.name ? 'border-black bg-gray-50' : 'border-gray-200'"
            >
              <input
                type="radio"
                :value="model.name"
                v-model="selectedModel"
                class="mt-1 w-4 h-4 text-black focus:ring-black"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-black text-sm">{{ model.name }}</span>
                  <span v-if="model.recommended" class="px-2 py-0.5 bg-black text-white text-xs font-medium rounded">
                    Рекомендуется
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ model.description }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Скорость: {{ model.speed }}</span>
                  <span>Качество: {{ model.quality }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-black">Температура</h3>
            <span class="text-sm text-gray-600">{{ temperature }}</span>
          </div>
          <input
            type="range"
            v-model="temperature"
            min="0"
            max="2"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>Точный</span>
            <span>Сбалансированный</span>
            <span>Креативный</span>
          </div>
        </div>

        
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-black">Максимум токенов</h3>
            <span class="text-sm text-gray-600">{{ maxTokens }}</span>
          </div>
          <input
            type="range"
            v-model="maxTokens"
            min="256"
            max="4096"
            step="256"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-black mb-3">Тема оформления</h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="selectedTheme = theme.id"
              class="p-3 border-2 rounded-lg transition-all hover:bg-gray-50"
              :class="selectedTheme === theme.id ? 'border-black bg-gray-50' : 'border-gray-200'"
            >
              <svg class="w-6 h-6 mx-auto mb-2" :class="selectedTheme === theme.id ? 'text-black' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="theme.iconPath" />
              </svg>
              <p class="text-sm font-medium text-black">{{ theme.name }}</p>
            </button>
          </div>
        </div>

        
        <div>
          <h3 class="text-sm font-semibold text-black mb-3">Язык интерфейса</h3>
          <select
            v-model="selectedLanguage"
            class="w-full px-4 py-2.5 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:border-black"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
        >
          Отмена
        </button>
        <button
          @click="saveSettings"
          class="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-colors text-sm font-medium"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentModel: String
})

const emit = defineEmits(['close', 'update-model'])

const selectedModel = ref(props.currentModel)
const temperature = ref(0.7)
const maxTokens = ref(2048)
const selectedTheme = ref('light')
const selectedLanguage = ref('ru')

const models = [
  {
    id: 1,
    name: 'GPT-4 Turbo',
    description: 'Самая мощная модель с расширенными возможностями',
    speed: 'Средняя',
    quality: 'Отличное',
    recommended: true
  },
  {
    id: 2,
    name: 'GPT-4',
    description: 'Сбалансированная модель для большинства задач',
    speed: 'Средняя',
    quality: 'Высокое'
  },
  {
    id: 3,
    name: 'GPT-3.5 Turbo',
    description: 'Быстрая модель для простых задач',
    speed: 'Высокая',
    quality: 'Хорошее'
  }
]

const themes = [
  { 
    id: 'light', 
    name: 'Светлая', 
    iconPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  },
  { 
    id: 'dark', 
    name: 'Темная', 
    iconPath: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
  },
  { 
    id: 'auto', 
    name: 'Авто', 
    iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  }
]

const saveSettings = () => {
  emit('update-model', selectedModel.value)
  emit('close')
}
</script>
