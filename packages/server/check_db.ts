import { db } from "./src/db/index";
import { messages } from "@intellicircle/shared";

async function run() {
    const allMsgs = await db.select().from(messages).limit(10);
    console.log("Database Messages:", allMsgs);
    process.exit(0);
}
run();
