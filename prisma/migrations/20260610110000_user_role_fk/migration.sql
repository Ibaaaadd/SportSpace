-- Add nullable roleId column to users
ALTER TABLE "users" ADD COLUMN "roleId" TEXT;

-- Backfill roleId by matching old enum role value to roles.name (case-insensitive)
UPDATE "users" u
SET "roleId" = r.id
FROM "roles" r
WHERE LOWER(r.name) = LOWER(u.role::text);

-- Make roleId required
ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL;

-- Drop old enum column
ALTER TABLE "users" DROP COLUMN "role";

-- Drop old enum type
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");
