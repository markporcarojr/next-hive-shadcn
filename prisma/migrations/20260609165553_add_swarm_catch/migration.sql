-- CreateTable
CREATE TABLE "SwarmCatch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "catchDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "convertedToHive" BOOLEAN NOT NULL DEFAULT false,
    "hiveId" INTEGER,
    "trapId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SwarmCatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SwarmCatch_hiveId_key" ON "SwarmCatch"("hiveId");

-- AddForeignKey
ALTER TABLE "SwarmCatch" ADD CONSTRAINT "SwarmCatch_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwarmCatch" ADD CONSTRAINT "SwarmCatch_trapId_fkey" FOREIGN KEY ("trapId") REFERENCES "SwarmTrap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwarmCatch" ADD CONSTRAINT "SwarmCatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
