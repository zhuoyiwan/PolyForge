import { type ApiPayload } from "./request";
import { getApiBase, healthApi, pingApi } from "./services/api";
import { getBffBase, pingBff as pingBffService } from "./services/bff";

const HAS_BFF = "{{HAS_GATEWAY_BFF}}" === "true";

export { type ApiPayload, getApiBase, healthApi, pingApi, getBffBase };

export const availableServices = HAS_BFF ? ["api", "bff"] as const : ["api"] as const;

export async function pingBff(): Promise<ApiPayload<{ message: string }>> {
  if (!HAS_BFF) {
    throw new Error("gateway-bff module not enabled");
  }
  return pingBffService();
}

export function hasBffEnabled(): boolean {
  return HAS_BFF;
}
