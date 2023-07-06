import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import Peer from "simple-peer";

export default function Room2() {
  const { socket } = useSocket();
  const [peers, setPeers] = useState([]); // Array to store all connected peers
  const [myStream, setMyStream] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState([]);

  const currentVideoRef = useRef(null);
  const remoteVideoRefs = useRef({}); // Ref to store remote video elements by socketId
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initStream();
  }, []);

  useEffect(() => {
    if (myStream) {
      // Create a new peer for each connected socket
      const newPeers = [];
      socket.on("user_joined", (data) => {
        const { email, id } = data;
        console.log(`Email ${email} joined the room`, id);

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: myStream,
        });

        peer.on("signal", (data) => {
          socket.emit("callUser", {
            userToCall: id,
            signalData: data,
          });
        });

        remoteVideoRefs.current[id] = remoteVideoRef;

        peer.on("stream", (currentStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = currentStream;
          }
        });

        newPeers.push({ id, peer });
        setPeers((prevPeers) => [...prevPeers, { id, peer }]);
      });

      setPeers(newPeers);
    }
  }, [myStream, socket]);

  const answerCall = useCallback(
    (call, peerId) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: myStream,
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: call.from });
      });

      remoteVideoRefs.current[peerId] = remoteVideoRef;

      peer.on("stream", (currentStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = currentStream;
        }
      });

      peer.signal(call.signal);

      setPeers((prevPeers) => [...prevPeers, { id: peerId, peer }]);
    },
    [myStream, socket]
  );

  useEffect(() => {
    socket.on("incomingCall", (data) => {
      const { call, from } = data;
      console.log("Incoming call from:", from);
      answerCall(call, from);
    });

    return () => {
      socket.off("incomingCall");
    };
  }, [socket, answerCall]);

  const fileHandler = useCallback((fileData) => {
    console.log("Received file:", fileData);
    setReceivedFiles((prevFiles) => [...prevFiles, fileData]);
  }, []);

  useEffect(() => {
    socket.on("file", fileHandler);

    return () => {
      socket.off("file", fileHandler);
    };
  }, [socket, fileHandler]);

  const sendFile = useCallback((file) => {
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((fileInfo) => {
        console.log("File uploaded successfully:", fileInfo);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  }, []);

  useEffect(() => {
    if (currentVideoRef.current && myStream) {
      currentVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    for (const peer of peers) {
      if (peer.peer) {
        peer.peer.destroy();
      }
    }
  }, [peers]);

  return (
    <div>
      <h1> This is the Room</h1>
      {peers.length > 0 && (
        <div>
          <h2>Connected Peers:</h2>
          {peers.map((peer) => (
            <div key={peer.id}>
              <h3>Peer ID: {peer.id}</h3>
              <video
                ref={remoteVideoRefs.current[peer.id]}
                autoPlay
                muted
                playsInline
              />
            </div>
          ))}
        </div>
      )}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <video ref={currentVideoRef} autoPlay muted playsInline />
          <input type="file" onChange={(e) => sendFile(e.target.files[0])} />
        </>
      )}
      {receivedFiles.length > 0 && (
        <div>
          <h3>Received Files:</h3>
          <ul>
            {receivedFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} download={file.originalname}>
                  {file.originalname}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
