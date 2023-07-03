import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

export default function Lobby() {
  const { socket } = useSocket();
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("join room", { email, room });
    },
    [socket, email, room]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      // console.log(email, room);
      navigate(`/rooms/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room_join", handleJoinRoom);
    return () => {
      socket.off("room_join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

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
