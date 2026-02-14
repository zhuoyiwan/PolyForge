const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ code: 0, message: "success", data: { status: "ok" }, traceId: "bff-trace", timestamp: new Date().toISOString() });
});

app.get("/bff/ping", (req, res) => {
  const traceId = req.header("X-Trace-Id") || "bff-trace";
  res.json({ code: 0, message: "success", data: { message: "bff pong" }, traceId, timestamp: new Date().toISOString() });
});

app.listen(3001, () => {
  console.log("gateway-bff listening on :3001");
});
