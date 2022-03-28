import process from "process";
import { Buffer } from "buffer";

global.process = process;
global.Buffer = Buffer;
global.__dirname = ".";
