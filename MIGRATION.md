# Migration Documentation

This document outlines the completed migration from the `next-hive-tool` repository, which used Mantine UI components, to this `next-hive-shadcn` repository using Shadcn UI components.

## Migration Status: ✅ COMPLETED

The project has been successfully migrated from Mantine to Shadcn UI. All Mantine dependencies have been removed and replaced with Shadcn UI equivalents.

## UI Library Migration

### Removed (Mantine Dependencies)
- `@mantine/core` - Core Mantine components
- `@mantine/dates` - Date picker components  
- `@mantine/form` - Form components
- `@mantine/hooks` - React hooks
- `@mantine/notifications` - Notification system
- `mantine-form-zod-resolver` - Form validation

### Added (Shadcn UI Dependencies)
- `@radix-ui/react-*` - Primitive components (avatar, checkbox, dialog, dropdown-menu, etc.)
- `lucide-react` - Icon library
- `class-variance-authority` - Component variant utilities
- `clsx` & `tailwind-merge` - Conditional styling utilities
- `sonner` - Toast notifications
- `vaul` - Drawer component
- `@tanstack/react-table` - Advanced data table functionality
- `@dnd-kit/*` - Drag and drop functionality

## Migrated Components

### 1. Database Models (Prisma Schema)
**Location:** `prisma/schema.prisma`

The complete database schema including:
- **User** - User management with Clerk authentication integration
- **Hive** - Beehive records with location tracking
- **Inspection** - Hive inspection records
- **Expense** - Financial expense tracking
- **Income** - Revenue tracking
- **Harvest** - Honey/product harvest records
- **Inventory** - Equipment and supply inventory
- **Invoice** - Customer invoice management
- **InvoiceItem** - Individual invoice line items
- **Settings** - User preferences
- **SwarmTrap** - Swarm trap monitoring

**Location:** `prisma/seed.ts`
- Database seed file with sample data for development

### 2. Authentication System
**Location:** `middleware.ts`
- Clerk-based authentication middleware
- Route protection for authenticated areas
- Public route configuration

**Location:** `lib/auth/checkUser.ts`
- User verification and creation logic
- Clerk user integration with local database

**Location:** `lib/prisma.ts`
- Prisma client configuration
- Database connection management

### 3. Validation Schemas (Zod)
**Location:** `lib/schemas/`

Type-safe validation schemas for all models:
- `expense.ts` - Expense data validation
- `harvest.ts` - Harvest record validation
- `hive.ts` - Hive data validation with GPS coordinates
- `income.ts` - Income record validation
- `inspection.ts` - Inspection data validation
- `inventory.ts` - Inventory item validation
- `invoice.ts` - Invoice and invoice item validation
- `settings.ts` - User settings validation
- `swarmTrap.ts` - Swarm trap data validation

### 4. Utility Functions
**Location:** `lib/`

- `fetchData.ts` - Generic API data fetching utility
- `formatDate.ts` - Date formatting helper
- `GenerateInvoicePDF.ts` - PDF generation (currently disabled due to puppeteer dependency)
- `sendInvoiceEmail.tsx` - Email functionality with invoice attachments

## Dependencies Added

### Core Authentication & Database
- `@clerk/nextjs` - Authentication provider
- `@clerk/dev-cli` - Development tools
- `@prisma/client` - Database ORM client
- `prisma` - Database toolkit

### Utilities
- `dayjs` - Date manipulation
- `react-hook-form` - Form handling
- `resend` - Email service
- `svix` - Webhook handling
- `@react-pdf/renderer` - PDF generation
- `html2pdf.js` - Alternative PDF generation
- `leaflet` & `react-leaflet` - Map functionality

### Type Definitions
- `@types/leaflet` - TypeScript definitions for maps
- `@clerk/clerk-sdk-node` - Server-side Clerk types
- `tsx` - TypeScript execution

## Environment Variables Required

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hive_tool_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Email (Resend)
RESEND_API_KEY=re_...
```

## Setup Instructions

1. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: Add sample data
   ```

2. **Authentication Setup:**
   - Create a Clerk account at https://clerk.com
   - Configure your Clerk keys in environment variables
   - Set up sign-in/sign-up pages if needed

3. **Email Setup (Optional):**
   - Create a Resend account at https://resend.com
   - Add your API key to environment variables

## Integration Notes

- ✅ **UI Migration Complete:** All Mantine components have been successfully replaced with Shadcn UI equivalents
- ✅ **Component Library:** Uses Shadcn UI built on top of Radix UI primitives with Tailwind CSS styling
- ✅ **Interactive Features:** Includes advanced data tables with drag-and-drop, sorting, filtering, and pagination
- ✅ **Theme System:** Supports light/dark mode switching and customizable color themes
- ✅ **Authentication:** Middleware protects all routes by default using Clerk
- ✅ **Type Safety:** All TypeScript types are properly defined and exported
- ✅ **Database:** Models support the complete hive management workflow
- ⚠️ **PDF Generation:** Temporarily disabled due to build environment constraints

## Next Steps

1. ✅ ~~Create authentication pages (sign-in, sign-up)~~ - Clerk authentication is configured
2. ✅ ~~Build UI components for data management~~ - Shadcn UI components implemented with data tables
3. Implement API routes for CRUD operations
4. Add map components for hive location tracking  
5. Restore PDF generation functionality when build environment permits
6. Add hive-specific dashboard pages and forms
7. Integrate with real hive management data