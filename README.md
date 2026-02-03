# REDD-CHAT

Минималистичный AI-ассистент с чистым дизайном. Общение с DeepSeek R1, встроенный переводчик, управление историей диалогов.

![Скриншот](https://i.postimg.cc/KjCRZZHT/Snimok-ekrana-2026-01-08-v-02-13-21.png)
![Скриншот](https://i.postimg.cc/FKGzYbBC/Snimok-ekrana-2026-01-08-v-02-15-29.png)

## Live Demo

[Посмотреть Демо](https://reddchat-ai-interface.vercel.app/)

## Функции

- AI чат через OpenRouter API
- Переводчик на базе Google Translate
- История диалогов с поиском и закреплением
- Режим программиста для разработчиков
- Потоковая генерация ответов
- Markdown и подсветка кода
- Адаптивный дизайн

## Технологии

- Vue 3 + Composition API
- Vite 5
- Tailwind CSS 3
- Marked + Highlight.js
- OpenRouter API

## Установка

```bash
git clone https://github.com/your-username/redd-chat.git
cd redd-chat
npm install
```

Создайте `.env` файл:
```env
VITE_API_KEY=your_openrouter_api_key
VITE_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_MODEL=deepseek/deepseek-r1-0528:free
```

Запуск:
```bash
npm run dev
```

Сборка:
```bash
npm run build
```

## Структура

```
src/
├── components/      # Vue компоненты
├── composables/     # Переиспользуемая логика
├── utils/          # Утилиты (api, storage)
├── constants/      # Константы
└── App.vue         # Главный компонент
```
