import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  knex.schema.alterTable("users", (table) => {
    table.unique("user_name");
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.alterTable("users", (table) => {
    table.dropColumn("user_name");
  });
}
