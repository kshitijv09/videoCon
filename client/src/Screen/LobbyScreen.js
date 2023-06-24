import React, { useCallback, useState } from "react";
import { socket } from "../Socket/socket";
export default function LobbyScreen() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("Join Room", { email, room });
    },
    [socket, email, room]
  );
  return (
    <form onSubmit={handleSubmitForm}>
      <label htmlFor="email">Email ID</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <label htmlFor="room">Room Number</label>
      <input
        type="text"
        id="room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <br />
      <button>Join</button>
    </form>
  );
}
