<template>
  <div class="w-60 h-full glass-sidebar flex flex-col rounded-3xl border border-white/20 mr-0 lg:mr-3 font-light overflow-visible">
    <div class="px-5 pt-10 pb-8 text-center">
      <p class="text-3xl text-white/90 tracking-wide" style="font-family: 'Orbitron', sans-serif; font-weight: 300;">REDD</p>
      <p class="text-3xl text-white/90 tracking-wide -mt-1" style="font-family: 'Orbitron', sans-serif; font-weight: 600;">CHAT</p>
    </div>
    
    <div class="flex-1 overflow-y-auto overflow-x-visible scrollbar-thin py-2">
      <button @click="$emit('new-chat')" class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm">
        <svg class="w-5 h-5 icon-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span>Чат</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm" @click="$emit('show-history')">
        <svg class="w-5 h-5 icon-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>История</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 text-sm" :class="currentMode === 'programmer' ? 'text-white' : 'text-gray-300 hover:text-white'" @click="$emit('change-mode', 'programmer')">
        <svg class="w-5 h-5 icon-code" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        <span>Режим программиста</span>
      </button>

      <button class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white active:text-white/80 transition-colors duration-150 text-sm" @click="$emit('show-translator')">
        <svg class="w-5 h-5 icon-swing" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
        <span>Перевод</span>
      </button>

      <div class="mt-6 px-4">
        <div v-if="pinnedConversations.length" class="mb-4">
          <div class="flex items-center gap-2 mb-2 px-3">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>
            <p class="text-xs text-gray-400">Закреплено</p>
          </div>
          <div v-for="conv in pinnedConversations" :key="conv.id" @click="$emit('select-conversation', conv.id)" class="group relative mb-1 rounded-md cursor-pointer transition-colors text-sm" :class="conv.id === currentConversationId ? 'text-white' : 'text-gray-300 hover:text-white'">
            <div v-if="editingId === conv.id" class="flex items-center gap-1 px-3 py-2" @click.stop>
              <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none min-w-0" autofocus />
              <button @click="saveEdit(conv.id)" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>
              <button @click="cancelEdit" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div v-else class="flex items-center px-3 py-2">
              <p class="truncate-fade flex-1">{{ conv.title }}</p>
              <button @click.stop="toggleMenu(conv.id)" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity ml-1 flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
              </button>
            </div>
            <div v-if="openMenuId === conv.id" class="absolute top-full left-0 mt-1 w-40 bg-[#252528] rounded-xl border border-white/10 shadow-xl z-[100] overflow-hidden animate-dropdown">
              <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
              <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10"><svg class="w-[18px] h-[18px]" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Открепить</button>
              <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2 px-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-xs text-gray-400">История</p>
        </div>
        <div v-for="conv in unpinnedConversations.slice(0, 5)" :key="conv.id" @click="$emit('select-conversation', conv.id)" class="group relative mb-1 rounded-md cursor-pointer transition-colors text-sm" :class="conv.id === currentConversationId ? 'text-white' : 'text-gray-300 hover:text-white'">
          <div v-if="editingId === conv.id" class="flex items-center gap-1 px-3 py-2" @click.stop>
            <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none min-w-0" autofocus />
            <button @click="saveEdit(conv.id)" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>
            <button @click="cancelEdit" class="p-1 text-white hover:bg-white/10 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div v-else class="flex items-center px-3 py-2">
            <p class="truncate-fade flex-1">{{ conv.title }}</p>
            <button @click.stop="toggleMenu(conv.id)" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity ml-1 flex-shrink-0">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
            </button>
          </div>
          <div v-if="openMenuId === conv.id" class="absolute top-full left-0 mt-1 w-40 bg-[#252528] rounded-xl border border-white/10 shadow-xl z-[100] overflow-hidden animate-dropdown">
            <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
            <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Закрепить</button>
            <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"><svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({ conversations: Array, currentConversationId: Number, currentMode: String })
const emit = defineEmits(['new-chat', 'select-conversation', 'delete-conversation', 'show-history', 'show-translator', 'change-mode', 'pin-conversation', 'rename-conversation'])

const pinnedConversations = computed(() => props.conversations.filter(c => c.pinned))
const unpinnedConversations = computed(() => props.conversations.filter(c => !c.pinned))

const openMenuId = ref(null)
const editingId = ref(null)
const editingTitle = ref('')

const toggleMenu = (id) => { openMenuId.value = openMenuId.value === id ? null : id }
const startEdit = (conv) => { editingId.value = conv.id; editingTitle.value = conv.title; openMenuId.value = null }
const saveEdit = (id) => { if (editingTitle.value.trim()) emit('rename-conversation', { id, title: editingTitle.value.trim() }); editingId.value = null }
const cancelEdit = () => { editingId.value = null }
const handlePin = (id) => { emit('pin-conversation', id); openMenuId.value = null }
const handleDelete = (id) => { emit('delete-conversation', id); openMenuId.value = null }
const handleClickOutside = (e) => { if (openMenuId.value && !e.target.closest('.group')) openMenuId.value = null }

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.truncate-fade { white-space: nowrap; overflow: hidden; mask-image: linear-gradient(to right, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%); }
.sidebar-btn svg { transition: transform 0.2s ease; }
.sidebar-btn:hover .icon-rotate { transform: rotate(90deg); }
.sidebar-btn:hover .icon-bounce { animation: bounce 0.4s ease; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.sidebar-btn:hover .icon-code { animation: code 0.4s ease; }
@keyframes code { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.1); } }
.sidebar-btn:hover .icon-swing { animation: swing 0.4s ease; }
@keyframes swing { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
</style>
