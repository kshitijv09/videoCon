import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import Peer from "simple-peer";

export default function Room() {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const currentVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const [callInitiated, setCallInitiated] = useState(false);

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

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      // Fired  when peer wants to send signalling data to remote peer
      socket.emit("callUser", {
        userToCall: remoteSocketId,
        signalData: data,
        /*  from: me, */
      });
    });

    peer.on("stream", (currentStream) => {
      setRemoteStream(currentStream); //peer.on("stream") event listener is responsible for setting the received stream to the remoteStream state variable, allowing the remote video element to display the video of the respective peer.
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      setCallInitiated(true);
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

      peer.signal(call.signal); // all this method whenever the remote peer emits a peer.on('signal') event.
      //The data will encapsulate a webrtc offer, answer, or ice candidate. These messages help the peers to eventually establish a direct connection to each other.
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

  useEffect(() => {
    if (currentVideoRef.current && myStream) {
      currentVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callAccepted && !callInitiated) {
      const updateStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
      };

      updateStream();
    }
  }, [callAccepted, callInitiated]);

  return (
    <div>
      <h1> This is the Room</h1>
      <h2>{remoteSocketId ? "Connected" : "Not"}</h2>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>

          <video ref={currentVideoRef} autoPlay muted playsInline />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <video ref={remoteVideoRef} autoPlay muted playsInline />
        </>
      )}
    </div>
  );
}
