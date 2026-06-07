# 🚀 Быстрый запуск

## 1. Установка зависимостей
```bash
npm install --legacy-peer-deps
```

## 2. Генерация Prisma клиента
```bash
npx prisma generate
```

## 3. Настройка .env
Создайте файл `.env` с переменными:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crash_game"
BOT_TOKEN="your_telegram_bot_token"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_WS_URL="ws://localhost:4001"
```

## 4. Запуск системы

### Терминал 1: WebSocket сервер
```bash
npm run ws
```

### Терминал 2: Next.js приложение
```bash
npm run dev
```

## 5. Проверка работы
- Откройте http://localhost:3000
- WebSocket сервер работает на ws://localhost:4001
- База данных должна быть доступна по DATABASE_URL

## 🔧 Что изменилось

### WebSocket сервер (ws-server.js):
- ✅ Интеграция с Prisma/PostgreSQL
- ✅ Реальные балансы из БД
- ✅ История игр в БД
- ✅ Транзакции для атомарности
- ✅ Авторизация через Telegram

### Клиент:
- ✅ Синхронизация баланса
- ✅ История игр
- ✅ Улучшенный UX
- ✅ Обработка ошибок

### База данных:
- ✅ Модели User, Game, GameSession, Transaction
- ✅ Связи между таблицами
- ✅ Миграции готовы

## 🎯 Готово к использованию!

Система полностью интегрирована с БД и готова к работе. 