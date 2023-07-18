import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { knex } from "../database";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserSchema = z.object({
      user_name: z.string(),
      user_password: z.string().min(3).max(30),
    });

    const { user_name, user_password } = createUserSchema.parse(request.body);

    let user_id = request.cookies.user_id;

    if (!user_id) {
      user_id = randomUUID();

      reply.cookie("user_id", user_id, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    await knex("users").insert({
      user_id,
      user_name,
      user_password: hashedPassword,
    });

    return reply.status(201).send();
  });

  app.post("/login", async (request, reply) => {
    const createUserSchema = z.object({
      user_name: z.string(),
      user_password: z.string().min(3).max(30),
    });

    const { user_name, user_password } = createUserSchema.parse(request.body);

    const user = await knex("users")
      .where("user_name", user_name)
      .select()
      .first();

    if (!user) return reply.status(404).send({ error: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!isPasswordCorrect) throw new Error("Password incorrect");

    let user_id = request.cookies.user_id;

    if (!user_id) {
      user_id = randomUUID();

      reply.cookie("user_id", user_id, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }
  });
}
