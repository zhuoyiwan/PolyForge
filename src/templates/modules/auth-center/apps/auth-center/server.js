const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const secret = process.env.JWT_SECRET || "change-me";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "change-refresh-me";

function signAccessToken(subject) {
  return jwt.sign({ sub: subject, role: "user" }, secret, { expiresIn: "1h" });
}

function signRefreshToken(subject) {
  return jwt.sign({ sub: subject, type: "refresh" }, refreshSecret, { expiresIn: "7d" });
}

app.post("/auth/login", (req, res) => {
  const username = req.body?.username || "demo";
  const accessToken = signAccessToken(username);
  const refreshToken = signRefreshToken(username);

  res.json({
    code: 0,
    message: "success",
    data: { accessToken, refreshToken, tokenType: "Bearer", expiresIn: 3600 },
    traceId: req.header("X-Trace-Id") || "auth-trace",
    timestamp: new Date().toISOString(),
  });
});

app.post("/auth/refresh", (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) {
    return res.status(400).json({ code: 10001, message: "refreshToken required", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }

  try {
    const decoded = jwt.verify(token, refreshSecret);
    const accessToken = signAccessToken(decoded.sub);
    return res.json({ code: 0, message: "success", data: { accessToken, tokenType: "Bearer", expiresIn: 3600 }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  } catch (_e) {
    return res.status(401).json({ code: 10002, message: "invalid refresh token", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }
});

app.get("/auth/verify", (req, res) => {
  const auth = req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return res.status(401).json({ code: 10003, message: "missing bearer token", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return res.json({ code: 0, message: "success", data: { subject: decoded.sub }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  } catch (_e) {
    return res.status(401).json({ code: 10004, message: "invalid access token", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }
});

app.get("/auth/me", (req, res) => {
  const auth = req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return res.status(401).json({ code: 10003, message: "missing bearer token", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return res.json({ code: 0, message: "success", data: { subject: decoded.sub, role: decoded.role }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  } catch (_e) {
    return res.status(401).json({ code: 10004, message: "invalid access token", data: null, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
  }
});

app.get("/health", (req, res) => {
  res.json({ code: 0, message: "success", data: { status: "ok" }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT || 8081);
app.listen(port, () => {
  console.log(`auth-center listening on :${port}`);
});
