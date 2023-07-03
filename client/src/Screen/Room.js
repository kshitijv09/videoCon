import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";

export default function Room() {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const remoteVideoRef = useRef(null);

  const joinUser = useCallback((data) => {
    const { email, id } = data;
    setRemoteSocketId(id);
    console.log(`Email ${email} joined the room`, remoteSocketId);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  /* const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer
        .setLocalDescription(ans)
        .then(() => {
          console.log("Call Accepted!");
        })
        .catch((error) => {
          console.error("Failed to set local description:", error);
        });
      sendStreams();
    },
    [sendStreams]
  ); */

  useEffect(() => {
    socket.on("user_joined", joinUser);
    /* socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted); */

    return () => {
      socket.off("user_joined");
      /* socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted); */
    };
  }, [socket, joinUser /* handleIncommingCall, handleCallAccepted */]);

  return (
    <div>
      <h1> This is the Room</h1>
      <h2>{remoteSocketId ? "Connected" : "Not"}</h2>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>}*/}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>

          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {/* {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )} */}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </>
      )}
    </div>
  );
}
