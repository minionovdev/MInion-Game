# Telegram Crash Game

Мотивация для додепа: https://soundcloud.com/user-820087579-852152761/dodep-icegergert-name

Честная crash-игра (аналог Aviator) с интеграцией Telegram и TON кошелька.

![Demo](0824.gif)

## 🚀 Особенности

- **Честная игра**: Вся логика на сервере, прозрачные seed/crashPoint
- **Синхронизация**: WebSocket для реального времени
- **База данных**: Prisma + PostgreSQL для истории и балансов
- **Telegram интеграция**: Авторизация через Telegram Web App
- **TON кошелек**: Поддержка TON Connect
- **Админка**: Управление пользователями, играми, выводами

## 🛠 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, WebSocket, Redis
- **База данных**: PostgreSQL, Prisma ORM
- **Игровой движок**: Phaser 3
- **Блокчейн**: TON Connect

## 📦 Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd telegram-crash-game
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env
```

Заполните `.env`:
```env
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/crash_game"

# Telegram
BOT_TOKEN="your_bot_token"
ADMIN_BOT_TOKEN="your_admin_bot_token"
ADMIN_USER_IDS="123456,789012"
ADMIN_USERNAMES="admin1,admin2"

# Redis
REDIS_URL="redis://localhost:6379"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:4001"
```

4. **Настройте базу данных**
```bash
# Создайте миграции
npx prisma migrate dev

# Сгенерируйте Prisma Client
npx prisma generate
```

## 🚀 Запуск

### Разработка

1. **Запустите Redis**
```bash
redis-server
```

2. **Запустите WebSocket сервер**
```bash
npm run ws
```

3. **Запустите Next.js приложение**
```bash
npm run dev
```

### Продакшн

1. **Соберите приложение**
```bash
npm run build
```

2. **Запустите серверы**
```bash
# WebSocket сервер
npm run ws

# Next.js приложение
npm start
```

## 🎮 Игровой процесс

1. **Авторизация**: Пользователь входит через Telegram
2. **Ставки**: 6 секунд на прием ставок
3. **Полет**: 3-6 секунд полета ракеты
4. **Вывод**: Игроки выводят деньги до краша
5. **Краш**: Ракета разбивается, невыведенные ставки сгорают

## 📊 База данных

### Основные модели:
- **User**: Пользователи, балансы, настройки
- **Game**: История игр, ставки, результаты
- **GameSession**: Игровые сессии
- **Transaction**: Транзакции (депозиты, выводы, игры)
- **ChatMessage**: Сообщения чата

### Миграции:
```bash
# Создать новую миграцию
npx prisma migrate dev --name add_new_feature

# Применить миграции
npx prisma migrate deploy
```

## 🔧 Админка

Доступна по адресу в отдельном боте для пользователей из `ADMIN_USER_IDS`.

**Функции:**
- Просмотр пользователей и их балансов
- История игр и транзакций
- Управление выводами средств
- Системная статистика

## 🎯 API Endpoints

### Игровые API:
- `POST /api/game/start` - Начать игру
- `POST /api/game/cashout` - Вывести деньги
- `GET /api/profile/games` - История игр пользователя

### Админ API:
- `GET /api/admin/users` - Список пользователей
- `GET /api/admin/games` - История всех игр
- `POST /api/admin/withdraw-action` - Действия с выводами

### WebSocket события:
- `auth` - Авторизация
- `bet` - Ставка
- `cashout` - Вывод
- `game-start` - Начало игры
- `game-flying` - Фаза полета
- `game-crash` - Краш

## 🔒 Безопасность

- Валидация Telegram initData
- Проверка балансов на сервере
- Транзакции БД для атомарности операций
- Блокировка аккаунтов
- Логирование всех операций

## 📈 Мониторинг

### Логи:
- WebSocket соединения
- Игровые события
- Ошибки БД
- Транзакции

### Метрики:
- Количество активных игроков
- Объем ставок
- Статистика выигрышей/проигрышей

## 🐛 Отладка

### WebSocket:
```bash
# Проверка соединения
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: localhost:4001" -H "Origin: http://localhost:4001" http://localhost:4001
```

### База данных:
```bash
# Просмотр данных
npx prisma studio

# Проверка схемы
npx prisma validate
```

## 📝 TODO

- [ ] Демо режим для новых пользователей
- [ ] Уведомления в Telegram
- [ ] Анимации выигрыша
- [ ] Турниры и лидерборды
- [ ] Мобильная оптимизация
- [ ] Аналитика и дашборды

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи
3. Внесите изменения
4. Создайте Pull Request
5. Можно поддержать проект, пишите в тг @magejs
