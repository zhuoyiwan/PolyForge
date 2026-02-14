import { connect, StringCodec } from "nats";

const nc = await connect({ servers: process.env.NATS_URL || "nats://127.0.0.1:4222" });
const sc = StringCodec();

const sub = nc.subscribe("app.task.created");
console.log("[mq-worker] listening on subject app.task.created");

for await (const msg of sub) {
  console.log("[mq-worker] consumed", sc.decode(msg.data));
}
