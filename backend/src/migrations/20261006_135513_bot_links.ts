import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "bot_vk_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "bot_telegram_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "bot_max_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "bot_vk_url";
  ALTER TABLE "site_settings" DROP COLUMN "bot_telegram_url";
  ALTER TABLE "site_settings" DROP COLUMN "bot_max_url";`)
}
