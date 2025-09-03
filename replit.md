# Overview

Tasks Ahead is a cross-platform task management and habit-building application designed to be accessible and delightful for users aged 5-65+. The project is built as a full-stack web application using React for the frontend, Express.js for the backend, with plans for comprehensive accessibility features, offline-first capabilities, voice support, and gamification through streaks and achievements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18 with TypeScript**: Modern functional components with hooks for state management
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with caching and optimistic updates
- **Form Handling**: React Hook Form with Zod schema validation for type-safe forms
- **Theme System**: Custom theme provider supporting light/dark modes with CSS custom properties

## Backend Architecture
- **Node.js with Express**: RESTful API server with middleware for request logging and error handling
- **Development Setup**: Vite for development with HMR, esbuild for production builds
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development, designed to support database backends
- **File Structure**: Monorepo structure with shared types between client and server via shared directory

## Data Management
- **Database Schema**: PostgreSQL schema defined with Drizzle ORM for type-safe database operations
- **Tables**: Users, tasks, projects, and streaks with proper relationships and constraints
- **Priority System**: Three-tier priority system (low, medium, high) with color coding
- **Gamification**: Streak tracking with achievement badges (Trailblazer, Consistent, Warrior, etc.)

## UI/UX Design Patterns
- **Accessibility First**: WCAG 2.1 AA compliance planning with proper ARIA labels and semantic HTML
- **Responsive Design**: Mobile-first approach with adaptive layouts for different screen sizes
- **Simple Mode**: Planned accessibility mode with larger touch targets and simplified interface
- **Component System**: Radix UI primitives with custom styling via class-variance-authority

## Offline Support Strategy
- **Local Storage**: Browser localStorage for settings and offline task storage
- **Sync Strategy**: Designed for future implementation of conflict resolution and two-way sync
- **Progressive Enhancement**: Core functionality works offline with online sync when available

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js with TypeScript support via tsx
- **Database & ORM**: Drizzle ORM with PostgreSQL dialect, Neon Database serverless driver
- **Build Tools**: Vite, esbuild, TypeScript compiler

## UI/UX Libraries
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: TailwindCSS, class-variance-authority for component variants
- **Icons**: Heroicons React, Lucide React
- **Utilities**: clsx, tailwind-merge for conditional styling

## Development & Deployment
- **Platform Integration**: Replit-specific plugins for development environment
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Date Handling**: date-fns for date manipulation and formatting
- **Validation**: Zod for runtime type checking and schema validation

## Planned External Integrations
- **Speech Recognition**: Browser Web Speech API for voice input
- **Text-to-Speech**: Browser Web Speech API for accessibility
- **Push Notifications**: Web Push API for task reminders
- **Media Handling**: Browser APIs for camera, microphone, and file uploads
- **Social Sharing**: Web Share API for achievement sharing