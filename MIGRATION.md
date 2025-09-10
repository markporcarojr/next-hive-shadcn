# Migration Documentation

This document outlines the models and authentication logic migrated from the `next-hive-tool` repository.

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

- The migrated code maintains compatibility with the existing ShadCN/UI components
- Authentication middleware protects all routes by default
- All TypeScript types are properly defined and exported
- The database models support the complete hive management workflow
- PDF generation is temporarily disabled due to build environment constraints

## Next Steps

1. Create authentication pages (sign-in, sign-up)
2. Build UI components for data management
3. Implement API routes for CRUD operations
4. Add map components for hive location tracking
5. Restore PDF generation functionality when build environment permits