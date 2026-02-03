# REDDCHAT

Современный AI-ассистент с минималистичным дизайном и поддержкой reasoning. Общение с DeepSeek R1 Chimera, встроенный переводчик, управление историей диалогов.

![Скриншот](https://i.postimg.cc/N0P0sXjw/Снимок_экрана_2026_02_03_в_23_34_30.png)
![Скриншот](https://i.postimg.cc/nLwLFmhx/Снимок_экрана_2026_02_03_в_23_35_35.png)

## Live Demo

[Посмотреть Демо](https://reddchat-ai-interface.vercel.app/)

## Особенности

- **Визуализация процесса мышления AI**
- **Потоковая генерация** 
- **Встроенный переводчик** - Google Translate API
- **История диалогов** - поиск, закрепление, переименование
- **Режим программиста** - загрузка файлов кода
- **Markdown + подсветка кода** - красивое форматирование
- **Адаптивный дизайн** - работает на всех устройствах
- **Темная тема** - приятный для глаз интерфейс

## Технологии

- Vue 3 (Composition API)
- Vite 5
- Tailwind CSS 3
- Marked + Highlight.js
- OpenRouter API

## Установка

```bash
git clone https://github.com/NikolayViktorovich/reddchat-ai-interface.git
cd reddchat-ai-interface
npm install
```

Создайте `.env` файл:
```env
VITE_API_KEY=your_openrouter_api_key
VITE_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_MODEL=tngtech/deepseek-r1t-chimera:free
```

Получить API ключ: [OpenRouter](https://openrouter.ai/)

Запуск:
```bash
npm run dev
```

Сборка:
```bash
npm run build
```