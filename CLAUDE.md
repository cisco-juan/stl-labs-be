# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **STL Lab Backend** - a NestJS-based API for managing a medical/dental laboratory system. The application handles patients, appointments, treatments, invoicing, and inventory management using PostgreSQL with Prisma ORM.

## Development Commands

### Setup
```bash
npm install
```

### Running the Application
```bash
npm run start          # Production mode
npm run start:dev      # Development mode with watch
npm run start:debug    # Debug mode with watch
```

### Building
```bash
npm run build          # Compiles TypeScript to dist/
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
npm run test:debug     # Run tests in debug mode
```

### Code Quality
```bash
npm run lint           # ESLint with auto-fix
npm run format         # Prettier format all TypeScript files
```

### Database (Prisma)
```bash
npx prisma generate    # Generate Prisma Client
npx prisma migrate dev # Create and apply migrations
npx prisma studio      # Open Prisma Studio (database GUI)
npx prisma db push     # Push schema changes without migrations
npx prisma db seed     # Seed the database (if configured)
```

## Architecture

### Database Schema Design

The Prisma schema (prisma/schema.prisma) defines a comprehensive medical lab system with the following core domains:

**User Management:**
- `User` - Staff members (doctors, nurses, receptionists, lab technicians, pharmacists, admins)
- `Specialization` - Medical specializations for users
- User roles: ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECHNICIAN, PHARMACIST, SUPERADMIN

**Patient Management:**
- `Patient` - Patient records with personal info, medical history
- `PatientEmergencyContact` - Emergency contacts for patients
- Tracks gender, civil status, profession, doctor assignments

**Appointments:**
- `Appointment` - Scheduled appointments between patients and doctors
- `AppointmentType` - Categorization of appointment types
- Supports status tracking (PENDING, CONFIRMED, CANCELED, COMPLETED)

**Treatment System:**
- `Treatment` - Medical treatments with diagnosis, pricing, payment tracking
- `TreatmentStep` - Individual steps within a treatment plan
- Treatments can have multiple appointments and steps
- Payment tracking at both treatment and step levels

**Invoicing & Payments:**
- `Invoice` - Financial invoices linked to treatments/steps or standalone
- `InvoiceItem` - Line items within invoices, can reference inventory
- `Payment` - Payment records with methods and status tracking
- Supports multiple payment methods: CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER

**Inventory Management:**
- `Inventory` - Stock items with pricing, quantity, categories
- `InventoryCategory` - Categorization of inventory items
- `Provider` - Suppliers/providers of inventory
- `InventoryMovement` - Track inventory movements (purchases, sales, adjustments, etc.)
- `InventoryMovementDocument` - Receipts, invoices, and other documents for movements
- `InventoryAlert` - Automated alerts for low stock and other conditions
- `PriceHistory` - Historical price tracking

### Key Relationships

- Patients can have multiple appointments and treatments
- Treatments consist of multiple steps and can span multiple appointments
- Invoices can be created for entire treatments or individual treatment steps
- Inventory items are tracked through movements with comprehensive documentation
- Users (doctors, staff) are linked throughout the system as creators and assignees

### Application Structure

**Technology Stack:**
- Framework: NestJS 11.x
- Runtime: Node.js with TypeScript 5.7
- ORM: Prisma 6.17
- Database: PostgreSQL
- API Documentation: Swagger/OpenAPI
- Testing: Jest with Supertest

**Current Module Organization:**
- Entry point: `src/main.ts` - Configures Swagger and starts the server on port 3000
- Root module: `src/app.module.ts` - Currently minimal, modules will be added here
- The application is in early stages with only boilerplate structure

**Expected Module Growth Pattern:**
As the application develops, modules should be organized by domain:
- `users/` - User and authentication management
- `patients/` - Patient records and emergency contacts
- `appointments/` - Appointment scheduling
- `treatments/` - Treatment and treatment step management
- `invoices/` - Invoicing and payment processing
- `inventory/` - Inventory, movements, and alerts
- `common/` - Shared utilities, guards, interceptors, decorators

### Configuration

- TypeScript is configured for ES2023 with Node.js Next resolution
- Decorators are enabled for NestJS dependency injection
- Port defaults to 3000 (configurable via PORT environment variable)
- Database connection via DATABASE_URL environment variable (see .env file)

## Important Notes

- The Prisma schema is the source of truth for the data model
- Many models have soft delete patterns (status fields with DELETED enum values)
- Financial fields use Decimal type for precision
- Timestamps (createdAt, updatedAt) are automatically managed on all models
- The schema supports multi-currency (currency field on Invoice)
- All IDs use UUID v4
