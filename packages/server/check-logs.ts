import { db } from './src/db/index';
import { authAuditLogs } from '@intellicircle/shared';

async function check() {
    const logs = await db.select().from(authAuditLogs).execute();
    console.log(logs);
    process.exit(0);
}

check();
