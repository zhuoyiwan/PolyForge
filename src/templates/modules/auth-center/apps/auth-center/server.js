const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const secret = process.env.JWT_SECRET || "change-me";

app.post("/auth/login", (req, res) => {
  const username = req.body?.username || "demo";
  const token = jwt.sign({ sub: username, role: "user" }, secret, { expiresIn: "1h" });
  res.json({ code: 0, message: "success", data: { accessToken: token }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ code: 0, message: "success", data: { status: "ok" }, traceId: req.header("X-Trace-Id") || "auth-trace", timestamp: new Date().toISOString() });
});

app.listen(8081, () => {
  console.log("auth-center listening on :8081");
});
