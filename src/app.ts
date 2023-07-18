import cookie from "@fastify/cookie";
import fastify from "fastify";

import { mealsRoutes, userRoutes } from "./routes";

export const app = fastify();

app.register(cookie);
app.register(userRoutes, {
  prefix: "users",
});
app.register(mealsRoutes, {
  prefix: "meals",
});
