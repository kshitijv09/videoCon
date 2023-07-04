import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import Peer from "simple-peer";

export default function Room() {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const remoteVideoRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);

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
    setRemoteStream(stream);

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: remoteSocketId,
        signalData: data,
        /*  from: me, */
      });
    });

    peer.on("stream", (currentStream) => {
      /* userVideo.current.srcObject = currentStream; */
      setMyStream(currentStream);
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    //connectionRef.current = peer;
  }, [remoteSocketId, socket]);

  const answerCall = useCallback(
    async (call) => {
      console.log("Call is", call);
      setCallAccepted(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setRemoteStream(stream);

      const peer = new Peer({ initiator: false, trickle: false, stream });

      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: call.from });
      });

      peer.on("stream", (currentStream) => {
        setRemoteStream(currentStream);
      });

      peer.signal(call.signal);
    },
    [socket]
  );

  useEffect(() => {
    socket.on("user_joined", joinUser);
    socket.on("incomingCall", answerCall);

    return () => {
      socket.off("user_joined");
      socket.off("incomingCall");
    };
  }, [socket, joinUser, answerCall]);

  return (
    <div>
      <h1> This is the Room</h1>
      <h2>{remoteSocketId ? "Connected" : "Not"}</h2>
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
      {remoteStream && (
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
      )}
    </div>
  );
}
