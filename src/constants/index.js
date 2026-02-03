export const STORAGE_KEYS = {
  CONVERSATIONS: 'conversations',
  CURRENT_CONVERSATION_ID: 'currentConversationId',
  CURRENT_MODEL: 'currentModel',
  CURRENT_MODE: 'currentMode'
}

export const MODES = {
  CHAT: 'chat',
  PROGRAMMER: 'programmer'
}

export const FILE_ACCEPT = {
  CHAT: 'image/*,.pdf,.doc,.docx,.txt,.md',
  PROGRAMMER: '*'
}

export const EXAMPLE_PROMPTS = [
  { short: 'Объясни алгоритм', full: 'Объясни мне подробно, как работает алгоритм быстрой сортировки' },
  { short: 'Помоги с кодом', full: 'Помоги мне разобраться с ошибкой в моем коде' },
  { short: 'Напиши функцию', full: 'Напиши функцию на Python для сортировки списка' }
]
