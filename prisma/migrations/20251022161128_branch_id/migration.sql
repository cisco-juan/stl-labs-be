-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "inventories" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "inventory_moves" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_moves" ADD CONSTRAINT "inventory_moves_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
