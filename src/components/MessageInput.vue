<template>
  <div class="message-input-wrapper">
    <!-- Attached Files -->
    <div v-if="attachedFiles.length" class="mb-3 flex flex-wrap gap-2">
      <div 
        v-for="(file, index) in attachedFiles" 
        :key="index" 
        class="file-chip"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-white text-sm truncate max-w-[200px]">{{ file.name }}</span>
        <button 
          @click="removeFile(index)" 
          class="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div class="input-container">
      <!-- Attach File Button -->
      <button 
        @click="$refs.fileInput.click()" 
        class="attach-button"
        type="button"
        :disabled="disabled"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      <input 
        ref="fileInput" 
        type="file" 
        class="hidden" 
        :accept="fileAccept" 
        multiple 
        @change="handleFileSelect"
      />

      <textarea
        ref="textarea"
        v-model="localMessage"
        @keydown.enter.exact.prevent="handleSend"
        @input="handleInput"
        placeholder="Напишите сообщение..."
        class="message-textarea"
        rows="1"
        :disabled="disabled"
      ></textarea>

      <button 
        v-if="!isGenerating"
        @click="handleSend" 
        :disabled="!canSend"
        class="send-button"
        type="button"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      <button 
        v-else
        @click="$emit('stop')" 
        class="stop-button"
        type="button"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  isGenerating: { type: Boolean, default: false },
  fileAccept: { type: String, default: 'image/*,.pdf,.doc,.docx,.txt,.md' }
})

const emit = defineEmits(['update:modelValue', 'send', 'stop'])

const localMessage = ref(props.modelValue)
const attachedFiles = ref([])
const textarea = ref(null)

const canSend = computed(() => (localMessage.value.trim() || attachedFiles.value.length) && !props.disabled)

watch(() => props.modelValue, v => localMessage.value = v)
watch(localMessage, v => emit('update:modelValue', v))

const handleInput = () => {
  if (!textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = Math.min(textarea.value.scrollHeight, 200) + 'px'
}

const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error)
  file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file)
})

const handleFileSelect = async e => {
  for (const file of Array.from(e.target.files)) {
    try {
      attachedFiles.value.push({
        name: file.name,
        content: await readFile(file),
        type: file.type
      })
    } catch {}
  }
  e.target.value = ''
}

const removeFile = i => attachedFiles.value.splice(i, 1)

const handleSend = () => {
  if (!canSend.value) return
  
  emit('send', {
    text: localMessage.value.trim(),
    files: [...attachedFiles.value]
  })
  
  localMessage.value = ''
  attachedFiles.value = []
  nextTick(() => textarea.value && (textarea.value.style.height = 'auto'))
}

defineExpose({
  focus: () => textarea.value?.focus(),
  clear: () => {
    localMessage.value = ''
    attachedFiles.value = []
  }
})
</script>

<style scoped>
.message-input-wrapper {
  width: 100%;
}

.file-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.input-container {
  position: relative;
  background: rgba(10, 10, 10, 1);
  border: 1px solid rgba(50, 50, 50, 1);
  border-radius: 9999px;
  transition: border-color 0.2s;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .input-container {
    padding: 0.5rem 0.75rem;
    background: rgba(10, 10, 10, 1);
    border: 1px solid rgba(50, 50, 50, 1);
  }
}

.input-container:focus-within {
  border-color: rgba(255, 255, 255, 0.2);
}

.attach-button {
  padding: 0.5rem;
  color: rgb(255, 255, 255);
  transition: color 0.2s;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .attach-button {
    color: rgb(255, 255, 255);
  }
  
  .attach-button:hover:not(:disabled) {
    color: rgb(200, 200, 200);
  }
}

.attach-button:hover:not(:disabled) {
  color: rgb(200, 200, 200);
}

.attach-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-textarea {
  flex: 1;
  background: transparent;
  color: white;
  font-size: 0.875rem;
  line-height: 1.5rem;
  resize: none;
  min-height: 20px;
  max-height: 200px;
  overflow-y: auto;
  border: none;
  outline: none;
  display: block;
}

.message-textarea::placeholder {
  color: rgb(130, 130, 130);
}

@media (max-width: 640px) {
  .message-textarea::placeholder {
    color: rgb(130, 130, 130);
  }
}

.message-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-textarea::-webkit-scrollbar {
  width: 6px;
}

.message-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: rgb(55, 65, 81);
  border-radius: 9999px;
}

.send-button,
.stop-button {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button {
  background: black;
  border-color: rgba(80, 80, 80, 1);
  color: white;
}

@media (max-width: 640px) {
  .send-button {
    background: black;
    border-color: rgba(80, 80, 80, 1);
    color: white;
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .send-button:hover:not(:disabled) {
    background: white;
    border-color: white;
    color: black;
  }
  
  .send-button:disabled {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(80, 80, 80, 0.3);
    color: rgba(255, 255, 255, 0.3);
  }
}

.send-button:hover:not(:disabled) {
  background: white;
  border-color: white;
  color: black;
}

.send-button:disabled {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(80, 80, 80, 0.3);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.stop-button {
  border-color: rgba(239, 68, 68, 0.5);
  color: rgba(239, 68, 68, 0.7);
}

.stop-button:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
