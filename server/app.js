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
    console.log(email, room);

    io.to(socket.id).emit("room_join", data); // To all sockets including sender
    socket.join(room);
    io.to(room).emit("user_joined", { email: email, id: socket.id });

    socket.on("user:call", ({ to, offer }) => {
      console.log("Offer is ", offer);
      io.to(to).emit("incomming:call", { from: socket.id, offer: offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    });
  });
});
