import process from "process";
import { Buffer } from "buffer";
import allSettled from "promise.allsettled";

allSettled.shim();

global.process = process;
global.Buffer = Buffer;
