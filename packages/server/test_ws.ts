import WebSocket from "ws";
import { buildApp } from "./src/app";

async function run() {
    const app = await buildApp();
    await app.listen({ port: 8089 });

    // Login
    const authRes = await app.inject({ method: 'POST', url: '/api/auth/anonymous', payload: { username: 'chat_tester' } });
    const token = JSON.parse(authRes.payload).data.accessToken;

    const ws = new WebSocket(`ws://localhost:8089/ws?token=${token}`);

    ws.on('open', () => {
        console.log("✅ WS Connected!");
        ws.send(JSON.stringify({ type: "join_room", payload: { roomId: 1 } }));
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log("⬇️ WS Event:", msg.type, typeof msg.payload === 'object' ? JSON.stringify(msg.payload) : msg.message || "");

        if (msg.type === "user_joined") {
            console.log("📤 Sending [send_message] packet...");
            ws.send(JSON.stringify({
                type: "send_message",
                payload: { roomId: 1, content: "Hello from test script!" }
            }));
        } else if (msg.type === "new_message") {
            console.log("✅ Success! Chat broadcast to network.");
            ws.close();
            process.exit(0);
        } else if (msg.type === "error") {
            console.log("❌ Server threw explicit WS Error!");
            ws.close();
            process.exit(1);
        }
    });

    ws.on('error', (e) => console.log('Raw WS error:', e));
    setTimeout(() => { console.log('Timeout. Exiting.'); process.exit(1); }, 3000);
}

run();
