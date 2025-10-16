# Next Hive - Beekeeping Management System

A modern beekeeping management application built with [Next.js](https://nextjs.org), featuring hive tracking, inspection records, harvest management, and financial tracking.

## Features

- 🐝 **Hive Management** - Track multiple hives with detailed information
- 📋 **Inspection Records** - Log and monitor hive inspections
- 🌾 **Harvest Tracking** - Record and analyze honey harvests
- 💰 **Financial Management** - Track expenses, income, and invoices
- 📦 **Inventory System** - Manage beekeeping supplies
- 🗺️ **Interactive Maps** - Visualize hive and swarm trap locations
- 🔐 **User Authentication** - Secure authentication with Clerk
- 📊 **Analytics Dashboard** - Comprehensive data visualization

## Tech Stack

- **Framework**: Next.js 15.5.2
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Email**: Resend
- **PDF Generation**: @react-pdf/renderer

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database
- Clerk account for authentication
- Resend account for email (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-hive-shadcn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `SIGNING_SECRET` - Clerk webhook signing secret
- `RESEND_API_KEY` - From Resend (for invoice emails)
- `NEXT_PUBLIC_OPENWEATHER_KEY` - Optional, for weather features

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database:
```bash
npm run prisma:seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:seed` - Seed the database

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── hives/            # Hive management
│   ├── inspection/       # Inspection records
│   ├── harvest/          # Harvest tracking
│   ├── finance/          # Financial management
│   ├── inventory/        # Inventory system
│   └── swarm/            # Swarm trap tracking
├── components/            # React components
├── lib/                   # Utility functions and schemas
│   ├── schemas/          # Zod validation schemas
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
