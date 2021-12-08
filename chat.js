const express = require("express");
const app = express();
app.use(express.static(__dirname + "/public"));
const socketio = require("socket.io");
const namespace = require("./data/namespaces");

const expressServer = app.listen(5000);
const io = socketio(expressServer, {
  // all comes with defalut value
  // path: "/socket.io", // This value is set by default
  // serverClient: true, // This value is set by default
  cors: {
    origin: "http://127.0.0.1:5000",
  },
});
// io.on = io.of('/').on = io.socket.on
// io.emit = io.of('/').emit = io.socket.emit

io.on("connection", (socket) => {
  // console.log(`default Values present in handshake with our username ${socket.handshake}`); => query :{username: "john",EIO: "3", transport: "polling",t: "<some_random_word>"}
  // build an array to send back with the img and endpoint for each NS
  let nsData = namespace.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });

  // send back the nsData to the client. We need to use socket not io, we want it to go to just this client
  socket.emit("nsList", nsData);
});

// loop through each namespace and listen for a connection
namespace.forEach((namespace) => {
  // console.log(namespace);
  io.of(namespace.endpoint).on("connection", (nsSocket) => {
    const username = nsSocket.handshake.query.username;
    // here we will use nsSocket instead to differentiate between the main/root socket and the namespace sockets
    // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);

    nsSocket.emit("nsRoomLoad", namespace.rooms);

    nsSocket.on("joinRoom", async (roomToJoin) => {
      // deal with history once we have it
      const roomToLeave = Array.from(nsSocket.rooms)[1];
      // console.log(`roomtoleave is ${roomToLeave}`);

      nsSocket.leave(roomToLeave);

      const leave_ids = await io
        .of(namespace.endpoint)
        .in(roomToLeave)
        .allSockets();
      // console.log(
      //   `number users after a user leaves the ${roomToLeave} is ${leave_ids.size}`
      // );

      io.of(namespace.endpoint)
        .to(roomToLeave)
        .emit("updateMembers", leave_ids.size);
      nsSocket.join(roomToJoin);

      const ids = await io.of(namespace.endpoint).in(roomToJoin).allSockets();

      // console.log(`The count of user increased to ${ids.size}`);
      // numberOfUsersCallback(ids.size);
      // console.dir(ids);
      const nsRoom = namespace.rooms.find((room) => {
        // find is es6 new method
        return room.roomTitle === roomToJoin;
      });

      // console.log(`nsRoom is ${nsRoom.history}`);
      nsSocket.emit("chatHistory", nsRoom.history); // This will emit the history of the chats/msgs of perticular room as soon as anyone joins the room
      // So Now we will update the dom from the listener in the joinRoom.js

      io.of(namespace.endpoint).to(roomToJoin).emit("updateMembers", ids.size);
    });
    nsSocket.on("newMessageToServer", (msg) => {
      const fullMsg = {
        text: msg.text,
        time: new Date().toLocaleString(),
        username: username,
        avatar: "https://via.placeholder.com/30",
      };

      // console.log(fullMsg);

      // Send this message to ALL the sockets that are in the room that THIS socket is in.
      // how can we find out what rooms THIS SOCKET is in?

      // console.log(nsSocket.rooms); => { '0ks8pyOagok6EVHKAAAE', 'New Articles' }
      // console.log(Array.from(nsSocket.rooms)); => [ '0ks8pyOagok6EVHKAAAE', 'New Articles' ]
      // console.log(Array.from(nsSocket.rooms)[1]); => New Articles

      // the user will be in the 2nd room in the object list
      // this is because the socket ALWAYS joins its own room on connection
      // get the keys
      // and then the room name will be 2nd in that array(Object.keys will create array of keys) so grab it
      // const roomTitle = Object.keys(nsSocket.rooms)[1]; // This method taught in the course which wont worked
      const roomTitle = Array.from(nsSocket.rooms)[1]; // This is my method and it worked 😏
      // console.log(`nsSocket.rooms is ${nsSocket.rooms}`);
      // console.log(`roomtTitle is ${roomTitle}`);
      // So to maintain the history like if to show history of messages to every new users that joins the namespace there is no builtiin method for this in socketio
      // We know the in which namespace we are in from the namespce in line no 29 which contains the array of rooms.
      // We also have the current room name in roomTitle in line no 70
      // so we will match the room of namespace which is populated by Addroom function of namespace with our room of roomTitle and then if it becomes true then it will return the element of the array of namespace
      // console.log(namespaces[0].rooms.history);
      const nsRoom = namespace.rooms.find((room) => {
        // find is es6 new method
        return room.roomTitle === roomTitle;
      });
      nsRoom.addMessage(fullMsg); // This will push the messages/chats into the history array
      // console.log(nsRoom);
      io.of(namespace.endpoint).to(roomTitle).emit("messageToClient", fullMsg);
    });
  });
});
