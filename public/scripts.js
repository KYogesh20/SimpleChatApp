// const socket = io("http://localhost:5000"); // the / namespace/endpoint
// io has a second optional parameter which is a object
const username = prompt("what is your username");
const socket = io("http://127.0.0.1:5000", {
  query: {
    username,
  },
}); // the / namespace/endpoint
let nsSocket; // declared the nsSocket here so that we can use it in joinRoom which is called in joinNs. As it was used in joinNs room with const we cant use it globally but by this we can have access of it in joinRoom

// listen for nsList, which is a list of all namespaces
socket.on("nsList", (nsData) => {
  let namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
  });

  // Add a clickListner for each NS
  Array.from(document.getElementsByClassName("namespace")).forEach((elem) => {
    // console.log(elem);
    elem.addEventListener("click", (e) => {
      const nsEndPoint = elem.getAttribute("ns");
      // console.log(`${nsEndPoint} I should go to now`);
      joinNs(nsEndPoint);
    });
  });
  // Moved the nsSocket and its listner from here to to new file joinNs.js
  joinNs("/wiki");
});

// socket.on("joined", (msg) => {
//   document.querySelector(
//     "#messages"
//   ).innerHTML += `<p style='color:green' class="success">${msg.text}</p>`;
// });

// socket.on("leave", (msg) => {
//   document.querySelector(
//     "#messages"
//   ).innerHTML += `<p style='color:red' class="danger">${msg.text}</p>`;
//   // console.log(msg.text);
// });

// Moved the 'a click eventlistener on message form and a welcome listene' from here to to new file joinNs.js
