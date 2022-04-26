import React from "react";
import { EventEmitter2 } from "eventemitter2";

export const VoidContext = React.createContext<EventEmitter2>(null as any);
