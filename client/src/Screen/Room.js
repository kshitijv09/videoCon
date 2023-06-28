import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

export default function Room() {
  const socket = useSocket();
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
    const offer = await peer.getOffer();
    //console.log("Offer is", offer);
    socket.emit("user:call", { to: remoteSocketId, offer: offer });
    setMyStream(stream);
    //stream.getTracks().forEach(track => peer.addTrack(track, stream));
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
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

  /* socket.on('remotePeerIceCandidate', async (data) => {
    try {
      const candidate = new RTCIceCandidate(data.candidate);
      await peer.addIceCandidate(candidate);
    } catch (error) {
      // Handle error, this will be rejected very often
    }
  }) */
  /* const sendIceCandidate = (event) => {
    socket.emit("iceCandidate", {
      to: remoteSocketId,
      candidate: event.candidate,
    });
  };

  useEffect(() => {
    peer.onicecandidate = (event) => {
      sendIceCandidate(event);
    };
  }, [socket]);

  const handleRemotePeerIceCandidate = useCallback(async (data) => {
    try {
      const candidate = new RTCIceCandidate(data.candidate);
      await peer.addIceCandidate(candidate);
    } catch (error) {
      // Handle error, this will be rejected very often
      console.log("Error logged is", error);
    }
  }, []); */

  const sendStreams = useCallback(() => {
    /* for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    } */
    const localTracks = myStream.getTracks();
    const senders = peer.peer.getSenders();

    localTracks.forEach((track) => {
      const sender = senders.find((s) => s.track.kind === track.kind);

      if (!sender) {
        peer.peer.addTrack(track, myStream);
      }
    });
  }, [myStream]);

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
  );

  // Negotiation

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    /*  await peer.setLocalDescription(ans); */
    await peer.setLocalDescription(ans);
    const remoteStream = new MediaStream(
      peer.peer.getReceivers().map((receiver) => receiver.track)
    );
    setRemoteStream(remoteStream);
  }, []);

  /* useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []); */

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      const remoteStream = new MediaStream([event.track]);
      console.log("Track found");
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("user_joined", joinUser);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    /* socket.on("remotePeerIceCandidate", handleRemotePeerIceCandidate); */
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.off("user_joined");
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      /* socket.off("remotePeerIceCandidate", handleRemotePeerIceCandidate); */
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    joinUser,
    handleIncommingCall,
    handleCallAccepted,
    /*  handleRemotePeerIceCandidate, */
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1> This is the Room</h1>
      <h2>{remoteSocketId ? "Connected" : "Not"}</h2>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
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
