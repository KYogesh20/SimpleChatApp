const joinNs = (endpoint) => {
  if (nsSocket) {
    // check to see if the nsSocket is actually a socket
    nsSocket.close();

    // remove the eventlisteners before it's added again
    document
      .querySelector("#user-input")
      .removeEventListener("submit", formSubmit);
  }
  nsSocket = io(`http://127.0.0.1:5000${endpoint}`);
  nsSocket.on("nsRoomLoad", (nsRooms) => {
    // console.log(nsRooms);
    let roomList = document.querySelector(".room-list");
    roomList.innerHTML = "";
    console.log(nsRooms);
    nsRooms.forEach((room) => {
      // console.log(room);
      let glyph;
      if (room.privateRoom) glyph = "lock";
      else glyph = "globe";
      // console.log(glyph);
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`;
    });
    // console.log(roomList.innerHTML);

    // add click listener for each room
    let roomNodes = document.getElementsByClassName("room"); // As this is html collection not a array
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener("click", (e) => {
        console.log(`someone clicked on ${e.target.innerText}`);
        joinRoom(e.target.innerText);
      });
    });

    // add room automatically... first time here
    const topRoom = document.querySelector(".room"); // The querySelector will grab only first element of that perticular div
    const topRoomName = topRoom.innerText;
    // console.log(topRoomName);
    joinRoom(topRoomName);
  });
  nsSocket.on("welcome", (msg) => {
    document.querySelector("#messages").innerHTML += `<p>${msg.text}</p>`;
    // console.log(`${msg.txt}`);
  });

  nsSocket.on("messageToClient", (msg) => {
    console.log(msg);
    const fullMessage = createHTML(msg);
    document.querySelector("#messages").innerHTML += fullMessage;
  });
  document
    .querySelector(".message-form")
    .addEventListener("submit", formSubmit);
};

const formSubmit = (e) => {
  e.preventDefault();
  // console.log(`Form submitted!!`);
  const newMessage = document.querySelector("#user-message").value;
  // console.log(newMessage);
  nsSocket.emit("newMessageToServer", { text: newMessage });
  document.getElementById("user-message").value = "";
};

const createHTML = (msg) => {
  const htmlTemplate = `
  <li>
    <div class="user-image">
      <img src="${msg.avatar}" />
    </div>
    <div class="user-message">
      <div class="user-name-time">${msg.username} <span>${msg.time}</span></div>
      <div class="message-text">${msg.text}</div>
    </div>
  </li>
  `;
  return htmlTemplate;
};
