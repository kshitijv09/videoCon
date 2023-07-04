const { Server } = require("socket.io");

const emailToSocketid = new Map();
const socketidToEmail = new Map();

const io = new Server(8000, {
  cors: true,
});

io.on("connection", (socket) => {
  console.log(`Socket connected with id ${socket.id}`);

  socket.on("join room", (data) => {
    const { email, room } = data;
    emailToSocketid.set(email, socket.id);
    socketidToEmail.set(socket.id, email);
    console.log(email, room, socket.id);

    io.to(room).emit("user_joined", { email: email, id: socket.id }); // To all sockets excluding sender
    socket.join(room);

    io.to(socket.id).emit("room_join", data);

    socket.on("callUser", ({ userToCall, signalData /* , from, name */ }) => {
      io.to(userToCall).emit("incomingCall", {
        signal: signalData,
        from: socket.id,
      });
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    socket.on("disconnect", () => {
      const email = socketidToEmail.get(socket.id);
      if (email) {
        emailToSocketid.delete(email);
        socketidToEmail.delete(socket.id);
      }
    });
  });
});
