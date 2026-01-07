# REDD-CHAT

Современный AI-ассистент с минималистичным glassmorphism дизайном. Приложение предоставляет удобный интерфейс для общения с нейросетью DeepSeek R1, встроенный переводчик и гибкое управление историей диалогов.

![Скриншот](https://i.postimg.cc/KjCRZZHT/Snimok-ekrana-2026-01-08-v-02-13-21.png)
![Скриншот](https://i.postimg.cc/FKGzYbBC/Snimok-ekrana-2026-01-08-v-02-15-29.png)

## Live Demo

[Посмотреть Демо](https://reddchat-ai-interface.vercel.app/)

## Основные функции:

- AI Чат - общение с DeepSeek R1 через OpenRouter API
- Переводчик - перевод текста на базе Google Translate
- История диалогов - поиск, закрепление, переименование
- Режим программиста - специализированные ответы для разработчиков

## Возможности интерфейса:

- Glassmorphism UI с размытием фона
- Анимированный градиентный фон
- Потоковая генерация ответов (streaming)
- Поддержка Markdown и подсветка кода
- Адаптивный дизайн для мобильных устройств
- Автосохранение в localStorage

## Ключевые технологии:

- **Frontend:** Vue.js 3.4 + Composition API
- **Сборка:** Vite 5.0
- **Стили:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Контент:** Marked, Highlight.js
- **APIs:** OpenRouter API, Google Translate API

## Установка и Запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/redd-chat.git
```

2. Установите зависимости:
```bash
cd redd-chat
npm install
```

3. Запустите dev-сервер:
```bash
npm run dev
```

4. Сборка для продакшена:
```bash
npm run build
```
