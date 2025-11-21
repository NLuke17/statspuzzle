# Sliding Puzzle Experiment - Frontend

Next.js React application for the sliding puzzle experiment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- User authentication (signup/login)
- Random assignment to timer/no-timer condition
- 4x4 sliding puzzle game
- Automatic result submission
- Prevention of duplicate attempts

## Pages

- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/experiment` - Puzzle game and experiment

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── globals.css      # Global styles
│   ├── login/
│   │   └── page.tsx     # Login page
│   ├── signup/
│   │   └── page.tsx     # Signup page
│   └── experiment/
│       └── page.tsx     # Experiment page
├── components/
│   └── SlidingPuzzle.tsx # Puzzle component
├── package.json
├── tsconfig.json
└── next.config.js
```


