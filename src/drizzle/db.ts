import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";

export const db = drizzle(env.DATABASE_URL, { schema });
