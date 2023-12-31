import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { calcBestSequenceDiet } from "../utils/calcBestSequenceDiet";

import { checkUserIdExists } from "../middlewares";

import { knex } from "../database";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const meals = await knex("meals").where("user_id", user_id).select();

      return reply.status(200).send({ meals });
    }
  );

  app.get(
    "/:meal_id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const getTransactionParamsSchema = z.object({
        meal_id: z.string().uuid(),
      });

      const { meal_id } = getTransactionParamsSchema.parse(request.params);

      const meal = await knex("meals").where({ user_id, meal_id }).first();

      if (meal?.user_id !== user_id)
        return reply.status(401).send({ error: "Unauthorized" });

      return reply.status(200).send({ meal });
    }
  );

  app.get(
    "/metrics",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const totalMeals = await knex("meals")
        .count("*", { as: "total" })
        .where("user_id", user_id)
        .first();

      const insideDietMeals = await knex("meals")
        .count("*", { as: "total" })
        .where({ user_id, is_inside: true })
        .first();

      const outOffDietMeals = await knex("meals")
        .count("*", { as: "total" })
        .where({ user_id, is_inside: false })
        .first();

      const meals = await knex
        .table("meals")
        .where("user_id", user_id)
        .select("*");

      return reply.status(200).send({
        totalMeals: totalMeals?.total,
        insideDietMeals: insideDietMeals?.total,
        outOffDietMeals: outOffDietMeals?.total,
        sequenceInsideDietMeal: calcBestSequenceDiet(meals),
      });
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const createMealsSchema = z.object({
        meal_name: z.string(),
        meal_description: z.string(),
        is_inside: z.boolean(),
        meals_date_time: z.string().default(new Date().toString()),
      });

      const { meal_name, meal_description, is_inside } =
        createMealsSchema.parse(request.body);

      const { user_id } = request.cookies;

      await knex("meals").insert({
        meal_id: randomUUID(),
        meal_name,
        meal_description,
        is_inside,
        user_id,
      });

      return reply.status(201).send();
    }
  );

  app.patch(
    "/:meal_id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const updateMealsSchema = z.object({
        meal_name: z.string().optional(),
        meal_description: z.string().optional(),
        is_inside: z.boolean().optional(),
        meal_date_time: z.string().optional(),
      });

      const getTransactionParamsSchema = z.object({
        meal_id: z.string().uuid(),
      });

      const { meal_id } = getTransactionParamsSchema.parse(request.params);

      const { meal_name, meal_description, is_inside, meal_date_time } =
        updateMealsSchema.parse(request.body);

      const { user_id } = request.cookies;
      const userIdFromMeal = await knex("meals")
        .select("user_id")
        .where("meal_id", meal_id)
        .first();

      if (userIdFromMeal?.user_id !== user_id)
        return reply.status(401).send({ error: "Unauthorized" });

      await knex("meals")
        .where("meal_id", meal_id)
        .update({ meal_name, meal_description, is_inside, meal_date_time });
    }
  );

  app.delete("/:meal_id", async (request, reply) => {
    const getTransactionParamsSchema = z.object({
      meal_id: z.string().uuid(),
    });

    const { meal_id } = getTransactionParamsSchema.parse(request.params);

    const { user_id } = request.cookies;

    const userIdFromMeal = await knex("meals")
      .select("user_id")
      .where("meal_id", meal_id)
      .first();

    if (userIdFromMeal?.user_id !== user_id)
      return reply.status(401).send({ error: "Unauthorized" });

    await knex("meals").where("meal_id", meal_id).del();
  });
}
