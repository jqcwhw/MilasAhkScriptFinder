# AHK Script Finder

## Overview

AHK Script Finder is a web application that helps users discover, manage, and generate AutoHotkey (AHK) scripts. The platform enables users to search GitHub for AHK scripts (both v1 and v2), browse curated collections, maintain a personal script library, and generate custom scripts using AI assistance. Built as a full-stack TypeScript application with a React frontend and Express backend, it provides a modern, developer-friendly interface for the AutoHotkey community.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (single-page application)

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design approach follows Material Design and GitHub-inspired patterns for developer-focused aesthetics
- Custom theming system supporting light/dark modes with HSL color variables
- Component library includes cards, dialogs, buttons, forms, and specialized components (AIGenerator, CodeViewer, SearchBar, ScriptCard, SearchResultCard)

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- Local component state with React hooks for UI interactions
- Custom hooks (`use-toast`, `use-mobile`) for reusable functionality

**Key Features**
- GitHub script search with syntax preview and metadata display
- Personal script library with CRUD operations
- AI-powered script generation interface
- Code syntax highlighting and copy functionality
- Responsive design with mobile-first approach
- **Pet Simulator 99 Tools** (Real-time Big Games API integration)
  - Live clan tracker with top 20 leaderboard
  - Individual clan lookup and statistics
  - Active clan battle monitoring
  - RAP (Recent Average Price) checker for pets and items
  - Real-time data updates every 30-60 seconds
- **Pre-loaded Scripts**
  - Fisch Macro V11.2 for Roblox fishing automation
  - PS99 Enhanced Clan Tracker for Pet Simulator 99
  - InkGame AutoRoll for Ink Game power rolling

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API routes and middleware
- HTTP server created via Node's native `http` module
- Custom logging middleware for API request/response tracking
- JSON body parsing with raw body preservation for webhooks

**API Design**
- RESTful endpoints under `/api` namespace
- GitHub API integration for code search functionality
- In-memory storage implementation (MemStorage) with interface-based design (IStorage) for future database swapping
- Zod schemas for request validation and type safety

**Development Experience**
- Vite middleware integration in development mode for seamless HMR
- Custom error overlay plugin (@replit/vite-plugin-runtime-error-modal)
- Separate development and production build processes

### Data Storage Solutions

**Current Implementation**
- In-memory storage (MemStorage class) for users and personal scripts
- UUID-based identifiers using Node's crypto module
- Map-based data structures for fast lookups

**Database Schema (Drizzle ORM)**
- PostgreSQL schema defined with Drizzle ORM (prepared for future migration)
- Users table with id, username, password fields
- Configuration for Neon Database serverless PostgreSQL
- Migration system configured via drizzle-kit

**Data Models**
- User: id, username, password
- PersonalScript: id, name, description, content, tags, version
- GitHubSearchResult: repository metadata, code preview, download URL, language version
- Zod schemas provide runtime validation and TypeScript types

### External Dependencies

**Third-Party APIs**
- GitHub Code Search API (api.github.com/search/code)
  - Used for discovering AHK scripts across public repositories
  - Requires User-Agent header
  - Filters by .ahk file extension
  - Returns code preview, repository metadata, and download URLs
  - Rate limiting considerations (unauthenticated requests)
- Big Games PS99 Public API (https://ps99.biggamesapi.io/api)
  - Real-time Pet Simulator 99 game data
  - Clan rankings, battle information, and member data
  - RAP (Recent Average Price) for pets and items  
  - Collections data (pets, eggs, items, etc.)
  - No API key required - public access
  - Endpoints: /clans, /clan/:name, /activeClanBattle, /rap, /exists, /collections

**Database Services**
- Neon Database (PostgreSQL serverless) - configured but not yet connected
  - Connection via @neondatabase/serverless package
  - Environment variable: DATABASE_URL
  - Connection pooling support with connect-pg-simple for sessions

**UI Component Libraries**
- Radix UI primitives for accessible components (accordion, dialog, dropdown, tooltip, etc.)
- Embla Carousel for image/content carousels
- cmdk for command palette functionality
- lucide-react for icon system
- react-day-picker for date selection
- vaul for drawer components

**Fonts**
- Google Fonts: Inter (UI text), Fira Code (monospace/code)

**Development Tools**
- Replit-specific plugins: cartographer, dev-banner, runtime error modal
- TypeScript for type checking
- ESBuild for production server bundling

**Key Implementation Notes**
- The application currently uses in-memory storage but has Drizzle ORM schemas prepared for PostgreSQL migration
- GitHub API integration is unauthenticated; production deployment should consider API tokens for higher rate limits
- The design system emphasizes code-friendly aesthetics with monospace fonts, clear hierarchy, and GitHub-inspired patterns
- Vite configuration includes custom aliases (@, @shared, @assets) for clean import paths