# WRENCH'D Workshop Manager

## Overview

This is a comprehensive mobile mechanic workshop management system built with React, TypeScript, Express, and Drizzle ORM. The application provides end-to-end functionality for managing customers, vehicles, jobs, inventory, suppliers, and business operations for a mobile automotive service business.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Complete PDF Template Customization System (July 2025)
- Built comprehensive PDF template editor with live preview functionality
- Implemented logo upload with drag-and-drop interface and positioning options (left, center, right)
- Added full customization controls for typography, colors, and layout settings
- Created 4 header layout options: Standard, Centered, Split, and Compact
- Fixed PDF generation to apply template settings across ALL document types
- Template settings now control purchase orders, returns, quotes, and receipts
- Added custom footer text functionality for professional branding
- Enhanced PDF generator with proper template fetching and application logic

### Purchase Order & Return System (July 2025)
- Added complete purchase order and return functionality for supplier management
- Implemented automatic inventory stock updates when orders/returns are approved
- Created professional PDF generation with customizable template system
- Added API endpoints for purchase order and return CRUD operations
- Integrated jsPDF library with advanced template customization capabilities
- Enhanced supplier management interface with tabbed navigation for orders and returns
- Unified PDF generation system ensuring consistent branding across all document types

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with consistent error handling
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot module replacement via Vite integration

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: Shared schema in `/shared/schema.ts`
- **Migrations**: Managed via Drizzle Kit with migrations stored in `/migrations`
- **Connection**: Neon serverless driver for PostgreSQL connectivity

## Key Components

### Database Schema
The application uses a comprehensive relational schema including:
- **Customers**: Core customer information with contact details
- **Vehicles**: Vehicle details linked to customers with make, model, year, VIN, etc.
- **Suppliers**: Parts and service suppliers with contact information
- **Inventory**: Parts management with stock tracking, pricing, and supplier relationships
- **Jobs**: Service jobs with status tracking, labor hours, parts, and pricing
- **Job Parts**: Many-to-many relationship between jobs and inventory items
- **Quotes**: Estimate system with detailed parts and labor breakdown
- **Quote Parts**: Many-to-many relationship between quotes and inventory items
- **Receipts**: Transaction records for completed work
- **Business Settings**: Configurable business information and preferences

### API Endpoints
The backend provides RESTful endpoints for:
- Customer CRUD operations (`/api/customers`)
- Vehicle management (`/api/vehicles`) 
- Supplier management (`/api/suppliers`)
- Inventory tracking (`/api/inventory`)
- Job management (`/api/jobs`)
- Quote system (`/api/quotes`)
- Receipt generation (`/api/receipts`)
- Business settings (`/api/settings`)
- Dashboard statistics (`/api/dashboard/stats`)

### Frontend Pages
- **Dashboard**: Business overview with key metrics and statistics
- **Jobs**: Job management with scheduling, status tracking, and completion
- **Calendar**: Appointment scheduling (placeholder for future implementation)
- **Customers**: Customer database with contact management
- **Vehicles**: Vehicle registry linked to customers
- **Inventory**: Parts management with stock tracking and low-stock alerts
- **Suppliers**: Vendor management for parts sourcing
- **Receipts**: Transaction history and receipt generation
- **Reports**: Business analytics and performance metrics
- **Backup**: Data export and backup functionality
- **Settings**: Business configuration and preferences

### UI Components
- **Layout**: Sidebar navigation with header
- **Forms**: Comprehensive forms for all data entities with validation
- **Tables**: Data grids with search, filtering, and sorting
- **Modals**: Dialog-based forms for creating and editing records
- **Stats Cards**: Dashboard metrics display
- **Empty States**: User-friendly placeholders for empty data sets

## Data Flow

### Client-Server Communication
1. **API Requests**: Frontend uses custom `apiRequest` function for HTTP communication
2. **State Management**: TanStack Query handles caching, synchronization, and optimistic updates
3. **Error Handling**: Centralized error handling with user-friendly toast notifications
4. **Form Submission**: React Hook Form + Zod validation before API calls
5. **Real-time Updates**: Query invalidation ensures data consistency across components

### Authentication & Sessions
- Currently configured for session-based authentication (infrastructure present)
- Uses PostgreSQL session storage with `connect-pg-simple`
- Ready for implementation of user authentication system

### Data Validation
- **Shared Types**: TypeScript interfaces shared between frontend and backend
- **Runtime Validation**: Zod schemas for API request/response validation
- **Form Validation**: Client-side validation with server-side verification
- **Database Constraints**: Schema-level validation via Drizzle ORM

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **UI Libraries**: Radix UI primitives, Lucide React icons, Class Variance Authority
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Validation**: Zod with Drizzle Zod integration
- **Utilities**: date-fns, clsx, cmdk

### Backend Dependencies
- **Server**: Express.js with TypeScript support via tsx
- **Database**: Drizzle ORM, Neon serverless driver, PostgreSQL session store
- **Development**: Vite for development server integration
- **Build**: esbuild for production builds

### Development Tools
- **TypeScript**: Strict configuration with path mapping
- **Vite**: Development server with HMR and runtime error overlay
- **Replit Integration**: Cartographer plugin and development banner
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with Express integration
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment Variables**: `DATABASE_URL` required for database connectivity
- **Asset Handling**: Vite handles static assets and bundling

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles Express server to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema updates via `db:push`
- **Static Files**: Express serves built frontend from production build

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Replit**: Special handling for Replit development environment
- **Build Process**: Separate build steps for frontend and backend with external package bundling

The application is designed as a monorepo with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between frontend and backend concerns.