-- CreateTable
CREATE TABLE "pricing" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dayType" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "pricePerHour" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricing_venueId_label_dayType_key" ON "pricing"("venueId", "label", "dayType");

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
