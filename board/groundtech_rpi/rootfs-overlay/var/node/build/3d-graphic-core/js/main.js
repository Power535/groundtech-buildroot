var url = window.location.href.split('#')
const filename = url[1]
const background = url[2]
const language = url[3]

console.log("filename: ", filename)
console.log("theme: ", background)
console.log("language: ", language)

document.getElementById("question").innerText = languages[language]["save"]
document.getElementById("yes").innerText = languages[language]["yes"]
document.getElementById("no").innerText = languages[language]["no"]

document.getElementById("body").classList.add(background)
switch (background) {
  case "white":
    document.getElementById("body").classList.add(background)
    document.getElementsByClassName("density")[0].style.color = "#000000"
    break
  case "black":
    document.getElementById("body").classList.add(background)
    document.getElementsByClassName("density")[0].style.color = "#ffffff"
    break
  case "gray":
    document.getElementById("body").classList.add(background)
    document.getElementsByClassName("density")[0].style.color = "#ffffff"
    break
}




var material = null
let navigationModes = ["rotation", "pan", "detail", "depth"];
let navigationMode = "rotation"
var i = 0
var wsUrl = "ws:/localhost:8080/";
var webSocket;
var selectedPlane;
var selectedPlaneCoordinates = [0, 0]
var grid_en = 0
var grid_boy = 0
let en = 0
let boy = 0
let cameraDefault;
var setcam = false;
var curx = 0;
var cury = 0;
var dataMatrix = []
var max = 0;
var min = 0;
var raw_min = 0;
var raw_max = 0;
var average = 0;
let bgToggle = true
var cameraToggle = false;
var gridplane;
var yesNo = false;
var showPopup = false;
var plane;
var depth_plane;
var box;
var depth_upper_limit;
var is_depth_upper_limit_calculated = false;
var absolute_average;
var depth_box;
var DOM_notifier = document.getElementById("notifier")
var modeNames = [languages[language]["3d_rotation"], languages[language]["3d_pan"], languages[language]["scan_detail"], languages[language]["depth_view"]]
DOM_notifier.style.display = "none"
var zoomRatio;
var cameraDefPosition = {position: null, rotation: null, zoom: null}
var setcam_rot = true
var startAnimationFinished = false

var dirtIndex = 0
var dirtTypes = [
  {
    name: languages[language]["neutral"],
    factor: 25.00
  },
  {
    name: languages[language]["concrete"],
    factor: 2.00
  },
  {
    name: languages[language]["silt"],
    factor: 5.00
  },
  {
    name: languages[language]["sandy"],
    factor: 3.00
  },
  {
    name: languages[language]["clay"],
    factor: 4.00
  },
  {
    name: languages[language]["low_mineral"],
    factor: 4.00
  },
  {
    name: languages[language]["high_mineral"],
    factor: 1.00
  },
  {
    name: languages[language]["stony"],
    factor: 5.00
  },
  {
    name: languages[language]["fresh_water"],
    factor: 10.00
  },
  {
    name: languages[language]["salty_water"],
    factor: 15.00
  },
  {
    name: languages[language]["snow"],
    factor: 8.00
  },
  {
    name: languages[language]["frosty_dirt"],
    factor: 6.50
  },
  {
    name: languages[language]["coal"],
    factor: 2.50
  },
  {
    name: languages[language]["granite"],
    factor: 6.00
  },
  {
    name: languages[language]["salt"],
    factor: 7.50
  },

]

function calculateDepth(point, max, min, average, dirtType) {
  if (isNaN(Math.abs(parseInt(point) - Math.floor(average)) / (max - min) * dirtType.factor)) {
    return 0
  } else {
    return Math.abs(parseInt(point) - Math.floor(average)) / (max - min) * dirtType.factor
  }
}

function init() {
  webSocket = new WebSocket(wsUrl);
  webSocket.onopen = function (evt) {
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

function onMessage(event) {
  if (JSON.parse(event.data).payload === "back") {
    if (localStorage.getItem("lastFileDelete") === "true") {
      saveData()
      //console.log("save")
    } else {
      //console.log("--backfrom3dcore")
      window.parent.postMessage(
        {
          event_id: 'my_cors_message',
          data: "exittomenufile"
        }, "*"
      );
    }
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


  if (JSON.parse(event.data).payload === "ok") {
    gridplane.visible = !gridplane.visible;
    // console.log(gridplane.visible)
    if (showPopup) {
      if (yesNo) {
        localStorage.setItem("lastFileDelete", "false")
        window.parent.postMessage(
          {
            event_id: 'my_cors_message',
            data: "exittomenu"
          }, "*"
        );

      } else {
        console.log("NO DEDİ")
        localStorage.setItem("lastFileDelete", "false")
        fetch('http://localhost:8080/delete?filename=' + filename)
          .then(function (response) {
            window.parent.postMessage(
              {
                event_id: 'my_cors_message',
                data: "exittomenu"
              }, "*"
            );
          })
      }

    }

    if (i == 2) {
      i = 3
    } else if (i == 3) {
      i = 2
    }
  }


  if (JSON.parse(event.data).payload === "start") {
    material.wireframe = !material.wireframe
  }


  if (JSON.parse(event.data).payload === "movement") {
    DOM_notifier.style.display = "flex"
    i++; if (i == 4) { i = 0 }
    DOM_notifier.innerHTML = modeNames[i]
    DOM_notifier.classList.remove("run-animation");
    DOM_notifier.offsetWidth;
    DOM_notifier.classList.add("run-animation");
  }

  if (navigationModes[i] == "rotation") {

    box.visible = false;
    // gridplane.visible = false;
    depth_box.visible = false;
    depth_plane.visible = false;
    selectedPlane.visible = false;

    // console.log(camera.rotation)
    document.getElementById("detail").style.display = "none"
    rotateOrbit(camera, JSON.parse(event.data).payload)
    document.querySelector(".td-icon").src = "rotate.svg";
  }
  else if (navigationModes[i] == "pan") {
    box.visible = false;
    // gridplane.visible = false;
    selectedPlane.visible = false
    document.getElementById("detail").style.display = "none"
    document.querySelector(".td-icon").src = "pan.svg";
    panOrbit(camera, JSON.parse(event.data).payload)
  }
  else if (navigationModes[i] == "detail") {
    box.visible = false;
    document.getElementById("depth-dirt-level").style.display = "flex";
    document.getElementById("depth-value-level").style.display = "flex";
    gridplane.visible = true;
    selectedPlane.visible = true;
    depth_plane.visible = false;
    document.getElementById("detail").style.display = "flex"
    document.querySelector(".td-icon").src = "detail.svg";
    details(camera, JSON.parse(event.data).payload)
  }
  else if (navigationModes[i] == "depth") {
    gridplane.visible = false;
    depth_box.visible = true;
    box.visible = true;
    document.getElementById("depth-dirt-level").style.display = "none";
    document.getElementById("depth-value-level").style.display = "none";
    document.getElementById("depth").innerText = calculateDepth(dataMatrix[cury][curx], raw_max, raw_min, average, dirtTypes[dirtIndex]).toFixed(2) + " m"

    depth_plane.visible = true;
    selectedPlane.visible = false;
    document.getElementById("detail").style.display = "none"
    document.querySelector(".td-icon").src = "vertical_depth.svg";
    depth(camera, JSON.parse(event.data).payload)
    setcam_rot = true
  }

}



function depth(camera, direction) {
  document.getElementById("detail").style.display = "flex"
  document.getElementById("heatmap").style.display = "none"
  document.getElementById("density").style.display = "none"
  camera.position.x = 0
  camera.position.y = 0
  // camera.rotation.x = Math.PI / 3.6
  // camera.rotation.y = Math.PI / 1.2

  box.geometry.computeBoundingBox();
  //console.log(box.geometry.boundingBox.min.z)
  var zoomRatio = Math.sqrt(box.geometry.boundingBox.max.z)

  if (is_depth_upper_limit_calculated === false) {
    depth_upper_limit = box.geometry.boundingBox.max.z;
    depth_plane.position.z = depth_upper_limit;
    is_depth_upper_limit_calculated = true;
  }
  //console.log(zoomRatio)

  camera.zoom = 1.45 / zoomRatio
  camera.updateProjectionMatrix();
  let rotateAngle = Math.PI / 80
  if (setcam) {
    camera.position.x = 0
    camera.position.y = 0
    camera.updateProjectionMatrix();
    camera.rotation.x = Math.PI / 8;
    camera.rotation.y = - Math.PI / 8;
    setcam = false;
  }
  switch (direction) {
    case "up":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.x += rotateAngle
        }, 20 * i);
      }
      break
    case "down":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.x -= rotateAngle
        }, 20 * i);
      }
      break
    case "left":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.y += rotateAngle
        }, 20 * i);
      }
      break
    case "right":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.y -= rotateAngle
        }, 20 * i);
      }
      break
    case "zoomin":
      if (depth_plane.position.z < box.geometry.boundingBox.max.z) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            depth_plane.position.z += 0.46
            depth_box.update()
          }, 40 * i);
        }
      } else {
        depth_plane.position.z = box.geometry.boundingBox.max.z
      }
      break
    case "zoomout":
      if (depth_plane.position.z > box.geometry.boundingBox.min.z) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            depth_plane.position.z -= 0.46
            depth_box.update()
          }, 40 * i);
        }
      } else {
        depth_plane.position.z = box.geometry.boundingBox.min.z
      }
      break
  }
  depth_box.update()
  var fmax = raw_max - absolute_average;
  var fmin = absolute_average - raw_min;

  var depth_to_use = (fmax > fmin) ? raw_max : raw_min
  // console.log(box.geometry.boundingBox.max.z - box.geometry.boundingBox.min.z)
  // console.log(depth_plane.position.z)


  document.getElementById("dirtType").innerText = dirtTypes[dirtIndex].name
  document.getElementById("valuelevel").innerText = parseInt(dataMatrix[cury][curx])
  document.getElementById("depth").innerText = (calculateDepth((depth_to_use), raw_max, raw_min, average, dirtTypes[dirtIndex]) * ((box.geometry.boundingBox.max.z - depth_plane.position.z) / (box.geometry.boundingBox.max.z - box.geometry.boundingBox.min.z))).toFixed(2) + " m"
}





function rotateOrbit(camera, direction) {

  // scene.remove(box);
  box.update()
  document.getElementById("heatmap").style.display = "flex"
  document.getElementById("density").style.display = "flex"
  // console.log(camera.zoom)
  if (setcam_rot && startAnimationFinished) {
    camera.position.x = 0
    camera.position.y = 0
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.zoom = 1
    camera.updateProjectionMatrix();
    setcam_rot = false
  }


  let rotateAngle = Math.PI / 80
  switch (direction) {
    case "left":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.y += rotateAngle
        }, 20 * i);
      }
      break
    case "right":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.y -= rotateAngle
        }, 20 * i);
      }
      break
    case "up":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.x += rotateAngle
        }, 20 * i);
      }
      break
    case "down":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          camera.rotation.x -= rotateAngle
        }, 20 * i);
      }
      break
    case "zoomin":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (camera.zoom < 9) {
            camera.zoom += 0.05;
            camera.updateProjectionMatrix();
          }
        }, 15 * i);
      }
      break
    case "zoomout":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (camera.zoom > 0.4) {
            camera.zoom -= 0.05;
            camera.updateProjectionMatrix();
          }
        }, 15 * i);
      }
      break
  }
}

function panOrbit(camera, direction) {

  document.getElementById("heatmap").style.display = "flex"
  document.getElementById("density").style.display = "flex"
  if (setcam) {
    camera.position.x = 0
    camera.position.y = 0
    camera.zoom = 1
    camera.updateProjectionMatrix();
    setcam = false;
  }
  let jumpSize = 0.8
  switch (direction) {
    case "left":
      if (camera.zoom > 1.2) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            camera.position.x -= jumpSize
          }, 40 * i);
        }
      }
      break
    case "right":
      if (camera.zoom > 1.2) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            camera.position.x += jumpSize
          }, 40 * i);
        }
      }
      break
    case "up":
      if (camera.zoom > 1.2) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            camera.position.y += jumpSize
          }, 40 * i);
        }
      }
      break
    case "down":
      if (camera.zoom > 1.2) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            camera.position.y -= jumpSize
          }, 40 * i);
        }
      }
      break
    case "zoomin":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (camera.zoom < 6) {
            camera.zoom += 0.05;
            camera.updateProjectionMatrix();
          }
        }, 15 * i);
      }
      break
    case "zoomout":
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (camera.zoom > 1) {
            camera.zoom -= 0.05;
            camera.updateProjectionMatrix();
          }
        }, 15 * i);
      }
      break
  }
}

function details(camera, direction) {

  camera.zoom = (en > boy) ? en / 15 : boy / 15
  setcam = true;
  camera.rotation.x = 0;
  camera.rotation.y = 0;
  camera.updateProjectionMatrix();
  let jumpSize = 4;
  switch (direction) {
    case "left":
      // console.log(selectedPlane.position.x)
      // console.log(grid_en)
      if (selectedPlane.position.x > -(grid_en * 2) + 2) {
        selectedPlane.position.x -= jumpSize
        curx--;
      }
      break
    case "right":
      if (selectedPlane.position.x < +(grid_en * 2) - 2) {
        selectedPlane.position.x += jumpSize
        curx++;
      }
      break
    case "down":
      // console.log(selectedPlane.position.y)
      // console.log(grid_boy)
      if (selectedPlane.position.y > -(grid_boy * 2) + 2) {
        cury++
        selectedPlane.position.y -= jumpSize
      }
      break
    case "up":
      if (selectedPlane.position.y < +(grid_boy * 2) - 2) {
        cury--
        selectedPlane.position.y += jumpSize
      }
      break
    case "zoomin":
      // console.log("zoomin")
      if (dirtIndex == dirtTypes.length - 1) {
        dirtIndex == 0
      } else {
        dirtIndex++
      }
      break
    case "zoomout":
      // console.log("zoomout")
      if (dirtIndex == 0) {
        dirtIndex == 0
      } else {
        dirtIndex--
      }
      break
    // case "zoomin":
    //   for (let i = 0; i < 10; i++) {
    //     setTimeout(() => {
    //       if (camera.zoom < 9) {
    //         camera.zoom += 0.05;
    //         camera.updateProjectionMatrix();
    //       }
    //     }, 15 * i);
    //   }
    //   break
    // case "zoomout":
    //   for (let i = 0; i < 10; i++) {
    //     setTimeout(() => {
    //       if (camera.zoom > 1) {
    //         camera.zoom -= 0.05;
    //         camera.updateProjectionMatrix();
    //       }
    //     }, 15 * i);
    //   }
    //   break
  }
  document.getElementById("dirtType").innerText = dirtTypes[dirtIndex].name
  document.getElementById("valuelevel").innerText = parseInt(dataMatrix[cury][curx])
  document.getElementById("depth").innerText = calculateDepth(dataMatrix[cury][curx], raw_max, raw_min, average, dirtTypes[dirtIndex]).toFixed(2) + " m"

  camera.position.x = selectedPlane.position.x
  camera.position.y = selectedPlane.position.y
}



window.addEventListener("load", init, false);


var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var viewsize = 30
var aspect = window.innerWidth / window.innerHeight
camera = new THREE.OrthographicCamera(viewsize * aspect / - 2, viewsize * aspect / 2, viewsize / 2, viewsize / - 2, -100, 100);
var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = true;
renderer.setClearColor(0xffffff, 0)
document.body.appendChild(renderer.domElement);

var geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
material = new THREE.MeshBasicMaterial(
  {
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    wireframe: false

  });


material.transparent = true;
material.opacity = 1;



async function fetchData() {
    let res = await fetch('http://localhost:8080/scans/' + filename)
    let text = await res.text()
    let data = text.split('\n').slice(5).map(line => {
      return line.trim().split(' ')
    })
    if(data[0].length == 1){
      data.map((e,key) =>{
        e.push(e)
      })
      return data
    }else{
      return data
    }
}

fetchData()
  .then(data => {
    en = data[0].length
    boy = data.length
    grid_en = en;
    grid_boy = boy;
    const dataArray = []
    data.map((element) => {
      element.map((sv) => {
        dataArray.push(parseInt(sv))
      })
    })

    dataMatrix = data;
    const total = dataArray.reduce((a, b) => a + b, 0)
    average = total / (en * boy)

    const positiveDatas = []

    // console.log(dataArray)
    raw_min = Math.min.apply(null, dataArray)
    raw_max = Math.max.apply(null, dataArray)


    //console.log("ortalama: " + average + " min: " + raw_min + " max: " + raw_max)

    document.getElementById("dirtlevel").innerText = Math.floor(average)
    absolute_average = average
    // COLOR DENSITY CALCULATION

    let colorDensity = calculateColorDensity(dataArray, raw_max, raw_min, average)

    let domElements = document.querySelectorAll(".value")
    domElements.forEach((a, i) => {
      a.innerHTML = colorDensity[4 - i]
    })

    // BURADA PİS İŞLER VAR, SONRA TEKRAR BAK.
    dataArray.forEach((element, i) => {
      dataArray[i] = element - average
      positiveDatas.push((element - average))
    });

    // console.log(Math.min.apply(null, positiveDatas))

    maxPositive = Math.max.apply(null, dataArray.map(e => Math.abs(e)))// Math.max.apply(null, positiveDatas)
    maxNegative = Math.max.apply(null, positiveDatas)



    // console.log(maxNegative, maxPositive)

    const protection = raw_max - raw_min
    const isProtection = protection < 6
    // console.log("protection limit", protection, isProtection)
    if (isProtection) {
      multply = 40
    } else {
      multply = 227
    }

    dataArray.forEach((element, index) => {
      // if (element > 0) {
      dataArray[index] = (element / maxPositive) * multply
      // }
      // if (element < 0) {
      //   dataArray[index] = (element / -max) * -multply
      // }
    })

    let values = [], i, k;
    for (i = 0, k = -1; i < dataArray.length; i++) {
      if (i % en === 0) {
        k++;
        values[k] = [];
      }
      values[k].push((dataArray[i]));
    }


    //INTERPOLATION
    values = interpolate(values, 3)
    // console.log(values)
    viewsize = (en > boy) ? en * 5 : boy * 5
    camera = new THREE.OrthographicCamera(viewsize * aspect / - 2, viewsize * aspect / 2, viewsize / 2, viewsize / - 2, -100, 100);

    en = values[0].length
    boy = values.length


    // ---------------------------------------------

    var geometry = new THREE.PlaneGeometry(en - 1, boy - 1, en - 1, boy - 1);
    plane = new THREE.Mesh(geometry, material);


    // A B C D
    // E F G H
    // v b n m
    //  Satırda sağa ilerleme
    //  1. frame: i = satır = 0
    //            a = sütun = 0
    //  0:  list[i][a]
    //  1:  list[i][a+1]
    //  2:  list[i+1][a]
    //  0: list[i+1][a]
    //  1: list[i+1][a+1]
    //  2: list[i][a+1]

    let sutun = 0
    for (i = 0; i < geometry.faces.length; i += 2) {
      satir = Math.trunc(i / ((en - 1) * 2))
      sutun = Math.trunc((i % ((en - 1) * 2)) / 2)

      // i. face
      let face = geometry.faces[i]
      face.vertexColors[0] = colorFromArray(values[satir][sutun])
      face.vertexColors[2] = colorFromArray(values[satir][sutun + 1])
      face.vertexColors[1] = colorFromArray(values[satir + 1][sutun])
      // i+1 face
      face = geometry.faces[i + 1]
      face.vertexColors[0] = colorFromArray(values[satir + 1][sutun])
      face.vertexColors[1] = colorFromArray(values[satir + 1][sutun + 1])
      face.vertexColors[2] = colorFromArray(values[(satir)][sutun + 1])
    }

    let flatvalues = []
    // console.log(values)
    values.forEach((element) => {
      element.forEach(fv => {
        flatvalues.push(fv)
      })
    })

    // console.log(flatvalues)

    flatvalues.map((element, index) => {
      geometry.vertices[index].z = Math.abs((element) / 6) * -1
    });

    scene.add(plane); // 3d plot mesh

    // ------------------------------------
    en = en + 3
    boy = boy + 3
    var gridgeometry = new THREE.PlaneGeometry(en, boy, grid_en, grid_boy);

    if (background == "white") {
      var floorTexture = new THREE.ImageUtils.loadTexture('./square_transparent_black.png');
    } else {
      var floorTexture = new THREE.ImageUtils.loadTexture('./square_small.png');

    }
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(grid_en, grid_boy);
    var gridmaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide, transparent: true, wireframe: false });


    gridplane = new THREE.Mesh(gridgeometry, gridmaterial);
    gridplane.visible = false

    scene.add(gridplane);
    gridplane.position.z = 14

    // -----------------------------------
    // -------------------------------------
    // -----------------------------------
    // -------------------------------------
    // -----------------------------------
    // -------------------------------------


    var selectedGeometry = new THREE.PlaneGeometry(en / grid_en, boy / grid_boy, 1, 1);

    var floorTexture = new THREE.ImageUtils.loadTexture('./square_transparent_red.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var gridmaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide, transparent: true });


    selectedPlane = new THREE.Mesh(selectedGeometry, gridmaterial);

    scene.add(selectedPlane);
    selectedPlane.position.z = 14.1

    selectedPlane.position.x = gridgeometry.vertices[0].x + (en / grid_en) / 2
    selectedPlane.position.y = gridgeometry.vertices[0].y - (boy / grid_boy) / 2

    var depth_geometry = new THREE.PlaneGeometry(en, boy, 1, 1);
    if (background == "white") {

      var depth_material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    } else {
      var depth_material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    }

    depth_material.transparent = true
    depth_material.opacity = 0.7
    depth_plane = new THREE.Mesh(depth_geometry, depth_material);
    depth_plane.visible = false;


    if (background == "white") {
      depth_box = new THREE.BoxHelper(depth_plane, 0x000000);
    } else {
      depth_box = new THREE.BoxHelper(depth_plane, 0xffffff);
    }
    scene.add(depth_box);



    // console.log(depth_upper_limit)
    scene.add(depth_plane);


    // -----------------------------------
    // -------------------------------------
    // -----------------------------------
    // -------------------------------------
    // -----------------------------------
    // -------------------------------------
    // -----------------------------------



    // camera.rotation.y = 2
    camera.rotation.x = 1.3
    

    geometry.translate(0, 0, 10);

    if (background == "white") {
      box = new THREE.BoxHelper(plane, 0x000000);
    } else {
      box = new THREE.BoxHelper(plane, 0xffffff);
    }

    scene.add(box);
    box.visible = false;
    box.update()

    function animate() {
      requestAnimationFrame(animate);
      //  camera.rotation.y += Math.PI / 130;
      if (camera.rotation.x > 0 && !startAnimationFinished) {
        camera.rotation.x -= 0.05
        // camera.rotation.y -= 0.05
      } else if (!startAnimationFinished) {
        var dataUrl = renderer.domElement.toDataURL("image/png");
        cameraDefPosition.position = camera.position
        cameraDefPosition.rotation = camera.rotation
        cameraDefPosition.zoom = camera.zoom
        // console.log(cameraDefPosition)
        // console.log(dataUrl)
        fetch('http://192.168.2.1:8080/saveimage', {
          method: 'POST',
          body: JSON.stringify({
            name: filename,
            image: dataUrl
          }),
          headers: { "Content-Type": "application/json" }
        })
        startAnimationFinished = true
      }
      renderer.render(scene, camera);
    }
    animate();
  })



const colorFromArray = (val) => {
  if (val <= 0) {
    // Maviye
    return new THREE.Color(colours[Math.trunc(228 + val * (maxPositive < maxNegative ? maxPositive / maxNegative : 1))])
  }
  else {
    // Kırmızıya
    return new THREE.Color(colours[Math.trunc(228 + val * (maxPositive > maxNegative ? maxPositive / maxNegative : 1))])
  }
}

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


function calculateColorDensity(array, max, min, average) {
  dif_min = average - min
  dif_max = max - average

  var limits = []
  for (var i = 0; i < 4; i++) {
    limits.push(min + (dif_min / 4) * i)
  }
  for (var i = 0; i < 4; i++) {
    limits.push(average + (dif_max / 4) * i)
  }
  limits.push(max)
  var colorDensity = [0, 0, 0, 0, 0]

  array.forEach((element => {
    if (element >= limits[0] && element < limits[1]) {
      colorDensity[0]++
    }
    if (element > limits[1] && element <= limits[3]) {
      colorDensity[1]++
    }
    if (element > limits[3] && element <= limits[5]) {
      colorDensity[2]++
    }
    if (element > limits[5] && element <= limits[7]) {
      colorDensity[3]++
    }
    if (element > limits[7] && element <= limits[8]) {
      colorDensity[4]++
    }
  }))


  colorDensity.map((element, index) => {
    colorDensity[index] = ((element / array.length) * 100).toFixed(1)
  })

  return colorDensity

}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

colours = [
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,0,254)",
  "rgb(0,3,254)",
  "rgb(0,7,255)",
  "rgb(1,11,255)",
  "rgb(0,15,255)",
  "rgb(0,19,254)",
  "rgb(0,22,255)",
  "rgb(0,26,255)",
  "rgb(1,30,255)",
  "rgb(0,34,255)",
  "rgb(1,37,255)",
  "rgb(0,41,255)",
  "rgb(0,46,254)",
  "rgb(0,48,255)",
  "rgb(0,53,255)",
  "rgb(0,56,255)",
  "rgb(0,60,254)",
  "rgb(0,63,255)",
  "rgb(0,67,254)",
  "rgb(0,72,255)",
  "rgb(0,75,255)",
  "rgb(1,78,255)",
  "rgb(0,82,254)",
  "rgb(1,86,255)",
  "rgb(0,89,255)",
  "rgb(0,93,255)",
  "rgb(0,97,254)",
  "rgb(0,100,255)",
  "rgb(0,104,255)",
  "rgb(0,107,255)",
  "rgb(0,111,253)",
  "rgb(0,116,255)",
  "rgb(1,119,255)",
  "rgb(0,122,255)",
  "rgb(0,126,255)",
  "rgb(0,130,254)",
  "rgb(0,134,255)",
  "rgb(1,138,254)",
  "rgb(0,140,255)",
  "rgb(0,145,254)",
  "rgb(1,149,255)",
  "rgb(0,151,254)",
  "rgb(0,156,255)",
  "rgb(0,160,254)",
  "rgb(1,164,255)",
  "rgb(1,166,255)",
  "rgb(0,170,255)",
  "rgb(0,175,254)",
  "rgb(1,178,254)",
  "rgb(0,182,255)",
  "rgb(0,186,255)",
  "rgb(1,190,254)",
  "rgb(1,193,255)",
  "rgb(1,197,255)",
  "rgb(0,201,255)",
  "rgb(0,204,255)",
  "rgb(0,208,255)",
  "rgb(0,212,254)",
  "rgb(0,215,254)",
  "rgb(1,219,254)",
  "rgb(0,223,254)",
  "rgb(0,227,254)",
  "rgb(0,230,254)",
  "rgb(0,234,255)",
  "rgb(1,238,255)",
  "rgb(0,242,254)",
  "rgb(0,244,255)",
  "rgb(0,249,255)",
  "rgb(0,254,255)",
  "rgb(0,254,252)",
  "rgb(0,252,250)",
  "rgb(0,252,249)",
  "rgb(1,252,247)",
  "rgb(0,249,243)",
  "rgb(0,248,242)",
  "rgb(0,247,239)",
  "rgb(0,247,239)",
  "rgb(0,245,237)",
  "rgb(0,244,234)",
  "rgb(1,243,231)",
  "rgb(0,242,228)",
  "rgb(1,241,228)",
  "rgb(1,239,224)",
  "rgb(0,238,222)",
  "rgb(0,237,219)",
  "rgb(0,236,218)",
  "rgb(0,236,216)",
  "rgb(1,234,213)",
  "rgb(0,233,211)",
  "rgb(0,231,209)",
  "rgb(1,230,207)",
  "rgb(0,230,204)",
  "rgb(0,228,203)",
  "rgb(0,227,200)",
  "rgb(0,226,199)",
  "rgb(0,225,195)",
  "rgb(1,224,195)",
  "rgb(0,224,190)",
  "rgb(1,222,191)",
  "rgb(0,221,186)",
  "rgb(0,220,184)",
  "rgb(0,218,183)",
  "rgb(1,217,180)",
  "rgb(0,216,179)",
  "rgb(0,214,176)",
  "rgb(1,213,173)",
  "rgb(1,213,172)",
  "rgb(1,212,169)",
  "rgb(0,209,167)",
  "rgb(0,209,164)",
  "rgb(0,207,161)",
  "rgb(0,208,159)",
  "rgb(0,206,158)",
  "rgb(1,205,156)",
  "rgb(0,204,153)",
  "rgb(0,203,150)",
  "rgb(0,201,149)",
  "rgb(0,200,146)",
  "rgb(0,199,144)",
  "rgb(0,197,141)",
  "rgb(0,197,141)",
  "rgb(1,196,138)",
  "rgb(1,195,135)",
  "rgb(0,194,133)",
  "rgb(0,192,132)",
  "rgb(0,192,129)",
  "rgb(0,190,126)",
  "rgb(0,189,123)",
  "rgb(1,187,122)",
  "rgb(1,188,120)",
  "rgb(1,186,118)",
  "rgb(0,186,115)",
  "rgb(0,184,114)",
  "rgb(1,182,111)",
  "rgb(0,181,110)",
  "rgb(0,180,106)",
  "rgb(1,179,105)",
  "rgb(1,177,102)",
  "rgb(1,177,102)",
  "rgb(1,176,99)",
  "rgb(0,175,94)",
  "rgb(0,173,93)",
  "rgb(1,173,91)",
  "rgb(0,171,87)",
  "rgb(1,170,87)",
  "rgb(1,169,84)",
  "rgb(0,168,81)",
  "rgb(0,167,79)",
  "rgb(0,166,76)",
  "rgb(0,164,75)",
  "rgb(0,163,72)",
  "rgb(0,162,71)",
  "rgb(1,162,69)",
  "rgb(1,160,67)",
  "rgb(0,160,64)",
  "rgb(0,158,63)",
  "rgb(1,157,60)",
  "rgb(0,156,57)",
  "rgb(0,155,54)",
  "rgb(0,154,53)",
  "rgb(0,152,51)",
  "rgb(0,151,48)",
  "rgb(0,150,45)",
  "rgb(0,149,45)",
  "rgb(1,148,42)",
  "rgb(0,147,40)",
  "rgb(0,146,37)",
  "rgb(1,144,36)",
  "rgb(0,144,33)",
  "rgb(0,142,30)",
  "rgb(0,141,28)",
  "rgb(0,140,27)",
  "rgb(1,140,25)",
  "rgb(1,138,22)",
  "rgb(0,138,19)",
  "rgb(1,136,18)",
  "rgb(0,133,14)",
  "rgb(0,134,13)",
  "rgb(0,132,12)",
  "rgb(1,131,9)",
  "rgb(1,129,6)",
  "rgb(0,128,5)",
  "rgb(0,129,3)",
  "rgb(1,127,1)",
  "rgb(2,129,0)",
  "rgb(4,129,1)",
  "rgb(6,130,0)",
  "rgb(7,131,0)",
  "rgb(11,133,0)",
  "rgb(13,133,0)",
  "rgb(14,134,0)",
  "rgb(17,135,0)",
  "rgb(20,136,0)",
  "rgb(24,138,1)",
  "rgb(25,139,0)",
  "rgb(27,140,0)",
  "rgb(28,141,1)",
  "rgb(31,142,1)",
  "rgb(34,143,0)",
  "rgb(35,144,0)",
  "rgb(37,146,1)",
  "rgb(39,147,1)",
  "rgb(43,149,1)",
  "rgb(45,149,0)",
  "rgb(46,150,1)",
  "rgb(48,151,0)",
  "rgb(52,152,0)",
  "rgb(53,153,1)",
  "rgb(55,154,1)",
  "rgb(57,156,1)",
  "rgb(60,157,0)",
  "rgb(62,158,0)",
  "rgb(65,159,1)",
  "rgb(66,160,1)",
  "rgb(69,161,0)",
  "rgb(71,162,0)",
  "rgb(73,164,1)",
  "rgb(76,164,0)",
  "rgb(78,167,1)",
  "rgb(80,167,0)",
  "rgb(82,167,1)",
  "rgb(83,169,0)",
  "rgb(86,169,0)",
  "rgb(88,171,1)",
  "rgb(92,171,0)",
  "rgb(93,173,0)",
  "rgb(95,175,0)",
  "rgb(97,176,0)",
  "rgb(100,177,1)",
  "rgb(103,178,0)",
  "rgb(104,179,0)",
  "rgb(106,179,1)",
  "rgb(110,181,1)",
  "rgb(111,182,0)",
  "rgb(114,184,0)",
  "rgb(115,185,0)",
  "rgb(117,185,0)",
  "rgb(121,187,1)",
  "rgb(122,188,0)",
  "rgb(124,189,1)",
  "rgb(127,189,0)",
  "rgb(130,191,0)",
  "rgb(131,192,0)",
  "rgb(133,195,0)",
  "rgb(135,195,1)",
  "rgb(138,196,0)",
  "rgb(141,197,0)",
  "rgb(142,198,1)",
  "rgb(143,200,1)",
  "rgb(146,200,0)",
  "rgb(148,201,0)",
  "rgb(150,203,0)",
  "rgb(153,204,1)",
  "rgb(156,205,0)",
  "rgb(158,206,0)",
  "rgb(159,207,1)",
  "rgb(163,208,1)",
  "rgb(164,210,0)",
  "rgb(166,210,0)",
  "rgb(168,211,0)",
  "rgb(173,213,2)",
  "rgb(174,215,1)",
  "rgb(176,215,0)",
  "rgb(179,216,0)",
  "rgb(180,217,0)",
  "rgb(183,218,0)",
  "rgb(183,219,0)",
  "rgb(186,220,1)",
  "rgb(190,222,1)",
  "rgb(192,222,0)",
  "rgb(193,224,0)",
  "rgb(194,225,0)",
  "rgb(198,226,1)",
  "rgb(200,227,0)",
  "rgb(201,228,0)",
  "rgb(203,229,0)",
  "rgb(207,230,0)",
  "rgb(210,234,2)",
  "rgb(211,233,0)",
  "rgb(214,233,1)",
  "rgb(217,235,1)",
  "rgb(218,236,0)",
  "rgb(220,237,0)",
  "rgb(221,238,0)",
  "rgb(224,239,0)",
  "rgb(228,241,1)",
  "rgb(229,243,0)",
  "rgb(232,243,1)",
  "rgb(234,244,0)",
  "rgb(237,245,1)",
  "rgb(238,247,0)",
  "rgb(238,247,0)",
  "rgb(242,248,0)",
  "rgb(244,249,0)",
  "rgb(248,250,1)",
  "rgb(250,252,1)",
  "rgb(252,253,1)",
  "rgb(253,254,2)",
  "rgb(255,253,0)",
  "rgb(255,250,1)",
  "rgb(255,245,0)",
  "rgb(254,242,0)",
  "rgb(255,238,0)",
  "rgb(255,235,0)",
  "rgb(254,230,0)",
  "rgb(255,228,1)",
  "rgb(255,223,0)",
  "rgb(255,219,1)",
  "rgb(255,216,1)",
  "rgb(255,212,1)",
  "rgb(255,207,0)",
  "rgb(255,204,0)",
  "rgb(254,201,1)",
  "rgb(255,197,1)",
  "rgb(255,193,0)",
  "rgb(255,190,0)",
  "rgb(255,185,1)",
  "rgb(255,182,0)",
  "rgb(255,178,0)",
  "rgb(255,175,0)",
  "rgb(255,171,0)",
  "rgb(254,167,0)",
  "rgb(255,163,0)",
  "rgb(254,160,0)",
  "rgb(255,156,0)",
  "rgb(255,152,1)",
  "rgb(255,149,1)",
  "rgb(255,145,1)",
  "rgb(255,141,0)",
  "rgb(255,137,1)",
  "rgb(255,134,1)",
  "rgb(255,130,1)",
  "rgb(255,126,0)",
  "rgb(255,123,0)",
  "rgb(255,119,1)",
  "rgb(255,115,0)",
  "rgb(255,112,0)",
  "rgb(255,109,0)",
  "rgb(255,104,1)",
  "rgb(255,100,0)",
  "rgb(255,97,0)",
  "rgb(255,93,0)",
  "rgb(255,90,1)",
  "rgb(255,86,1)",
  "rgb(254,82,0)",
  "rgb(255,78,0)",
  "rgb(255,75,0)",
  "rgb(255,71,0)",
  "rgb(255,68,1)",
  "rgb(255,63,0)",
  "rgb(254,59,1)",
  "rgb(255,56,1)",
  "rgb(255,52,1)",
  "rgb(254,48,0)",
  "rgb(255,45,0)",
  "rgb(254,41,1)",
  "rgb(255,37,1)",
  "rgb(254,34,0)",
  "rgb(255,30,0)",
  "rgb(255,26,2)",
  "rgb(255,23,1)",
  "rgb(255,20,1)",
  "rgb(255,15,0)",
  "rgb(255,11,0)",
  "rgb(255,8,0)",
  "rgb(255,4,1)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)",
  "rgb(254,0,0)"
]


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
  return croppedArray
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
