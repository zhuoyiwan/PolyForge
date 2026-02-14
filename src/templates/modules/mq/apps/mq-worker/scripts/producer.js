import { connect, StringCodec } from "nats";

const nc = await connect({ servers: process.env.NATS_URL || "nats://127.0.0.1:4222" });
const sc = StringCodec();

const payload = {
  id: `evt-${Date.now()}`,
  type: "app.task.created",
  timestamp: new Date().toISOString(),
};

nc.publish("app.task.created", sc.encode(JSON.stringify(payload)));
console.log("[mq-worker] produced", payload);

await nc.drain();
