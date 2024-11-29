import { env } from "./env";
import {
  Environment,
  getModelsUrlHiRes,
  getModelsUrlLowRes,
  getModelsUrlMidRes,
  getNwDataCdnUrl,
  getNwDataDeployUrl,
} from "./utils";

export const environment: Environment = {
  ...env,
  production: false,
  standalone: false,
  environment: "DEV",
  modelsUrlLow: getModelsUrlLowRes(env),
  modelsUrlMid: getModelsUrlMidRes(env),
  modelsUrlHigh: getModelsUrlHiRes(env),
  nwDataUrl: getNwDataDeployUrl(env),
  //cdnDataUrl: getNwDataDeployUrl(env),
  // use this for testing CDN assets
  cdnDataUrl: getNwDataCdnUrl(env),
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
};
