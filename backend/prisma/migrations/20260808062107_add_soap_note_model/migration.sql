-- CreateEnum
CREATE TYPE "SoapNoteStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateTable
CREATE TABLE "soap_notes" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "SoapNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subjectiveContent" TEXT NOT NULL,
    "subjectiveNotMentioned" TEXT[],
    "objectiveContent" TEXT NOT NULL,
    "objectiveNotMentioned" TEXT[],
    "assessmentContent" TEXT NOT NULL,
    "assessmentNotMentioned" TEXT[],
    "planContent" TEXT NOT NULL,
    "planNotMentioned" TEXT[],
    "consultationId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soap_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "soap_notes_consultationId_idx" ON "soap_notes"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "soap_notes_consultationId_version_key" ON "soap_notes"("consultationId", "version");

-- AddForeignKey
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
