import { buildApp } from "./app";
import { env } from "./config/env";

const start = async () => {
    const app = await buildApp();

    try {
        await app.listen({ port: env.PORT, host: "0.0.0.0" });
        app.log.info(`🚀 Server listening on http://localhost:${env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
