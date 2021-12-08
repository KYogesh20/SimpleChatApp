const joinRoom = (roomName) => {
  // send this roomName to the server!!!
  // Here we've used the optional parameter of ack in emit to update our numbers of users in this
  // The last arg below in .emit ie `(newNumbersOfMembers) =>{}` is ack optional callback which will be sent by server and we will grab it here for the purpose to inc the count of users in perticular channel because the namespaces.allSockets() is the method from which you can get the numbers of users connected to the
  nsSocket.emit("joinRoom", roomName, (newNumbersOfMembers) => {
    // document.querySelector(
    //   ".curr-room-num-users"
    // ).innerHTML = `${newNumbersOfMembers} <span class="glyphicon glyphicon-user"></span>`;
    // console.log(newNumbersOfMembers);
    // console.dir(newNumbersOfMembers);
  });
  nsSocket.on("chatHistory", (history) => {
    const messageUl = document.querySelector("#messages");
    messageUl.innerHTML = "";
    history.forEach((msg) => {
      const newMsg = createHTML(msg); // createHTML fun from joinNs.js file will first generate a predefined message template
      // const currMessage = messageUl.innerHTML; // This will grab the messages that were updated in the dom
      messageUl.innerHTML += newMsg;
    });
    // As you add more message it will still start displaying from the first message only but we want to see recent message only which is at the bottom.
    // So for that we have scrollTo function which will automatically scroll to bottom or we can see will focus on bottom side dom rather focusing on starting messages
    messageUl.scrollTo(0, messageUl.scrollHeight);
    // The scrollTo() method scrolls the document to the specified coordinates. Tip: Use the scrollBy() method to scroll a specified distance multiple times.
    // The scrollHeight property returns the entire height of an element in pixels, including padding, but not the border, scrollbar or margin. Tip: Use the scrollWidth property to return the entire width of an element.
  });
  nsSocket.on("updateMembers", (members) => {
    console.log(`currently active members ${members}`);
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${members} <i class="bi bi-person"></i>1`;
    document.querySelector(".curr-room-text").innerText = `${roomName}`;
  });
  const searchBox = document.querySelector("#search-box");
  searchBox.addEventListener("input", (e) => {
    // console.log(e.target.value);
    const message = Array.from(document.getElementsByClassName("message-text"));
    const messageArea = document.getElementById("messages");
    message.forEach((msg) => {
      if (
        msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1
      ) {
        // the msg does not contain the user search term!
        msg.style.display = "none";
      } else msg.style.display = "block";
    });
  });
};
