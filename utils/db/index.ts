import { Kysely } from "kysely";
import { Database } from "./types";
import { PlanetScaleDialect } from "kysely-planetscale";

export const db = new Kysely<Database>({
    dialect: new PlanetScaleDialect({
        url: process.env.DATABASE_URL!,
    }),
    log: ['query', 'error']
});

