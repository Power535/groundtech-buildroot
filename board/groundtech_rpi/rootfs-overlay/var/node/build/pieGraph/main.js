var wsUrl = "ws:/localhost:8080/";
var webSocket;
var DOMvalue = document.getElementById("value")
function init() {
  webSocket = new WebSocket(wsUrl);
  webSocket.onopen = function (evt) {
    webSocket.send("Q")
  };
  webSocket.onclose = function (evt) {
    onClose(event)
  };
  webSocket.onmessage = function (evt) {
    onMessage(event)
  };
  webSocket.onerror = function (evt) {
    onError(event)
  };
}
window.addEventListener("load", init, false);

function onMessage(event) {
  pie.geometry.colorsNeedUpdate = true;
  pie.geometry.elementsNeedUpdate = true;

  if(JSON.parse(event.data).type === "sensor"){
    DOMvalue.innerHTML = (JSON.parse(event.data).payload)
    if(JSON.parse(event.data).payload > 220){
      titre()
    }
    calculateSlices(parseInt(JSON.parse(event.data).payload/25+1));
  }
  
  
}

function titre(){
  WebSocket.send("vib")

}


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



const colors = [
  "#039800",
  "#3fba00",
  "#76d900",
  "#b8eb00",
  "#fffe00",
  "#ffe100",
  "#ffd300",
  "#ffc400",
  "#ff8600",
  "#ff4600",
  "#ff0000"
]

var gridGeo = new THREE.CircleGeometry(5.5, 20, 0, Math.PI);
var material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
var cube = new THREE.Mesh(gridGeo, material);
scene.add(cube);


var geometry = new THREE.CircleGeometry(5.5, 20, 0, Math.PI);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
var pie = new THREE.Mesh(geometry, material);
pie.position.z = -0.01;

geometry.thetaLength = 

scene.add(pie);

function fullColor(){
  for (var i = 0; i < 10; i++) {
    pie.geometry.faces[i].vertexColors[0] = new THREE.Color(colors[i])
    pie.geometry.faces[i].vertexColors[1] = new THREE.Color(colors[i + 1])
    pie.geometry.faces[i].vertexColors[2] = new THREE.Color(colors[i])
  }
  
  //SOL
  for (var i = 19; i > 9; i--) {
    pie.geometry.faces[i].vertexColors[0] = new THREE.Color(colors[20 - i])
    pie.geometry.faces[i].vertexColors[1] = new THREE.Color(colors[19 - i])
    pie.geometry.faces[i].vertexColors[2] = new THREE.Color(colors[19 - i])
  }
}





setInterval(() => {
  webSocket.send('Q')
}, 160);

camera.position.z = 7;
cube.position.y = -2;
pie.position.y = -2;


function animate() {

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function calculateSlices(val) {
  fullColor()
  x = 10 - val
  for (var a = 0; a < x; a++) {

    pie.geometry.faces[9 - a].vertexColors[0] = new THREE.Color("black")
    pie.geometry.faces[9 - a].vertexColors[1] = new THREE.Color("black")
    pie.geometry.faces[9 - a].vertexColors[2] = new THREE.Color("black")

    pie.geometry.faces[10 + a].vertexColors[0] = new THREE.Color("black")
    pie.geometry.faces[10 + a].vertexColors[1] = new THREE.Color("black")
    pie.geometry.faces[10 + a].vertexColors[2] = new THREE.Color("black")
  }

}