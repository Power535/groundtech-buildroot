var url = window.location.href.split('#')
const mode = url[1]
const _en = url[2]
const _boy = url[3]
const _duration = url[4]
const _pattern = url[5]
const _direction = url[6]
const _vibration = (url[7] === 'true')
const _mode = (mode == "auto") ? true : false;
const _language = url[8]
// console.log(_language)

document.getElementById("label_row").innerText = languages[_language]["row"]
document.getElementById("label_column").innerText = languages[_language]["column"]
document.getElementById("label_size").innerText = languages[_language]["size"]
document.getElementById("label_pattern").innerText = languages[_language]["type"]
document.getElementById("label_direction").innerText = languages[_language]["direction"]
document.getElementById("label_mode").innerText = languages[_language]["mode"]

// console.log(mode, _en, _boy, _duration, _pattern, _direction)



var dom_row = document.getElementById("row")
var dom_collum = document.getElementById("collum")
var dom_size = document.getElementById("size")
var dom_pattern = document.getElementById("pattern")
var dom_direction = document.getElementById("direction")
var dom_mode = document.getElementById("mode")
var dom_column_popup = document.getElementById("column-group")

dom_row.innerText = 1
dom_collum.innerText = 1

var column_popup_is_open = false;

var avgsave = 0;
var sesdom;

window.onload = function () {
  sesdom = document.getElementById("audio")
};

function playSound() {
  sesdom.play().catch(function (errror) {
    // console.log(errror)
  });
}



var sensorData = 0

var wsUrl = "ws:/localhost:8080/";
var webSocket;
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

var lastY = 0;
firstJumpOnRight = false;
function onMessage(event) {
  // console.log("dir", direction, "coll", y)
  if (lastY != y && _mode) {
    if(direction == "right" && !firstJumpOnRight){

      firstJumpOnRight = true
    }else{
      console.log("sütün değişti")
      if(_vibration){
        webSocket.send("vib")
      }
      resumeScan = !resumeScan;
      column_popup_is_open = true;
      dom_column_popup.style.display = "flex"
    }

  }
  lastY = y
  // console.log(event.data)
  if (JSON.parse(event.data).type == "button" && JSON.parse(event.data).payload == "back") {
    // console.log("BACK")
    if (!column_popup_is_open) {
      resumeScan = !resumeScan;
    }
    saveData()
  }

  if (JSON.parse(event.data).type == "button" && (JSON.parse(event.data).payload == "left" || JSON.parse(event.data).payload == "right")) {
    yesNo = !yesNo;
    if (yesNo) {
      document.getElementById("yes").classList.add("selected");
      document.getElementById("no").classList.remove("selected");
    } else {
      document.getElementById("no").classList.add("selected");
      document.getElementById("yes").classList.remove("selected");
    }
  }

  if (JSON.parse(event.data).type == "button" && JSON.parse(event.data).payload == "ok") {
    if (showPopup) {
      if (yesNo) {
        // console.log(arrayCropper(matrix, direction, y + 1, avgsave))
        localStorage.setItem("lastFileDelete", "true")
        webSocket.send("save" + JSON.stringify(arrayCropper(matrix, direction, y + 1, avgsave)))
        fetch('http://localhost:8080/filenames')
          .then(function (response) {
            return response.json();
          }).then(function (myJson) {
            // console.log(myJson[myJson.length - 1]);
            setTimeout(() => {
              window.location = "http://localhost:8080/3d-graphic-core/#" + myJson[myJson.length - 1] + "#white#" + _language 
            }, 500);
          });
        // window.parent.postMessage(
        //   {
        //     event_id: 'my_cors_message',
        //     data: "save"
        //   }, "*"
        // );

      } else {
        // POPUP AÇIK - NO dedi
        if(!column_popup_is_open){
          resumeScan = !resumeScan;
          saveData()
        }else{
          saveData()
        }




        // localStorage.setItem("lastFileDelete", JSON.stringify(arrayCropper(matrix, direction, y + 1, avgsave)))
        // window.parent.postMessage(
        //   {
        //     event_id: 'my_cors_message',
        //     data: "exittoscan"
        //   }, "*"
        // );
      }

    }

    else if (column_popup_is_open) {
      resumeScan = !resumeScan;
      column_popup_is_open = false;
      dom_column_popup.style.display = "none"
    }


  }


  // window.parent.postMessage(
  //   {
  //     event_id: 'my_cors_message',
  //     data: "selam"
  //   }
  // );

  // console.log("post")
  if (JSON.parse(event.data).type == "sensor") {
    sensorData = JSON.parse(event.data).payload
    // console.log(sensorData)

  }

  if (JSON.parse(event.data).payload == "start") {
    if (!isAutomatic) {
      if (!isNaN(sensorData)) {
        // console.log("manual")
        webSocket.send("Q")
        pushData(pattern, direction, Math.floor(sensorData))
        updateColor()
      }
    }
    if (column_popup_is_open) {
      resumeScan = !resumeScan;
      column_popup_is_open = false;
      dom_column_popup.style.display = "none"
    }

  }
  
}

window.addEventListener("load", init, false);



var colours = ["rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,0,254)", "rgb(0,3,254)", "rgb(0,7,255)", "rgb(1,11,255)", "rgb(0,15,255)", "rgb(0,19,254)", "rgb(0,22,255)", "rgb(0,26,255)", "rgb(1,30,255)", "rgb(0,34,255)", "rgb(1,37,255)", "rgb(0,41,255)", "rgb(0,46,254)", "rgb(0,48,255)", "rgb(0,53,255)", "rgb(0,56,255)", "rgb(0,60,254)", "rgb(0,63,255)", "rgb(0,67,254)", "rgb(0,72,255)", "rgb(0,75,255)", "rgb(1,78,255)", "rgb(0,82,254)", "rgb(1,86,255)", "rgb(0,89,255)", "rgb(0,93,255)", "rgb(0,97,254)", "rgb(0,100,255)", "rgb(0,104,255)", "rgb(0,107,255)", "rgb(0,111,253)", "rgb(0,116,255)", "rgb(1,119,255)", "rgb(0,122,255)", "rgb(0,126,255)", "rgb(0,130,254)", "rgb(0,134,255)", "rgb(1,138,254)", "rgb(0,140,255)", "rgb(0,145,254)", "rgb(1,149,255)", "rgb(0,151,254)", "rgb(0,156,255)", "rgb(0,160,254)", "rgb(1,164,255)", "rgb(1,166,255)", "rgb(0,170,255)", "rgb(0,175,254)", "rgb(1,178,254)", "rgb(0,182,255)", "rgb(0,186,255)", "rgb(1,190,254)", "rgb(1,193,255)", "rgb(1,197,255)", "rgb(0,201,255)", "rgb(0,204,255)", "rgb(0,208,255)", "rgb(0,212,254)", "rgb(0,215,254)", "rgb(1,219,254)", "rgb(0,223,254)", "rgb(0,227,254)", "rgb(0,230,254)", "rgb(0,234,255)", "rgb(1,238,255)", "rgb(0,242,254)", "rgb(0,244,255)", "rgb(0,249,255)", "rgb(0,254,255)", "rgb(0,254,252)", "rgb(0,252,250)", "rgb(0,252,249)", "rgb(1,252,247)", "rgb(0,249,243)", "rgb(0,248,242)", "rgb(0,247,239)", "rgb(0,247,239)", "rgb(0,245,237)", "rgb(0,244,234)", "rgb(1,243,231)", "rgb(0,242,228)", "rgb(1,241,228)", "rgb(1,239,224)", "rgb(0,238,222)", "rgb(0,237,219)", "rgb(0,236,218)", "rgb(0,236,216)", "rgb(1,234,213)", "rgb(0,233,211)", "rgb(0,231,209)", "rgb(1,230,207)", "rgb(0,230,204)", "rgb(0,228,203)", "rgb(0,227,200)", "rgb(0,226,199)", "rgb(0,225,195)", "rgb(1,224,195)", "rgb(0,224,190)", "rgb(1,222,191)", "rgb(0,221,186)", "rgb(0,220,184)", "rgb(0,218,183)", "rgb(1,217,180)", "rgb(0,216,179)", "rgb(0,214,176)", "rgb(1,213,173)", "rgb(1,213,172)", "rgb(1,212,169)", "rgb(0,209,167)", "rgb(0,209,164)", "rgb(0,207,161)", "rgb(0,208,159)", "rgb(0,206,158)", "rgb(1,205,156)", "rgb(0,204,153)", "rgb(0,203,150)", "rgb(0,201,149)", "rgb(0,200,146)", "rgb(0,199,144)", "rgb(0,197,141)", "rgb(0,197,141)", "rgb(1,196,138)", "rgb(1,195,135)", "rgb(0,194,133)", "rgb(0,192,132)", "rgb(0,192,129)", "rgb(0,190,126)", "rgb(0,189,123)", "rgb(1,187,122)", "rgb(1,188,120)", "rgb(1,186,118)", "rgb(0,186,115)", "rgb(0,184,114)", "rgb(1,182,111)", "rgb(0,181,110)", "rgb(0,180,106)", "rgb(1,179,105)", "rgb(1,177,102)", "rgb(1,177,102)", "rgb(1,176,99)", "rgb(0,175,94)", "rgb(0,173,93)", "rgb(1,173,91)", "rgb(0,171,87)", "rgb(1,170,87)", "rgb(1,169,84)", "rgb(0,168,81)", "rgb(0,167,79)", "rgb(0,166,76)", "rgb(0,164,75)", "rgb(0,163,72)", "rgb(0,162,71)", "rgb(1,162,69)", "rgb(1,160,67)", "rgb(0,160,64)", "rgb(0,158,63)", "rgb(1,157,60)", "rgb(0,156,57)", "rgb(0,155,54)", "rgb(0,154,53)", "rgb(0,152,51)", "rgb(0,151,48)", "rgb(0,150,45)", "rgb(0,149,45)", "rgb(1,148,42)", "rgb(0,147,40)", "rgb(0,146,37)", "rgb(1,144,36)", "rgb(0,144,33)", "rgb(0,142,30)", "rgb(0,141,28)", "rgb(0,140,27)", "rgb(1,140,25)", "rgb(1,138,22)", "rgb(0,138,19)", "rgb(1,136,18)", "rgb(0,133,14)", "rgb(0,134,13)", "rgb(0,132,12)", "rgb(1,131,9)", "rgb(1,129,6)", "rgb(0,128,5)", "rgb(0,129,3)", "rgb(1,127,1)", "rgb(2,129,0)", "rgb(4,129,1)", "rgb(6,130,0)", "rgb(7,131,0)", "rgb(11,133,0)", "rgb(13,133,0)", "rgb(14,134,0)", "rgb(17,135,0)", "rgb(20,136,0)", "rgb(24,138,1)", "rgb(25,139,0)", "rgb(27,140,0)", "rgb(28,141,1)", "rgb(31,142,1)", "rgb(34,143,0)", "rgb(35,144,0)", "rgb(37,146,1)", "rgb(39,147,1)", "rgb(43,149,1)", "rgb(45,149,0)", "rgb(46,150,1)", "rgb(48,151,0)", "rgb(52,152,0)", "rgb(53,153,1)", "rgb(55,154,1)", "rgb(57,156,1)", "rgb(60,157,0)", "rgb(62,158,0)", "rgb(65,159,1)", "rgb(66,160,1)", "rgb(69,161,0)", "rgb(71,162,0)", "rgb(73,164,1)", "rgb(76,164,0)", "rgb(78,167,1)", "rgb(80,167,0)", "rgb(82,167,1)", "rgb(83,169,0)", "rgb(86,169,0)", "rgb(88,171,1)", "rgb(92,171,0)", "rgb(93,173,0)", "rgb(95,175,0)", "rgb(97,176,0)", "rgb(100,177,1)", "rgb(103,178,0)", "rgb(104,179,0)", "rgb(106,179,1)", "rgb(110,181,1)", "rgb(111,182,0)", "rgb(114,184,0)", "rgb(115,185,0)", "rgb(117,185,0)", "rgb(121,187,1)", "rgb(122,188,0)", "rgb(124,189,1)", "rgb(127,189,0)", "rgb(130,191,0)", "rgb(131,192,0)", "rgb(133,195,0)", "rgb(135,195,1)", "rgb(138,196,0)", "rgb(141,197,0)", "rgb(142,198,1)", "rgb(143,200,1)", "rgb(146,200,0)", "rgb(148,201,0)", "rgb(150,203,0)", "rgb(153,204,1)", "rgb(156,205,0)", "rgb(158,206,0)", "rgb(159,207,1)", "rgb(163,208,1)", "rgb(164,210,0)", "rgb(166,210,0)", "rgb(168,211,0)", "rgb(173,213,2)", "rgb(174,215,1)", "rgb(176,215,0)", "rgb(179,216,0)", "rgb(180,217,0)", "rgb(183,218,0)", "rgb(183,219,0)", "rgb(186,220,1)", "rgb(190,222,1)", "rgb(192,222,0)", "rgb(193,224,0)", "rgb(194,225,0)", "rgb(198,226,1)", "rgb(200,227,0)", "rgb(201,228,0)", "rgb(203,229,0)", "rgb(207,230,0)", "rgb(210,234,2)", "rgb(211,233,0)", "rgb(214,233,1)", "rgb(217,235,1)", "rgb(218,236,0)", "rgb(220,237,0)", "rgb(221,238,0)", "rgb(224,239,0)", "rgb(228,241,1)", "rgb(229,243,0)", "rgb(232,243,1)", "rgb(234,244,0)", "rgb(237,245,1)", "rgb(238,247,0)", "rgb(238,247,0)", "rgb(242,248,0)", "rgb(244,249,0)", "rgb(248,250,1)", "rgb(250,252,1)", "rgb(252,253,1)", "rgb(253,254,2)", "rgb(255,253,0)", "rgb(255,250,1)", "rgb(255,245,0)", "rgb(254,242,0)", "rgb(255,238,0)", "rgb(255,235,0)", "rgb(254,230,0)", "rgb(255,228,1)", "rgb(255,223,0)", "rgb(255,219,1)", "rgb(255,216,1)", "rgb(255,212,1)", "rgb(255,207,0)", "rgb(255,204,0)", "rgb(254,201,1)", "rgb(255,197,1)", "rgb(255,193,0)", "rgb(255,190,0)", "rgb(255,185,1)", "rgb(255,182,0)", "rgb(255,178,0)", "rgb(255,175,0)", "rgb(255,171,0)", "rgb(254,167,0)", "rgb(255,163,0)", "rgb(254,160,0)", "rgb(255,156,0)", "rgb(255,152,1)", "rgb(255,149,1)", "rgb(255,145,1)", "rgb(255,141,0)", "rgb(255,137,1)", "rgb(255,134,1)", "rgb(255,130,1)", "rgb(255,126,0)", "rgb(255,123,0)", "rgb(255,119,1)", "rgb(255,115,0)", "rgb(255,112,0)", "rgb(255,109,0)", "rgb(255,104,1)", "rgb(255,100,0)", "rgb(255,97,0)", "rgb(255,93,0)", "rgb(255,90,1)", "rgb(255,86,1)", "rgb(254,82,0)", "rgb(255,78,0)", "rgb(255,75,0)", "rgb(255,71,0)", "rgb(255,68,1)", "rgb(255,63,0)", "rgb(254,59,1)", "rgb(255,56,1)", "rgb(255,52,1)", "rgb(254,48,0)", "rgb(255,45,0)", "rgb(254,41,1)", "rgb(255,37,1)", "rgb(254,34,0)", "rgb(255,30,0)", "rgb(255,26,2)", "rgb(255,23,1)", "rgb(255,20,1)", "rgb(255,15,0)", "rgb(255,11,0)", "rgb(255,8,0)", "rgb(255,4,1)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)", "rgb(254,0,0)"];
var matrix = [];
var flatMatrix = []
var isBegin = false
var x = 0
var y = 0
var en = _en
var boy = _boy
var isAutomatic = _mode;
var interpolation_factor = 1
var total = 0
var dataCount = 0
var max = 0
var min = 0
var difMatrix = []
var count = 0
var isFinished = false;
var interpolationTotal = 0
var running_total = 0;
var running_average = 0;
const pattern = _pattern
const direction = _direction
var duration = _duration
var protection = false;
var protectionFactor = 1;
var resumeScan = true;
var showPopup = false;
var yesNo = false;

dom_size.innerHTML = en + " x " + boy
dom_direction.innerHTML = direction
dom_pattern.innerHTML = pattern



var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.8 / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.autoClear = true;
renderer.setClearColor(0xffffff, 0)
renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
document.body.appendChild(renderer.domElement);



for (var i = 0; i < boy; i++) {
  matrix[i] = [];
  for (var j = 0; j < en; j++) {
    matrix[i][j] = 0;
  }
}

// console.log(matrix)

interpolatedMatrix = interpolate(matrix, interpolation_factor)

// console.log(interpolatedMatrix)


const grid_en = en / (en / (en - 1))
const grid_boy = boy / (boy / (boy - 1))
var intergeometry = new THREE.PlaneGeometry(grid_en, grid_boy, interpolatedMatrix[0].length - 1, interpolatedMatrix.length - 1);
var intermaterial = new THREE.MeshBasicMaterial({ wireframe: false, vertexColors: THREE.VertexColors });
var interplane = new THREE.Mesh(intergeometry, intermaterial);
interplane.position.z = +0.01
scene.add(interplane);


intergeometry.faces.forEach(element => {
  element.color.setRGB(255, 255, 255)
});


var geometry = new THREE.PlaneBufferGeometry(en, boy, 1, 1);
var floorTexture = new THREE.ImageUtils.loadTexture('./square_transparent.png');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(en, boy);
var material = new THREE.MeshBasicMaterial({ map: floorTexture, transparent: true });
var plane = new THREE.Mesh(geometry, material);
scene.add(plane);
plane.position.z = 0.03


var selectedgeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
var floorTexture = new THREE.ImageUtils.loadTexture('./square_transparent_red.png');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);
var selectedmaterial = new THREE.MeshBasicMaterial({ map: floorTexture, transparent: true });
var selectedplane = new THREE.Mesh(selectedgeometry, selectedmaterial);
selectedplane.position.z = 0.1
scene.add(selectedplane);

for (var i = 0; i < interpolatedMatrix.length; i++) {
  difMatrix[i] = [];
  for (var j = 0; j < interpolatedMatrix[0].length; j++) {
    difMatrix[i][j] = 0;
  }
}


function updateColor() {
  interpolatedMatrix = []
  dataCount++
  total = 0
  flatMatrix = []
  for (var i = 0; i < boy; i++) {
    for (var j = 0; j < en; j++) {
      total += matrix[i][j]
      if (matrix[i][j] != 0) {
        flatMatrix.push(matrix[i][j])
      }
    }
  }

  // var omax = Math.max.apply(null, flatMatrix)
  var omin = Math.min.apply(null, flatMatrix)
  var omax = Math.max.apply(null, flatMatrix)
  if (omax - omin < 6) {
    protection = true;
    protectionFactor = 0.3;
  } else {
    protection = false;
    protectionFactor = 1;
  }
  //console.log("omax:",omax, "omin", omin, "protection", protection)

  var difmax = max - running_average
  var difmin = min - running_average

  interpolatedMatrix = interpolate(matrix, interpolation_factor)

  var counti = 0;
  var interpolatedflatarray = []

  for (var i = 0; i < interpolatedMatrix.length; i++) {
    for (var j = 0; j < interpolatedMatrix[0].length; j++) {
      if (interpolatedMatrix[i][j] != 0) {
        interpolationTotal += interpolatedMatrix[i][j]
        interpolatedflatarray.push(interpolatedMatrix[i][j])
        counti++;
      }
    }
  }

  max = Math.max.apply(null, interpolatedflatarray)
  min = Math.min.apply(null, interpolatedflatarray)

  running_average = interpolationTotal / (counti)
  // console.log(running_average)
  // console.log(interpolatedMatrix)
  // console.log("interpolation total", interpolationTotal)
  interpolationTotal = 0;
  // console.log("interpolation average", running_average)

  for (var i = 0; i < interpolatedMatrix.length; i++) {
    for (var j = 0; j < interpolatedMatrix[0].length; j++) {
      if (interpolatedMatrix[i][j] != 0) {
        if (interpolatedMatrix[i][j] > running_average) {
          difMatrix[i][j] = -(((Math.abs(interpolatedMatrix[i][j] - running_average) + 0.1) / (max - running_average))) * 200
        } else {
          difMatrix[i][j] = (((Math.abs(running_average - interpolatedMatrix[i][j]) + 0.1) / Math.abs(running_average - omin))) * 200
        }
      }
    }
  }

  // console.log(difMatrix)
  d_en = difMatrix[0].length
  d_boy = difMatrix.length

  // console.log("en:", d_en, "boy:", d_boy)


  let sutun = 0
  for (i = 0; i < intergeometry.faces.length; i += 2) {
    satir = Math.trunc(i / ((d_en - 1) * 2))
    sutun = Math.trunc((i % ((d_en - 1) * 2)) / 2)




    let face = intergeometry.faces[i]

    let shift = 0;
    if (direction == "left") {
      shift = 1
    }

    // console.log("#################", difMatrix )
    if (difMatrix[satir][sutun + shift] == 0) {
      // console.log("siyah", satir, sutun, i)
      face.color.setRGB(255, 255, 255)
      face = intergeometry.faces[i + 1]
      face.color.setRGB(255, 255, 255)
    }
    else {


      if (difMatrix[satir][sutun] < 220) {
        face.vertexColors[0] = colorFromArray(difMatrix[satir][sutun] * protectionFactor, satir, sutun)
      }
      else {
        face.vertexColors[0] = colorFromArray(0)
      }

      if (difMatrix[satir][sutun + 1] < 220) {
        face.vertexColors[2] = colorFromArray(difMatrix[satir][sutun + 1] * protectionFactor, satir, sutun + 1)
      }
      else {
        face.vertexColors[2] = colorFromArray(0)
      }

      if (difMatrix[satir + 1][sutun] < 220) {
        face.vertexColors[1] = colorFromArray(difMatrix[satir + 1][sutun] * protectionFactor, satir + 1, sutun)
      } else {
        face.vertexColors[1] = colorFromArray(0)
      }


      face = intergeometry.faces[i + 1]

      if (difMatrix[satir + 1][sutun] < 220) {
        face.vertexColors[0] = colorFromArray(difMatrix[satir + 1][sutun] * protectionFactor, satir + 1, sutun)
      }
      else {
        face.vertexColors[0] = colorFromArray(0)
      }

      if (difMatrix[satir + 1][sutun + 1] < 220) {
        face.vertexColors[1] = colorFromArray(difMatrix[satir + 1][sutun + 1] * protectionFactor, satir + 1, sutun + 1)
      }
      else {
        face.vertexColors[1] = colorFromArray(0)
      }

      if (difMatrix[(satir)][sutun + 1] < 220) {
        face.vertexColors[2] = colorFromArray(difMatrix[(satir)][sutun + 1] * protectionFactor, satir, sutun + 1)
      }
      else {
        face.vertexColors[2] = colorFromArray(0)
      }
    }

  }

}



jumpsize = interpolatedMatrix.length - 1
function parallel(direction, sensorData) {
  if (isBegin == false && direction == "right") {
    isBegin = true
    x = matrix.length - 1
    y = matrix[0].length - 1
  }
  if (isBegin == false && direction == "left") {
    isBegin = true
    x = matrix.length - 1
    y = 0
  }

  if (direction == "right") {
    this.matrix[x][y] = sensorData
    x--
    if (x == -1) {
      y--
      x = matrix.length - 1
    }
    if (x == -1 && y == -1) {
      //finish
    }
  }
  else if (direction == "left") {
    this.matrix[x][y] = sensorData
    x--
    if (x == -1) {
      y++
      x = matrix.length - 1
    }
    if (x == -1 && y == -1) {
      //finish
    }
    dom_row.innerHTML = boy - x
    dom_collum.innerHTML = y + 1
  }
}

var rotate = true
function zigzag(direction, sensorData) {
  if (isBegin == false && direction == "right") {
    isBegin = true
    x = matrix.length - 1
    y = matrix[0].length - 1
  }
  if (isBegin == false && direction == "left") {
    isBegin = true
    x = matrix.length - 1
    y = 0
  }
  if (direction == "right") {
    this.matrix[x][y] = sensorData;
    if (rotate) {
      x--
    } else {
      x++
    }
    if (x == -1) {
      y--
      x++
      rotate = !rotate
    }
    if (x == matrix.length) {
      y--
      x--
      rotate = !rotate
    }
    if (x == -1 && y == -1) {
      //finish
    }
    dom_row.innerHTML = en - x
    dom_collum.innerHTML = boy - y
  }
  else if (direction == "left") {
    this.matrix[x][y] = sensorData;
    if (rotate) {
      x--
    } else {
      x++
    }
    if (x == -1) {
      y++
      x++
      rotate = !rotate
    }
    if (x == matrix.length) {
      y++
      x--
      rotate = !rotate
    }
    if (x == -1 && y == -1) {
      //finish
    }
    dom_row.innerHTML = boy - x
    dom_collum.innerHTML = y + 1
    console.log(boy, x )
  }
}

if (direction == "left") {
  selectedplane.position.x = -en / 2 + 0.5
  selectedplane.position.y = -boy / 2 + 0.5
  camera.position.x = -en / 2 + 0.5
  camera.position.y = -boy / 2 + 0.5
}
if (direction == "right") {
  selectedplane.position.x = en / 2 - 0.5
  selectedplane.position.y = -boy / 2 + 0.5
  camera.position.x = +en / 2.05
  camera.position.y = -boy / 2 + 0.5
}


function pushData(pattern, direction, sensorData) {
  this.playSound()
  count++
  running_total += sensorData;
  running_average = running_total / count
  avgsave = running_average
  // console.log(avgsave)


  switch (pattern) {
    case "zigzag":
      zigzag(direction, sensorData)
      break
    case "parallel":
      parallel(direction, sensorData)
      break
  }
  // console.log("Current Coordinates: " + x + " " + y)
  selectedplane.position.x = +y - en / 2 + 0.5
  selectedplane.position.y = -x + boy / 2 - 0.5

}


window.onkeydown = function (e) {
  var key = e.keyCode ? e.keyCode : e.which;
  if (key == 97) {
    pushData(pattern, direction, 100.4)
    updateColor()
  } else if (key == 98) {
    pushData(pattern, direction, 120.3)
    updateColor()
  } else if (key == 99) {
    pushData(pattern, direction, 140.234)
    updateColor()
  } else if (key == 100) {
    pushData(pattern, direction, 150.34)
    updateColor()
  } else if (key == 101) {
    pushData(pattern, direction, 160.23)
    updateColor()
  }
}


var automatic = function () {
  if (resumeScan) {
    if (!isFinished) {
      webSocket.send("Q")
      if (count < en * boy) {
        if (!isNaN(sensorData)) {

          pushData(pattern, direction, Math.floor(sensorData))
        }
        updateColor()
      } else {
        clearInterval(automatic);
      }
    }
  }
}

setTimeout(() => {
  if (isAutomatic) {
    setInterval(automatic, duration);
  }
}, 1500);

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

camera.position.z = 4;
camera.rotation.x = Math.PI / 16




function animate() {
  intergeometry.colorsNeedUpdate = true;
  intergeometry.elementsNeedUpdate = true

  if (count > en * boy - 1) {
    camera.position.y = lerp(camera.position.y, 0, 1)
    camera.position.x = lerp(camera.position.x, 0, 1)
    camera.position.z = (en > boy) ? en - 3 : boy - 3;
    if (isFinished == false) {
      isFinished = true
      clearInterval(automatic);
      // console.log("BİTTİ BİTTİ BİTTİ BİTTİ BİTTİ BİTTİ ")
      saveData();
      // webSocket.send("save" + JSON.stringify(matrix))
      fetch('http://localhost:8080/filenames')
        .then(function (response) {
          return response.json();
        }).then(function (myJson) {
          // console.log(myJson[myJson.length - 1]);
          setTimeout(() => {
            // window.location = "http://localhost:8080/3d-graphic-core/#" + myJson[myJson.length-1]
          }, 100);
        });

    }

    if (camera.rotation.x > 0) {
      camera.rotation.x -= 0.005
    }

  } else {
    camera.position.y = lerp(camera.position.y, selectedplane.position.y, 0.5)
    camera.position.x = lerp(camera.position.x, selectedplane.position.x, 0.5)
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();



function interpolate(data, factor) {
  var level = factor
  var i_row = []
  var interpolated_array = []
  var interpolated_rows = []
  //2D iterpolation for x axis
  for (var k = 0; k < data.length; k++) {
    i_row.push(data[k][0])
    for (var i = 0; i < data[k].length - 1; i++) {
      var fark = data[k][i] - data[k][i + 1]
      for (var y = 0; y < level; y++) {
        i_row.push(parseInt(data[k][i] - (fark / (level + 1) * (y + 1))))
      }
      i_row.push(data[k][i + 1])
    }
    interpolated_array.push(i_row)
    i_row = []
  }
  //2D iterpolation for y axis
  for (var i = 0; i < interpolated_array.length - 1; i++) {
    for (var k = 0; k < level; k++) {
      for (var j = 0; j < interpolated_array[0].length; j++) {
        var fark = interpolated_array[i][j] - interpolated_array[i + 1][j]
        i_row.push(parseInt(interpolated_array[i][j] - (fark / (level + 1) * (k + 1))))
        if (interpolated_array[0].length - 1 == j) {
          interpolated_rows.push(i_row)
          var i_row = []
        }
      }
    }
    i_row = []
  }
  var result = []
  var j = 0
  for (let i = 0; i < interpolated_array.length - 1; i++) {
    result.push(interpolated_array[i])
    for (j; j < ((i + 1) * level); j++) {
      result.push(interpolated_rows[j])
    }
  }
  result.push(interpolated_array[interpolated_array.length - 1])
  return result
}

const colorFromArray = (val, satir = 0, sutun = 0) => {
  // console.log(`%c ${satir} ${sutun}`, "color: green; font-weigth: 600;")
  return new THREE.Color(colours[Math.trunc(228 - val)])
}

function saveData() {
  showPopup = !showPopup;
  setTimeout(() => {
    if (showPopup == true) {
      document.getElementById("save-group").style.display = "block"
    } else {
      document.getElementById("save-group").style.display = "none"
    }
    // console.log(matrix)
  }, 100);
}

function arrayCropper(array, dir, size, dirt) {
  var croppedArray = []
  if (dir == "right") {
    array.map((element) => {
      croppedArray.push(element.slice(size - 1, element.length))
    });
  }
  else if (dir == "left") {
    array.map((element) => {
      croppedArray.push(element.slice(0, size))
    });
  }

  croppedArray.forEach(element => {
    element.forEach((a, key) => {
      if (a == 0) {
        element[key] = Math.floor(dirt)
      }
    })
  });

  console.log(JSON.stringify(croppedArray))

  return croppedArray
}
