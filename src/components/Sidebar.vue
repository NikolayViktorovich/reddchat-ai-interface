<template>
  <div :class="['h-full glass-sidebar flex flex-col rounded-2xl mr-0 lg:mr-3 overflow-visible transition-all duration-200', collapsed && !isMobile ? 'w-16' : 'w-60']">
    <div class="px-5 pt-8 pb-6 border-b border-white/10 flex items-center justify-center">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </div>
    
    <div class="flex-1 overflow-y-auto overflow-x-visible scrollbar-thin py-2">
      <div v-if="!collapsed || isMobile" class="px-2">
        <button @click="$emit('show-history')" class="search-button relative w-full mb-2 flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-full border border-white/10 transition-colors text-sm">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span>Поиск ⌘K</span>
        </button>
      </div>

      <button v-if="!collapsed || isMobile" @click="$emit('new-chat')" class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/5 transition-colors duration-150 text-sm">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        <span>Чат</span>
      </button>

      <button v-if="!collapsed || isMobile" class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/5 transition-colors duration-150 text-sm" @click="$emit('show-history')">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>История</span>
      </button>

      <button v-if="!collapsed || isMobile" :class="['sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 text-sm', currentMode === 'programmer' ? 'text-white bg-white/10' : 'text-white hover:bg-white/5']" @click="$emit('change-mode', 'programmer')">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        <span>Программист</span>
      </button>

      <button v-if="!collapsed || isMobile" class="sidebar-btn w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/5 transition-colors duration-150 text-sm" @click="$emit('show-translator')">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
        <span>Переводчик</span>
      </button>

      <div v-if="!collapsed || isMobile" class="mt-6 px-4">
        <div v-if="pinnedConversations.length" class="mb-4">
          <div class="flex items-center gap-2 mb-2 px-2">
            <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <p class="text-xs text-white/70 uppercase tracking-wide">Закреплено</p>
          </div>
          <div v-for="conv in pinnedConversations" :key="conv.id" @click="$emit('select-conversation', conv.id)" class="group relative mb-1 rounded-lg cursor-pointer transition-colors text-sm" :class="conv.id === currentConversationId ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'">
            <div v-if="editingId === conv.id" class="flex items-center gap-2 px-3 py-2.5 bg-white/10 rounded-lg" @click.stop>
              <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0" autofocus />
              <button @click="cancelEdit" class="p-1 text-white/70 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <button @click="saveEdit(conv.id)" class="p-1 text-white/70 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </button>
            </div>
            <div v-else class="flex items-center px-2 py-2">
              <p class="truncate flex-1">{{ conv.title }}</p>
              <button @click.stop="toggleMenu(conv.id)" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity ml-1 flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
              </button>
            </div>
            <div v-if="openMenuId === conv.id" class="absolute top-full left-0 mt-1 w-40 bg-black rounded-lg border border-white/10 shadow-xl z-[100] overflow-hidden animate-dropdown">
              <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
              <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Открепить</button>
              <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2 px-2 mt-4">
          <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-xs text-white/70 uppercase tracking-wide">Недавние</p>
        </div>
        <div class="text-xs text-white/50 px-2 py-1 mb-1">2025</div>
        <div v-for="conv in unpinnedConversations.slice(0, 5)" :key="conv.id" @click="$emit('select-conversation', conv.id)" class="group relative mb-1 rounded-lg cursor-pointer transition-colors text-sm" :class="conv.id === currentConversationId ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'">
          <div v-if="editingId === conv.id" class="flex items-center gap-2 px-3 py-2.5 bg-white/10 rounded-lg" @click.stop>
            <input v-model="editingTitle" @keydown.enter="saveEdit(conv.id)" @keydown.escape="cancelEdit" class="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0" autofocus />
            <button @click="cancelEdit" class="p-1 text-white/70 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <button @click="saveEdit(conv.id)" class="p-1 text-white/70 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>
          <div v-else class="flex items-center px-2 py-2">
            <p class="truncate flex-1">{{ conv.title }}</p>
            <button @click.stop="toggleMenu(conv.id)" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity ml-1 flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
            </button>
          </div>
          <div v-if="openMenuId === conv.id" class="absolute top-full left-0 mt-1 w-40 bg-black rounded-lg border border-white/10 shadow-xl z-[100] overflow-hidden animate-dropdown">
            <button @click.stop="startEdit(conv)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>Переименовать</button>
            <button @click.stop="handlePin(conv.id)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"/></svg>Закрепить</button>
            <button @click.stop="handleDelete(conv.id)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Удалить</button>
          </div>
        </div>
      </div>

      <div v-else-if="!isMobile" class="flex flex-col items-center gap-2 mt-4">
        <button class="p-2.5 text-white hover:bg-white/5 rounded-lg transition-colors" @click="$emit('new-chat')" title="Новый чат">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button class="p-2.5 text-white hover:bg-white/5 rounded-lg transition-colors" @click="$emit('show-history')" title="История">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </button>
        <button :class="['p-2.5 rounded-lg transition-colors', currentMode === 'programmer' ? 'text-white bg-white/10' : 'text-white hover:bg-white/5']" @click="$emit('change-mode', 'programmer')" title="Режим программиста">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </button>
        <button class="p-2.5 text-white hover:bg-white/5 rounded-lg transition-colors" @click="$emit('show-translator')" title="Переводчик">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
        </button>
      </div>
    </div>

    <div class="p-4 border-t border-white/10">
      <button v-if="!isMobile" @click="collapsed = !collapsed" class="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({ conversations: Array, currentConversationId: Number, currentMode: String })
const emit = defineEmits(['new-chat', 'select-conversation', 'delete-conversation', 'show-history', 'show-translator', 'change-mode', 'pin-conversation', 'rename-conversation'])

const collapsed = ref(false)
const isMobile = ref(window.innerWidth < 1024)
const pinnedConversations = computed(() => props.conversations.filter(c => c.pinned))
const unpinnedConversations = computed(() => props.conversations.filter(c => !c.pinned))

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
}

const openMenuId = ref(null)
const editingId = ref(null)
const editingTitle = ref('')

const toggleMenu = (id) => { openMenuId.value = openMenuId.value === id ? null : id }
const startEdit = (conv) => { 
  editingId.value = conv.id
  editingTitle.value = conv.title
  openMenuId.value = null 
}
const saveEdit = (id) => { 
  if (editingTitle.value.trim()) {
    emit('rename-conversation', { id, title: editingTitle.value.trim() })
  }
  editingId.value = null
  editingTitle.value = ''
}
const cancelEdit = () => { 
  editingId.value = null
  editingTitle.value = ''
}
const handlePin = (id) => { emit('pin-conversation', id); openMenuId.value = null }
const handleDelete = (id) => { emit('delete-conversation', id); openMenuId.value = null }
const handleClickOutside = (e) => { 
  if (openMenuId.value && !e.target.closest('.group')) {
    openMenuId.value = null
  }
  if (editingId.value && !e.target.closest('.group')) {
    cancelEdit()
  }
}

defineExpose({
  closeMenus: () => {
    openMenuId.value = null
    editingId.value = null
    editingTitle.value = ''
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.truncate-fade { white-space: nowrap; overflow: hidden; mask-image: linear-gradient(to right, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%); }
.sidebar-btn svg { transition: transform 0.2s ease; }
.search-button:focus {
  outline: none;
  box-shadow: none;
}
</style>
