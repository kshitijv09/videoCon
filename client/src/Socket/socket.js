import { useMemo } from "react";
import { io } from "socket.io-client";
/* export const socket = useMemo(() => {
  io("http://localhost:8000");
}, []); */
export const socket = io("http://localhost:8000");
