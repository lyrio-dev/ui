import * as sha256Worker from "@/workers/sha256.worker";
import { createWorker } from "./createWorker";

export default () => createWorker(sha256Worker);
