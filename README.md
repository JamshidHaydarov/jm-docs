# 📄 Realtime Docs (NestJS + WebSocket)

Real-time collaborative document system (Google Docs-like) built with WebSocket.

---

## 🚀 Features

- 🔐 JWT Authentication
- 📄 File management
- 👥 Real-time collaboration via WebSocket
- 🏠 Rooms (per file)
- 🔒 Access control (owner / shared users)
- 💾 Redis caching

---

## 🛠️ Tech Stack

- Backend: NestJS
- Database: PostgreSQL
- ORM: TypeORM
- Realtime: Socket.IO
- Redis

---

## 📦 Installation

```bash
yarn install
```

## ▶️ Run
```bash
yarn start
```
Development
```bash
yarn start:dev
```
## ⚙️ Environment Variables
Create .env file in root:
```bash
SECRET_KEY=your_secret_key
```

## 📡 WebSocket Events
- join_file

  Join file room

  Payload:
```bash
{
  "fileId": 1
}
```
- leave_file

  Leave file room

  Payload:
```bash
{
  "fileId": 1
}
```

- file_update

  Update file content

  Payload:
```bash
{
  "fileId": 1,
  "context": "new text"
}
```

## 📤 Emitted Events
- joined_file
```bash
{
  "ok": true,
  "room": "file:1",
  "fileId": 1
}
```
- room_users_count
```bash
{
  "fileId": 1,
  "count": 2
}
```
- left_file
```bash
{
  "ok": true,
  "room": "file:1",
  "fileId": 1
}
```
- file_updated
```bash
{
  "fileId": 1,
  "context": "updated content",
  "updatedBy": 2
}
```

## 🧠 Architecture
```bash
Gateway → Service → Database
```
- Gateway handles WebSocket events
- Service contains business logic
- Database layer handles queries (TypeORM)

## 👨‍💻 Author
Jamshid Khaydarov

- Telegram: https://t.me/JamshidKhaydarov
- GitHub: https://github.com/JamshidHaydarov
- Email: usmanalievicjamshid15@gmail.com