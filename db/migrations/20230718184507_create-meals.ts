import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("meal_id").primary();
    table.text("meal_name").notNullable();
    table.text("meal_description").notNullable();
    table.timestamp("meal_date_time").defaultTo(knex.fn.now()).notNullable();
    table.uuid("user_id");
    table.foreign("user_id").references("users.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
