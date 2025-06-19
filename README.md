# Chat App with Video Calling

A full-stack real-time chat application with video calling functionality built with React, Node.js, and Stream.

## Features

- 🔐 User authentication (signup/login)
- 💬 Real-time messaging
- 🎥 Video calling with WebRTC
- 👥 Friend system
- 📱 Responsive design
- 🔔 Real-time notifications

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS + DaisyUI
- Stream Chat React SDK
- Stream Video React SDK
- React Query
- React Router

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Stream Chat & Video APIs
- JWT Authentication
- bcryptjs

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database
- Stream account (free tier available)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd chat-app
```

2. Install dependencies
```bash
npm run install
```

3. Set up environment variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_STREAM_API_KEY=your_stream_api_key
```

4. Start development servers
```bash
npm run dev
```


## Environment Variables

See `.env.example` files in both frontend and backend directories for required environment variables.

## License

MIT License
