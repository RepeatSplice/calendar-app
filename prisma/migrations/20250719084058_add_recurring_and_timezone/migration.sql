-- AlterTable
ALTER TABLE "Event" ADD COLUMN "recurring" JSONB;
ALTER TABLE "Event" ADD COLUMN "timezone" TEXT DEFAULT 'UTC';
