const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

io.on("connection", (socket) => {
  console.log(`Socket connected with id ${socket.id}`);
  socket.on("Join Room", (data) => {
    const { email, room } = data;
    console.log(email, room);
  });
});
