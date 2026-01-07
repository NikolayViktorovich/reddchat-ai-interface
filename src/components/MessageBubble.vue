<template>
  <div class="mb-6 animate-fade-in">
    <div v-if="message.role === 'user'" class="flex justify-end">
      <div class="max-w-3xl">
        <div class="bg-white/5 text-white rounded-3xl px-5 py-3 border border-white/10">
          <p v-if="message.content" class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
          <div v-if="message.files?.length" class="mt-3 space-y-2">
            <template v-for="(file, i) in message.files" :key="i">
              <img v-if="file.type?.startsWith('image/')" :src="file.content" :alt="file.name" class="max-w-xs rounded-xl border border-white/10" loading="lazy" />
              <div v-else class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span class="text-gray-300">{{ file.name }}</span>
              </div>
            </template>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-1.5 text-right">{{ formatTime(message.timestamp) }}</p>
      </div>
    </div>

    <div v-else class="flex">
      <div class="max-w-3xl">
        <div class="text-white">
          <div v-html="formatted" class="markdown-content text-sm"></div>
          <span v-if="message.isTyping" class="inline-block w-1.5 h-4 bg-white/50 ml-0.5 animate-pulse"></span>
        </div>
        <div class="flex items-center gap-2 mt-1.5">
          <p class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</p>
          <span v-if="message.isStopped" class="text-xs text-gray-500">• Остановлено</span>
          <button v-if="!message.isTyping" @click="copy" class="p-1 text-gray-500 hover:text-gray-300">
            <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <svg v-else class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
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
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, { language: lang }).value } catch {}
    }
    return code
  },
  breaks: true,
  gfm: true
})

const props = defineProps({ message: Object })
const copied = ref(false)

const formatted = computed(() => {
  if (!props.message.content) return ''
  try { return marked.parse(props.message.content) } catch { return props.message.content }
})

const formatTime = (t) => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch {}
}
</script>

<style>
@import 'highlight.js/styles/atom-one-dark.css';

.markdown-content { line-height: 1.6; }
.markdown-content pre { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; overflow-x: auto; margin: 10px 0; border: 1px solid rgba(255,255,255,0.1); }
.markdown-content code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }
.markdown-content pre code { background: transparent; padding: 0; }
.markdown-content :not(pre) > code { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; color: #e06c75; }
.markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 20px; margin-bottom: 10px; }
.markdown-content ul, .markdown-content ol { margin: 10px 0; padding-left: 20px; }
.markdown-content li { margin: 4px 0; }
.markdown-content blockquote { border-left: 3px solid rgba(255,255,255,0.2); padding-left: 12px; margin: 10px 0; color: rgba(255,255,255,0.7); }
.markdown-content a { color: #61afef; }
.markdown-content p { margin-bottom: 10px; }
</style>
