# Agent Instructions

## Commands
- `npm start` - Start development server (http://localhost:3000)
- `npm test` - Run tests in watch mode
- `npm test -- --testNamePattern="pattern"` - Run specific test by pattern
- `npm run build` - Build for production
- No lint command available (uses react-scripts ESLint integration)

## Architecture
- Standard Create React App structure
- Entry point: `src/index.js`
- Main component: `src/App.js`
- Static assets: `public/`
- No backend/API layer
- Uses Jest + React Testing Library for testing

## Code Style
- Use functional components over class components
- Import React Testing Library: `import { render, screen } from '@testing-library/react'`
- CSS modules via `.css` imports
- Use JSX with camelCase attributes
- Export default for components
- Test files: `*.test.js` pattern
- Use `screen.getByText()` for testing queries
