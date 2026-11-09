import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { manifest } from "./manifest";
import Page from "./page";

const kyc: ToolDefinition = { manifest, build, Page };

export default kyc;
