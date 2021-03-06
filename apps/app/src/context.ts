import React from "react";
import levelup from "levelup";
import { VoidInterface } from "./interface";

export const VoidContext = React.createContext<VoidInterface>(null as any);
export const PrefsContext = React.createContext<levelup.LevelUp>(null as any);
