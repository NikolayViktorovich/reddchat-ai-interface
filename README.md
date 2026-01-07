# REDD-CHAT AI ASSISTENT

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Минималистичный AI-чат с современным glassmorphism дизайном

[Демо](#) • [Установка](#установка) • [Возможности](#возможности)

</div>

---

## О проекте

Современный интерфейс с анимированным градиентным фоном, стеклянными панелями и плавными переходами.

---

## Возможности

### AI Чат
- Интеграция с **DeepSeek R1** через OpenRouter API
- Потоковая генерация ответов (streaming)
- Поддержка Markdown в ответах (заголовки, списки, код)
- Подсветка синтаксиса в блоках кода
- Возможность остановить генерацию

### Управление диалогами
- Создание новых чатов
- Закрепление важных диалогов
- Переименование диалогов
- Удаление с подтверждением
- Поиск по истории

### Переводчик
- Встроенный переводчик на базе Google Translate API
- Поддержка множества языков
- Автоопределение языка
- Быстрая смена направления перевода

### Дизайн
- Glassmorphism UI с размытием фона
- Анимированный градиентный фон
- Плавные переходы и микроанимации
- Кастомные иконки при наведении
- Адаптивный дизайн (mobile-first)

### Хранение данных
- Автосохранение в localStorage
- Сохранение истории диалогов
- Сохранение настроек и режимов

---

## Технологии

### Frontend
- **Vue.js 3.4**
- **Composition API**

### Сборка и разработка
- **Vite 5.0**
- **@vitejs/plugin-vue**

### Стилизация
- **Tailwind CSS 3.4**
- **PostCSS 8.4**
- **Autoprefixer 10.4**

### Обработка контента
- **Marked 11.2**
- **Highlight.js 11.11**

### HTTP и сеть
- **Axios 1.13**
- **Fetch API**

### API интеграции
- **OpenRouter API**
- **Google Translate API**

### Шрифты
- **SB Sans Interface**
- **Orbitron**
- **JetBrains Mono**

### Дополнительно
- **localStorage API**
- **CSS Animations**
- **SVG Icons** 
- **Glassmorphism**

---

## Установка

```bash
git clone https://github.com/your-username/redd-chat.git
cd redd-chat
npm install
npm run dev
```

Сборка: `npm run build`
