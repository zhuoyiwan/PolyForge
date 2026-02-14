const express = require("express");

const app = express();
app.use(express.json());

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8080";
const port = Number(process.env.PORT || 3001);

const rateCounter = new Map();
setInterval(() => rateCounter.clear(), 60 * 1000);

function traceId(req) {
  return req.header("X-Trace-Id") || "bff-trace";
}

function withMeta(req, data) {
  return {
    code: 0,
    message: "success",
    data,
    traceId: traceId(req),
    timestamp: new Date().toISOString(),
  };
}

function authPassthrough(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ code: 10003, message: "missing Authorization header", data: null, traceId: traceId(req), timestamp: new Date().toISOString() });
  }
  return next();
}

function rateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const count = (rateCounter.get(key) || 0) + 1;
  rateCounter.set(key, count);
  if (count > 120) {
    return res.status(429).json({ code: 10029, message: "rate limit exceeded", data: null, traceId: traceId(req), timestamp: new Date().toISOString() });
  }
  return next();
}

app.get("/health", (_req, res) => {
  res.json({ code: 0, message: "success", data: { status: "ok" }, traceId: "bff-trace", timestamp: new Date().toISOString() });
});

app.get("/bff/ping", (req, res) => {
  res.json(withMeta(req, { message: "bff pong" }));
});

app.get("/bff/aggregate", rateLimit, authPassthrough, async (req, res) => {
  try {
    const [healthResp, pingResp] = await Promise.all([
      fetch(`${API_BASE}/health`, { headers: { "X-Trace-Id": traceId(req) } }),
      fetch(`${API_BASE}/api/v1/ping`, { headers: { "X-Trace-Id": traceId(req) } }),
    ]);

    const [healthData, pingData] = await Promise.all([healthResp.json(), pingResp.json()]);
    return res.json(withMeta(req, { health: healthData, ping: pingData }));
  } catch (error) {
    return res.status(502).json({
      code: 10502,
      message: error instanceof Error ? error.message : "upstream call failed",
      data: null,
      traceId: traceId(req),
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(port, () => {
  console.log(`gateway-bff listening on :${port}`);
});
