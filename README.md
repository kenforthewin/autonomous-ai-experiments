# React Modern App

A modern React web application built with TypeScript, Vite, and the latest best practices for 2025.

## 🚀 Features

- ⚡ **Fast Development**: Built with Vite for lightning-fast HMR and builds
- 🔒 **Type Safe**: Full TypeScript support with strict configuration
- 🧪 **Well Tested**: Comprehensive unit testing with Vitest and React Testing Library
- 🎨 **Modern Code**: ESLint and Prettier for consistent, clean code
- 📁 **Organized Structure**: Following modern project organization conventions
- 🔧 **Environment Variables**: Proper environment variable handling
- 📱 **Responsive Design**: Mobile-first responsive layouts

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5.7
- **Build Tool**: Vite 6
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **CSS**: CSS Modules with modern features

## 📁 Project Structure

```
project-root/
├── src/                    # Source code
│   ├── components/         # Reusable React components
│   ├── services/          # API and business logic services
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Application entry point
│   └── vite-env.d.ts      # Vite environment types
├── tests/                  # Test files
│   ├── components/        # Component tests
│   ├── services/          # Service tests
│   ├── utils/             # Utility tests
│   └── setup.ts           # Test setup and configuration
├── docs/                   # Documentation
├── config/                 # Configuration files
├── scripts/               # Build and deployment scripts
├── .env.example           # Environment variables example
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── .prettierrc            # Prettier configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-modern-app
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🧪 Testing

The project uses Vitest for unit testing with React Testing Library for component testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

Tests are located in the `tests/` directory and mirror the `src/` structure:

- Component tests: `tests/components/`
- Service tests: `tests/services/`
- Utility tests: `tests/utils/`

## 🔧 Environment Variables

Environment variables should be defined in `.env.local`:

```env
VITE_APP_TITLE=React Modern App
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3001/api
```

Note: Environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## 📝 Code Style

This project follows strict code quality standards:

- **ESLint**: Enforces code quality and consistency
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Provides type safety and better development experience

### Pre-commit Hooks

Consider adding Husky for pre-commit hooks to automatically run linting and tests before commits.

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Environment-Specific Builds

The application supports different environments through environment variables:

- Development: `.env.local`
- Production: Build-time environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale
- [Vitest](https://vitest.dev/) - Next generation testing framework
