-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('OPEN', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'CLOSED',
    "nextToken" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'WAITING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_queueId_userId_status_key" ON "QueueEntry"("queueId", "userId", "status");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
