-- DropForeignKey
ALTER TABLE "account_entries" DROP CONSTRAINT "account_entries_brewer_id_fkey";

-- AlterTable
ALTER TABLE "account_entries" ALTER COLUMN "brewer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "containers" ADD COLUMN     "is_byob" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "account_entries" ADD CONSTRAINT "account_entries_brewer_id_fkey" FOREIGN KEY ("brewer_id") REFERENCES "brewers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
