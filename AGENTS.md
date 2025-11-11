# Project Documentation

## Overview
This is a modern React web application built with TypeScript and Vite, following 2025 best practices. The project includes a comprehensive development setup with testing, linting, and proper project structure.

## Technology Stack
- **Frontend**: React 18 with TypeScript 5.7
- **Build Tool**: Vite 6 for fast development and building
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint with TypeScript support, Prettier for formatting
- **Package Manager**: npm

## Project Structure
```
├── src/                   # Source code
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── styles/           # CSS and styling files
├── tests/                # Test files mirroring src structure
├── docs/                 # Project documentation
├── config/               # Configuration files
└── dist/                 # Build output directory
```

## Development Setup

### Prerequisites
- Node.js (latest LTS version)
- npm

### Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm test`
4. Build for production: `npm run build`
5. Preview production build: `npm run preview`

## Common Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build application for production
- `npm run preview` - Preview production build locally
- `npm test` - Run test suite in watch mode
- `npm run test:once` - Run tests once
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Agent Guidelines
- **Technical Lead**: Responsible for architecture, technology selection, and technical planning
- **FullStackDeveloper**: Responsible for implementation of components and features

## Development Guidelines
- All new components should include TypeScript props/interfaces
- Write tests for new components and utilities
- Follow ESLint rules and Prettier formatting
- Use path aliases for clean imports (`@/components`, `@/utils`, etc.)
- Environment variables should be defined in `.env.local` and documented in `.env.example`

## Testing
- Unit tests are located in `tests/` directory
- Use Vitest for unit testing with React Testing Library
- Aim for high test coverage on utilities and services
- Component tests should focus on user interactions and rendering
