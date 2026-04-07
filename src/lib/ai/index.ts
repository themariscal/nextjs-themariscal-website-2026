import { google } from "@ai-sdk/google";

import { customMiddleware } from "./custom-middleware";
import { wrapLanguageModel } from "ai";
import config from "@/lib/config";

const apikey = config.env.gemini.apiKey!;

export const geminiProModel = wrapLanguageModel({
  // Pass only the model name as required by the latest google() signature
  model: google("gemini-1.5-pro-002"),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  // Pass only the model name as required by the latest google() signature
  model: google("gemini-1.5-flash-002"),
  middleware: customMiddleware,
});
