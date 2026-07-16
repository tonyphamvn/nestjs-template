import { Migration } from '@mikro-orm/migrations';

export class Migration20250429052621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" varchar(255) not null, "email" varchar(255) not null, "username" varchar(255) not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "users_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
