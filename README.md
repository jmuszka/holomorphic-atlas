# Holomorphic Atlas

Holomorphic Atlas is an interactive fractal explorer built with **React**, **TypeScript**, and **OpenGL** (WebGL). It provides a real-time visualization of complex dynamics, specifically the **Mandelbrot set** and its corresponding **Julia sets**.

<img width="2880" height="1620" alt="Screenshot From 2026-06-21 00-55-04" src="https://github.com/user-attachments/assets/7dc491b3-ba1a-456f-b86a-9bf001ccd87c" />

## Features

- **High-Performance Rendering**: Utilizes custom GLSL fragment shaders for smooth, real-time fractal generation.
- **Interactive Exploration**:
  - **Mandelbrot & Julia Integration**: Toggle between the Mandelbrot set and Julia sets.
  - **Dynamic Mode**: Watch the Julia set evolve as you move your mouse across the Mandelbrot set.
  - **Navigation**: Intuitive zoom (scroll) and pan (drag) controls to explore the recursive fractal pattern.
- **State Persistence**: Current view parameters (position, zoom, point) are saved in the URL, making it easy to share specific fractal configurations.
- **Modern UI**: Includes a draggable control panel for real-time adjustments and state monitoring.
- 
<img width="2880" height="1620" alt="Screenshot From 2026-06-21 00-55-34" src="https://github.com/user-attachments/assets/6f120d58-3532-49a9-82ec-37458d5305aa" />

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

### Running the Project

To start the development server:

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code quality.
- `npm run format`: Format the codebase using Prettier.
- `npm run preview`: Preview the production build locally.

<img width="2880" height="1620" alt="Screenshot From 2026-06-21 00-56-15" src="https://github.com/user-attachments/assets/50cf82a3-c229-4bf4-a07f-fc258518ea3a" />

## Technical Details

- **Frontend**: React 19 + Vite
- **Shaders**: WebGL 1.0 (GLSL)
- **Styling**: Tailwind CSS
- **State Management**: Custom URL-based state sync
