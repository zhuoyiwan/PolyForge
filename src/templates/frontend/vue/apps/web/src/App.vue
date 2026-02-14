<script setup lang="ts">
import { ref } from "vue";
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

const apiResult = ref<ApiPayload | null>(null);
const bffResult = ref<ApiPayload | null>(null);
const apiError = ref("");
const bffError = ref("");

async function callApi() {
  apiError.value = "";
  try {
    apiResult.value = await pingApi();
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : String(error);
  }
}

async function callBff() {
  if (!HAS_BFF) return;
  bffError.value = "";
  try {
    bffResult.value = await pingBff();
  } catch (error) {
    bffError.value = error instanceof Error ? error.message : String(error);
  }
}
</script>

<template>
  <main style="font-family: sans-serif; padding: 24px; max-width: 900px;">
    <h1>{{PROJECT_NAME}} - Vue</h1>
    <p>API base: <code>{{ getApiBase() }}</code> | BFF base: <code>{{ getBffBase() }}</code></p>
    <p>Available services: <code>{{ availableServices.join(", ") }}</code></p>

    <section style="margin-bottom: 20px;">
      <button @click="callApi">Call API /api/v1/ping</button>
      <p v-if="apiError" style="color: crimson;">{{ apiError }}</p>
      <pre v-if="apiResult">{{ JSON.stringify(apiResult, null, 2) }}</pre>
    </section>

    <section>
      <button @click="callBff" :disabled="!HAS_BFF">Call BFF /bff/ping</button>
      <p v-if="!HAS_BFF">BFF module not selected. Enable <code>gateway-bff</code> to use this call.</p>
      <p v-if="bffError" style="color: crimson;">{{ bffError }}</p>
      <pre v-if="bffResult">{{ JSON.stringify(bffResult, null, 2) }}</pre>
    </section>
  </main>
</template>
