"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDs = void 0;
const fs_1 = __importDefault(require("fs"));
const json = JSON.parse(fs_1.default.readFileSync("fixtures/ids", "utf8"));
const IDs = [];
exports.IDs = IDs;
for (let kp of json) {
    IDs.push({
        publicKey: Buffer.from(kp.publicKey, "hex"),
        secretKey: Buffer.from(kp.secretKey, "hex"),
    });
}
