import { connect, StringCodec } from "nats";

const nc = await connect({ servers: process.env.NATS_URL || "nats://127.0.0.1:4222" });
const sc = StringCodec();

const subject = "app.task.created";
const sub = nc.subscribe(subject, { max: 1 });

const payload = {
  id: `evt-${Date.now()}`,
  type: subject,
  timestamp: new Date().toISOString(),
};

nc.publish(subject, sc.encode(JSON.stringify(payload)));

const timeout = setTimeout(async () => {
  console.error("[mq-worker] roundtrip timeout");
  await nc.drain();
  process.exit(1);
}, 3000);

for await (const msg of sub) {
  const parsed = JSON.parse(sc.decode(msg.data));
  clearTimeout(timeout);
  console.log("[mq-worker] roundtrip ok", parsed.id);
  await nc.drain();
  process.exit(0);
}
