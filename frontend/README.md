# RAG Personal Notes - Frontend

A modern React + TypeScript + Vite frontend for the RAG (Retrieval-Augmented Generation) Personal Notes application.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Axios** - HTTP client
- **React Dropzone** - File upload component
- **Lucide React** - Beautiful icon library

## Features

- 📤 **Document Upload** - Drag-and-drop interface for uploading documents (PDF, DOCX, TXT, MD)
- 📋 **Document Management** - View, manage, and delete uploaded documents
- 🔍 **Intelligent Querying** - Ask natural language questions about your documents
- 💾 **Responsive Design** - Mobile-friendly UI using Tailwind CSS
- 🎨 **Modern UI Components** - Beautiful, accessible components from shadcn/ui

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── DocumentUpload.tsx     # Document upload with drag-drop
│   │   ├── DocumentList.tsx       # Uploaded documents list
│   │   ├── QueryInterface.tsx     # Query input and results
│   │   └── Layout.tsx             # App layout wrapper
│   ├── lib/
│   │   ├── api.ts                 # API client (axios)
│   │   └── utils.ts               # Utility functions
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── hooks/
│   │   └── use-toast.ts           # Toast notification hook
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles with Tailwind
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm 7+

### Installation Steps

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The development server runs on `http://localhost:5173` by default.

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

- `VITE_API_URL` - Backend API base URL (default: http://localhost:8000)

## Available Scripts

- `npm run dev` - Start Vite dev server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Component Documentation

### DocumentUpload
Handles file uploads with drag-and-drop support.
- Accepts: PDF, DOCX, TXT, MD files
- Max file size: 10MB
- Shows upload progress and validation errors
- Callback on successful upload

### DocumentList
Displays uploaded documents with metadata.
- Shows filename, file size, upload date, chunk count
- Delete functionality with confirmation
- Scrollable list for many documents
- Formatted file sizes and dates

### QueryInterface
Main query interface for asking questions.
- Textarea for natural language queries
- Example queries for guidance
- Loading states and error handling
- Displays generated answers with source citations

### Layout
Main layout component with header and footer.
- Responsive design for mobile and desktop
- Header with app title
- Main content area with proper spacing
- Footer with copyright information

## API Integration

The frontend communicates with the backend API at `http://localhost:8000`.

### Key Endpoints Used

- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List all documents
- `DELETE /api/documents/{id}` - Delete a document
- `POST /api/query` - Submit a query and get results

## Styling & Theming

- Uses Tailwind CSS for all styling
- Supports light and dark modes via CSS variables
- Slate color scheme from shadcn/ui
- Responsive design with mobile-first approach
- Custom radius variable (0.5rem) for consistent rounded corners

## Development Tips

1. **Hot Module Reloading (HMR)** - Changes to React components are instantly reflected
2. **Type Safety** - TypeScript strict mode is enabled for better code quality
3. **Path Alias** - Use `@/` prefix to import from src directory
4. **Component Imports** - All shadcn components are tree-shakeable

## Building for Production

```bash
npm run build
```

This creates an optimized production bundle in the `dist/` directory.

- JavaScript is minified and bundled
- CSS is extracted and optimized
- Assets are hashed for cache busting

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

### API Connection Issues
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_URL` environment variable
- Check browser console for CORS errors

## License

Part of the RAG Personal Notes application.

