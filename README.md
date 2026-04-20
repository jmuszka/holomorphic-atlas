# Holomorphic Atlas

Holomorphic Atlas is an interactive fractal explorer built with **React**, **TypeScript**, and **OpenGL** (WebGL). It provides a real-time visualization of complex dynamics, specifically the **Mandelbrot set** and its corresponding **Julia sets**.

## Features

- **High-Performance Rendering**: Utilizes custom GLSL fragment shaders for smooth, real-time fractal generation.
- **Interactive Exploration**:
  - **Mandelbrot & Julia Integration**: Toggle between the Mandelbrot set and Julia sets.
  - **Dynamic Mode**: Watch the Julia set evolve as you move your mouse across the Mandelbrot set.
  - **Navigation**: Intuitive zoom (scroll) and pan (drag) controls to explore the recursive fractal pattern.
- **State Persistence**: Current view parameters (position, zoom, point) are saved in the URL, making it easy to share specific fractal configurations.
- **Modern UI**: Includes a draggable control panel for real-time adjustments and state monitoring.

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

## Technical Details

- **Frontend**: React 19 + Vite
- **Shaders**: WebGL 1.0 (GLSL)
- **Styling**: Tailwind CSS
- **State Management**: Custom URL-based state sync
