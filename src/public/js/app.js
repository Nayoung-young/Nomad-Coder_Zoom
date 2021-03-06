const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName; 

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function hanldeMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`); 
    });
    input.value = "";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;

    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", hanldeMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit(
        "enter_room", input.value, 
        showRoom
    );
    roomName = input.value;
    input.value= "";

}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    addMessage(`${user} someone joined!`);
});

socket.on("bye", (left, newCount) => {
    addMessage(`${left} someone left`);
})

socket.on("new_message", addMessage); // 메시지를 받아서 보여줌 
// socket.on("new_message", (msg) => {addMessage(msg)});

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return
    }
    
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room; 
        roomList.append(li);
    })
});