import "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      user_id: string;
      user_name: string;
      user_password: string;
      created_at: string;
    };
    meals: {
      meal_id: string;
      meal_name: string;
      meal_description: string;
      meal_date_time: string;
      is_inside: boolean;
      user_id: string;
    };
  }
}
