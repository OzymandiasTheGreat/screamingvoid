import process from "process";
import { Buffer } from "buffer";
require("react-native-crypto");

global.process = process;
global.Buffer = Buffer;
global.__dirname = ".";
