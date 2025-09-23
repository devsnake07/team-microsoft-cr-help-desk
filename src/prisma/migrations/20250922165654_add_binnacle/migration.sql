-- CreateTable
CREATE TABLE "Binnacle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Binnacle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Binnacle" ADD CONSTRAINT "Binnacle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
