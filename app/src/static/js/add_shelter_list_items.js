const socket = io();
var shelters = [];

socket.on("shelters", (data) => {
  console.log("Received shelters:", data);
  var new_data = JSON.parse(data);
  shelters.push(new_data);
});



const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");


socket.on("shelters_ready", (data) => {
  shelters.forEach(shelter => {
    const clone = template.content.cloneNode(true);
  
    clone.querySelector(".name").textContent = shelter.name;
    clone.querySelector(".capacity").textContent = `Capacity: ${shelter.capacity}`;
    clone.querySelector(".map-link").href = shelter.map_link;
  
    container.appendChild(clone);
  });
});


