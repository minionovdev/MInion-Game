# Telegram Crash Game
[Версия на русском языке 🇷🇺](README.ru.md)

<p align="center">
  <img src="0824.gif" alt="Demo" width="200"/>
</p>

Fair crash game (Aviator analog) with Telegram and TON wallet integration.

## 🚀 Features

- **Fair Play**: All logic runs on the server, transparent seed/crashPoint  
- **Real-time Sync**: WebSocket-powered gameplay  
- **Database**: Prisma + PostgreSQL for history and balances  
- **Telegram Integration**: Authorization via Telegram Web App  
- **TON Wallet**: TON Connect support  
- **Admin Panel**: Manage users, games, and withdrawals  

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS  
- **Backend**: Node.js, WebSocket, Redis  
- **Database**: PostgreSQL, Prisma ORM  
- **Game Engine**: Phaser 3  
- **Blockchain**: TON Connect  

## 📦 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd telegram-crash-game
```
2. **Install dependencies**

```
npm install
```
3. **Configure environment variables**
Fill .env:
```
DATABASE_URL="postgresql://user:password@localhost:5432/crash_game"
BOT_TOKEN="your_bot_token"
ADMIN_BOT_TOKEN="your_admin_bot_token"
ADMIN_USER_IDS="123456,789012"
ADMIN_USERNAMES="admin1,admin2"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_WS_URL="ws://localhost:4001"
```
4. **Setup database**

```
npx prisma migrate dev
npx prisma generate
```
### 🚀 Run
 **Development**
```
redis-server   # start Redis
npm run ws     # start WebSocket server
npm run dev    # start Next.js app
```
**Production**
```
npm run build
npm run ws     # WebSocket server
npm start      # Next.js app
```
### 🎮 Gameplay

1. Login via Telegram
2. Betting phase (6 seconds)
3. Flight phase (3–6 seconds)
4. Cashout before crash
5. Crash → unclaimed bets are lost

### 📊 Database Models
```
User – players, balances, settings

Game – history, bets, results

GameSession – active sessions

Transaction – deposits, withdrawals, bets

ChatMessage – chat history
```

Migrations:

```
npx prisma migrate dev --name add_new_feature
npx prisma migrate deploy
```
### 🔧 Admin Panel
Accessible via separate bot for users in ADMIN_USER_IDS.

Features:

**User & balance management**
**Game & transaction history**
**Withdraw approvals**
**System stats**

### 🎯 API Endpoints
Game API:
```
POST /api/game/start – Start a game

POST /api/game/cashout – Cash out

GET /api/profile/games – User’s game history
```
Admin API:
```
GET /api/admin/users – List users

GET /api/admin/games – All games history

POST /api/admin/withdraw-action – Manage withdrawals
```
WebSocket Events:

auth, bet, cashout

game-start, game-flying, game-crash

### 🔒 Security
Telegram initData validation

Server-side balance checks

Atomic DB transactions

Account blocking

Full logging

### 📈 Monitoring
Logs:

WebSocket connections

Game events

DB errors

Transactions

Metrics:

Active players

Bets volume

Win/loss stats

#### 🐛 Debugging
WebSocket test:

```
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
-H "Host: localhost:4001" -H "Origin: http://localhost:4001" \
http://localhost:4001
```
Database:
```
npx prisma studio
npx prisma validate
```

## 📝 Roadmap / TODO

- [ ] 🎮 **Demo mode** — allow new users to try the game without real funds  
- [ ] 🔔 **Telegram notifications** — instant updates and alerts  
- [ ] ✨ **Win animations** — improve user experience with visual effects  
- [ ] 🏆 **Tournaments & leaderboards** — competitive gameplay  
- [ ] 📱 **Mobile optimization** — seamless play on smartphones  
- [ ] 📊 **Analytics & dashboards** — detailed metrics and insights  

---

## 🤝 Contributing

We welcome contributions from the community!  

1. 🍴 **Fork** this repository  
2. 🌿 Create a **feature branch**  
3. 💾 **Commit** your changes  
4. 🔀 Open a **Pull Request**  

