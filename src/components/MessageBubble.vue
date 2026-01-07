<template>
  <div class="mb-8 animate-fade-in">
    <div v-if="message.role === 'user'" class="flex justify-end">
      <div class="max-w-3xl">
        <div class="bg-white/5 backdrop-blur-sm text-white rounded-3xl px-6 py-4 border border-white/10">
          <p v-if="message.content" class="text-base leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
          <div v-if="message.files && message.files.length > 0" class="mt-3 space-y-2">
            <div v-for="(file, index) in message.files" :key="index">
              <img 
                v-if="file.type && file.type.startsWith('image/')" 
                :src="file.content" 
                :alt="file.name"
                class="max-w-xs rounded-xl border border-white/10"
              />
              <div 
                v-else 
                class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-gray-300">{{ file.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2 text-right">{{ formatTime(message.timestamp) }}</p>
      </div>
    </div>

    <div v-else class="flex">
      <div class="max-w-3xl">
        <div class="text-white">
          <div v-html="formattedContent" class="markdown-content text-base"></div>
          <span v-if="message.isTyping" class="inline-block w-2 h-5 bg-white/50 ml-1 animate-pulse"></span>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <p class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</p>
          <p v-if="message.isStopped" class="text-xs text-gray-500">• Остановлено</p>
          <div v-if="!message.isTyping" class="flex items-center gap-1.5">
            <button
              @click="copyToClipboard"
              class="p-1.5 hover:bg-white/5/50 rounded-lg transition-all duration-75 group"
              title="Копировать"
            >
              <svg v-if="!copied" class="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-white/5/50 rounded-lg transition-all duration-75 group"
              title="Хорошо"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-white/5/50 rounded-lg transition-all duration-75 group"
              title="Плохо"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-white/5/50 rounded-lg transition-all duration-75 group"
              title="Поделиться"
            >
              <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error(err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const props = defineProps({
  message: Object
})

const copied = ref(false)

const formattedContent = computed(() => {
  if (!props.message.content) return ''
  try {
    return marked.parse(props.message.content)
  } catch (e) {
    return props.message.content
  }
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style>
@import 'highlight.js/styles/atom-one-dark.css';

.markdown-content {
  line-height: 1.7;
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-content code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: #e06c75;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-family: 'Space Grotesk', sans-serif;
}

.markdown-content ul,
.markdown-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 6px 0;
}

.markdown-content blockquote {
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  padding-left: 16px;
  margin: 12px 0;
  color: rgba(255, 255, 255, 0.7);
}

.markdown-content a {
  color: #61afef;
  text-decoration: underline;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  text-align: left;
}

.markdown-content th {
  background: rgba(255, 255, 255, 0.05);
}
</style>
