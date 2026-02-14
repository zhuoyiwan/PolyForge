import { useState } from "react";
import {
  availableServices,
  getApiBase,
  getBffBase,
  hasBffEnabled,
  pingApi,
  pingBff,
  type ApiPayload,
} from "./api/client";

const HAS_BFF = hasBffEnabled();

export function App() {
  const [apiResult, setApiResult] = useState<ApiPayload | null>(null);
  const [apiError, setApiError] = useState<string>("");
  const [bffResult, setBffResult] = useState<ApiPayload | null>(null);
  const [bffError, setBffError] = useState<string>("");

  const callApi = async () => {
    setApiError("");
    try {
      setApiResult(await pingApi());
    } catch (error) {
      setApiError(error instanceof Error ? error.message : String(error));
    }
  };

  const callBff = async () => {
    if (!HAS_BFF) return;
    setBffError("");
    try {
      setBffResult(await pingBff());
    } catch (error) {
      setBffError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 900 }}>
      <h1>{{PROJECT_NAME}} - React</h1>
      <p>API base: <code>{getApiBase()}</code> | BFF base: <code>{getBffBase()}</code></p>
      <p>Available services: <code>{availableServices.join(", ")}</code></p>

      <section style={{ marginBottom: 20 }}>
        <button onClick={callApi}>Call API /api/v1/ping</button>
        {apiError ? <p style={{ color: "crimson" }}>{apiError}</p> : null}
        {apiResult ? <pre>{JSON.stringify(apiResult, null, 2)}</pre> : null}
      </section>

      <section>
        <button onClick={callBff} disabled={!HAS_BFF}>Call BFF /bff/ping</button>
        {!HAS_BFF ? <p>BFF module not selected. Enable <code>gateway-bff</code> to use this call.</p> : null}
        {bffError ? <p style={{ color: "crimson" }}>{bffError}</p> : null}
        {bffResult ? <pre>{JSON.stringify(bffResult, null, 2)}</pre> : null}
      </section>
    </main>
  );
}
