<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-6" @click.self="$emit('close')">
      <div class="modal-content glass-modal w-full md:max-w-7xl h-[90vh] md:rounded-2xl rounded-t-3xl border-t md:border border-white/5 flex flex-col md:flex-row overflow-hidden">
      <div class="md:hidden flex items-center justify-between p-4 border-b border-white/5">
        <h2 class="text-lg text-white font-medium">История диалогов</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="md:hidden flex-1 flex flex-col overflow-hidden">
        <div class="p-3 border-b border-white/5">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="searchQuery" type="text" placeholder="Поиск..." class="w-full pl-10 pr-3 py-2.5 bg-white/5 text-white text-sm placeholder-gray-400 rounded-xl border border-white/5 focus:outline-none" />
          </div>
        </div>

        <Transition name="slide-right" mode="out-in">
          <div v-if="!mobileSelectedConv" key="list" class="flex-1 overflow-y-auto">
            <div v-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center h-full p-6">
              <p class="text-gray-400 text-sm">{{ searchQuery ? 'Ничего не найдено' : 'История пуста' }}</p>
            </div>
            <div v-else class="divide-y divide-white/5">
              <div v-for="conv in filteredConversations" :key="conv.id" class="flex items-center justify-between p-4 active:bg-white/5 transition-colors" @click="mobileSelectedConv = conv">
                <div class="flex-1 min-w-0 mr-3">
                  <div class="flex items-center gap-2">
                    <svg v-if="conv.pinned" class="w-4 h-4 text-white flex-shrink-0" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>
                    <h3 class="text-white text-sm truncate">{{ conv.title }}</h3>
                  </div>
                  <p class="text-gray-500 text-xs mt-1">{{ formatDate(conv.createdAt) }} • {{ conv.messages.length }} сообщ.</p>
                </div>
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>

          <div v-else key="detail" class="flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center gap-3 p-4 border-b border-white/5">
              <button @click="mobileSelectedConv = null" class="p-1 text-gray-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
              <div class="flex-1 min-w-0">
                <h3 class="text-white text-sm truncate">{{ mobileSelectedConv.title }}</h3>
                <p class="text-gray-500 text-xs">{{ formatDate(mobileSelectedConv.createdAt) }}</p>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div v-for="message in mobileSelectedConv.messages" :key="message.id" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] rounded-2xl px-3 py-2 text-sm" :class="message.role === 'user' ? 'bg-white/10 text-white whitespace-pre-wrap' : 'bg-white/5 text-white'">
                  <div v-if="message.role === 'assistant'" v-html="formatMarkdown(message.content)" class="markdown-content"></div>
                  <span v-else>{{ message.content }}</span>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-white/5">
              <button @click="openMobileConversation" class="w-full py-3 bg-white/10 text-white rounded-2xl text-sm font-medium">Открыть диалог</button>
            </div>
          </div>
        </Transition>
      </div>

      <div class="hidden md:flex w-96 flex-col border-r border-white/5">
        <div class="p-6 border-b border-white/5">
          <h2 class="text-xl text-white mb-1">История диалогов</h2>
          <p class="text-gray-400 text-sm">Всего: {{ conversations.length }}</p>
        </div>
        <div class="p-4 border-b border-white/5">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="searchQuery" type="text" placeholder="Поиск..." class="w-full pl-10 pr-3 py-2 bg-white/5 text-white text-sm placeholder-gray-400 rounded-xl border border-white/5 focus:outline-none" />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div v-if="filteredConversations.length === 0" class="text-center py-12"><p class="text-gray-400 text-sm">{{ searchQuery ? 'Ничего не найдено' : 'История пуста' }}</p></div>
          <div v-else class="space-y-1">
            <div v-if="pinnedConversations.length" class="mb-4">
              <p class="text-xs text-gray-400 mb-2 px-2">Закреплённые</p>
              <div v-for="conv in pinnedConversations" :key="conv.id" class="group relative bg-transparent hover:bg-white/5 rounded-xl cursor-pointer transition-all" :class="{ 'bg-white/10': conv.id === selectedConvId }" @click="selectedConvId = conv.id" @dblclick="openConversation">
                <div v-if="editingId === conv.id" class="flex items-center gap-1 p-3" @click.stop>
                  <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none min-w-0" autofocus />
                  <button @click="saveEdit(conv.id)" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>
                  <button @click="cancelEdit" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <div v-else class="flex items-center p-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-white text-sm mb-1 truncate">{{ conv.title }}</h3>
                    <p class="text-gray-400 text-xs">{{ formatDate(conv.createdAt) }} • {{ conv.messages.length }} сообщ.</p>
                  </div>
                  <button @click.stop="toggleMenu(conv.id)" class="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-opacity flex-shrink-0 ml-2">
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                  </button>
                </div>
                <div v-if="openMenuId === conv.id" class="absolute right-0 top-full mt-1 w-44 bg-[#252528] rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden animate-dropdown">
                  <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
                  <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10"><svg class="w-[18px] h-[18px]" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Открепить</button>
                  <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
                </div>
              </div>
            </div>
            <div v-if="unpinnedConversations.length">
              <p v-if="pinnedConversations.length" class="text-xs text-gray-400 mb-2 px-2">Остальные</p>
              <div v-for="conv in unpinnedConversations" :key="conv.id" class="group relative bg-transparent hover:bg-white/5 rounded-xl cursor-pointer transition-all" :class="{ 'bg-white/10': conv.id === selectedConvId }" @click="selectedConvId = conv.id" @dblclick="openConversation">
                <div v-if="editingId === conv.id" class="flex items-center gap-1 p-3" @click.stop>
                  <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none min-w-0" autofocus />
                  <button @click="saveEdit(conv.id)" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>
                  <button @click="cancelEdit" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <div v-else class="flex items-center p-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-white text-sm mb-1 truncate">{{ conv.title }}</h3>
                    <p class="text-gray-400 text-xs">{{ formatDate(conv.createdAt) }} • {{ conv.messages.length }} сообщ.</p>
                  </div>
                  <button @click.stop="toggleMenu(conv.id)" class="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-opacity flex-shrink-0 ml-2">
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                  </button>
                </div>
                <div v-if="openMenuId === conv.id" class="absolute right-0 top-full mt-1 w-44 bg-[#252528] rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden animate-dropdown">
                  <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
                  <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Закрепить</button>
                  <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden md:flex flex-1 flex-col">
        <div class="flex items-center justify-between p-6 border-b border-white/5">
          <div v-if="selectedConversation"><h2 class="text-xl text-white mb-1">{{ selectedConversation.title }}</h2><p class="text-gray-400 text-sm">{{ formatDate(selectedConversation.createdAt) }}</p></div>
          <div v-else><h2 class="text-xl text-white">Предпросмотр</h2></div>
          <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-white transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div v-if="!selectedConversation" class="flex flex-col items-center justify-center h-full">
            <svg class="w-12 h-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p class="text-gray-400 text-lg">Выбери разговор для предпросмотра</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="message in selectedConversation.messages" :key="message.id" class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-2xl rounded-2xl px-4 py-3 text-sm" :class="message.role === 'user' ? 'bg-white/10 text-white whitespace-pre-wrap' : 'bg-white/5 text-white'">
                <div v-if="message.role === 'assistant'" v-html="formatMarkdown(message.content)" class="markdown-content"></div>
                <span v-else>{{ message.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'

const formatMarkdown = (content) => { if (!content) return ''; try { return marked.parse(content) } catch { return content } }

const props = defineProps({ isOpen: Boolean, conversations: Array, currentConversationId: Number })
const emit = defineEmits(['close', 'select-conversation', 'delete-conversation', 'pin-conversation', 'rename-conversation'])

const searchQuery = ref('')
const selectedConvId = ref(null)
const mobileSelectedConv = ref(null)
const openMenuId = ref(null)
const editingId = ref(null)
const editingTitle = ref('')

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return props.conversations
  const query = searchQuery.value.toLowerCase()
  return props.conversations.filter(conv => conv.title.toLowerCase().includes(query) || conv.messages.some(msg => msg.content.toLowerCase().includes(query)))
})

const pinnedConversations = computed(() => filteredConversations.value.filter(c => c.pinned))
const unpinnedConversations = computed(() => filteredConversations.value.filter(c => !c.pinned))
const selectedConversation = computed(() => props.conversations.find(c => c.id === selectedConvId.value))

const toggleMenu = (id) => { openMenuId.value = openMenuId.value === id ? null : id }
const startEdit = (conv) => { editingId.value = conv.id; editingTitle.value = conv.title; openMenuId.value = null }
const saveEdit = (id) => { if (editingTitle.value.trim()) emit('rename-conversation', { id, title: editingTitle.value.trim() }); editingId.value = null }
const cancelEdit = () => { editingId.value = null }
const handlePin = (id) => { emit('pin-conversation', id); openMenuId.value = null }
const handleDelete = (id) => { emit('delete-conversation', id); openMenuId.value = null; if (selectedConvId.value === id) selectedConvId.value = null }
const openConversation = () => { if (selectedConvId.value) { emit('select-conversation', selectedConvId.value); emit('close') } }
const openMobileConversation = () => { if (mobileSelectedConv.value) { emit('select-conversation', mobileSelectedConv.value.id); emit('close'); mobileSelectedConv.value = null } }
const handleClickOutside = (e) => { if (openMenuId.value && !e.target.closest('.group')) openMenuId.value = null }

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const formatDate = (date) => {
  const d = new Date(date), now = new Date(), diff = now - d, days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Сегодня'; if (days === 1) return 'Вчера'; if (days < 7) return `${days} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.slide-right-enter-active, .slide-right-leave-active { transition: all 0.1s ease-out; }
.slide-right-enter-from { opacity: 0; transform: translateX(15px); }
.slide-right-leave-to { opacity: 0; transform: translateX(-15px); }
.markdown-content { line-height: 1.5; }
.markdown-content :deep(pre) { background: rgba(0,0,0,0.4); border-radius: 10px; padding: 12px; overflow-x: auto; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); }
.markdown-content :deep(code) { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }
.markdown-content :deep(pre code) { background: transparent; padding: 0; color: #abb2bf; }
.markdown-content :deep(:not(pre) > code) { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; color: #e06c75; }
.markdown-content :deep(p) { margin-bottom: 8px; }
</style>
