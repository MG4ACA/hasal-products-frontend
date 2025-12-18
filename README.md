# Hasal POS Frontend

Frontend application for Hasal Products POS & Inventory Management System

## Tech Stack

- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **UI Framework:** PrimeVue + PrimeFlex
- **HTTP Client:** Axios

## Project Structure

```
src/
├── components/        # Vue components
│   └── layout/        # Layout components (AppLayout, Sidebar, Topbar)
├── views/             # Page views
│   ├── auth/          # Authentication views
│   └── dashboard/     # Dashboard views
├── stores/            # Pinia stores
├── services/          # API services
├── router/            # Vue Router configuration
├── utils/             # Utility functions
├── composables/       # Composable functions
├── assets/            # Static assets
├── App.vue            # Root component
└── main.js            # Entry point
```

## Getting Started

### Prerequisites

- Node.js v20.19.1
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.development .env
```

3. Update `.env` file with your API base URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Dev Server

```bash
npm run dev
```

Server will start on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Development

### Code Style

ESLint and Prettier for consistent code style.

Lint and fix:
```bash
npm run lint
```

## Features

- Authentication with JWT tokens (stored in sessionStorage, 24-hour expiry)
- Role-based access control
- Responsive design with PrimeVue components
- Dark/Light theme support
- Toast notifications
- API service with Axios interceptors

## Color Scheme

- Primary: #627d98 (Blue-Gray)
- Secondary: #E67E22 (Orange)
- Success: #27AE60
- Warning: #F39C12
- Danger: #E74C3C

## License

ISC
