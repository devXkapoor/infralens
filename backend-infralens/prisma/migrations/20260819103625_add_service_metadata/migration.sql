-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "environment" TEXT NOT NULL DEFAULT 'production',
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "region" TEXT;
