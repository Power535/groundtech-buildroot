const path = require('path')
const http = require('http')
const express = require('express')
var bodyParser = require("body-parser");
const ws = require('ws')
const SerialPort = require('serialport')
const fs = require('fs');
const Gpio = require("onoff").Gpio;
const os = require('os');
const process = require("child_process");
const { spawn } = require('child_process');

const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 9600
})




const MANUAL_NAVIGATION = false
const scanFolder = '/var/node/scans/';
const res_scanFolder = '/var/node/res_scans/';
var file_names = []
var res_file_names = []
var newDate;



// HTTP Server
const app = express()
const server = http.createServer(app)
const SERVER_PORT = 8080

app.use('/', express.static(path.resolve(__dirname, 'build')))

app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});

app.use(express.static('/var/node/scans'))
app.use('/scans', express.static('/var/node/scans'))

app.use(express.static('/var/node/res_scans'))
app.use('/res_scans', express.static('/var/node/res_scans'))

app.use(express.static('/var/node/previews'))
app.use('/previews', express.static('/var/node/previews'))




app.get('/filenames', (req, res) => {
  file_names = []
  fs.readdirSync(scanFolder).forEach(file => {
    file_names.push(file)
  });
  res.send(file_names)
})

app.get('/res_filenames', (req, res) => {
  res_file_names = []
  fs.readdirSync(res_scanFolder).forEach(file => {
    res_file_names.push(file)
  });
  res.send(res_file_names)
})

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.post('/saveimage', function (req, res) {
  if (req.body.name) {
    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("/var/node/previews/" + req.body.name + '.png', base64Data, 'base64', function (err) {
      res.send("...ok...")
    });
  }
});


app.get('/delete', (req, res) => {
  console.log(req.query.filename + " deleted")
  
  process.exec("rm /var/node/scans/" + req.query.filename.replace(/\ /g, "\\ ").replace(/:/g, "\\:"))
  res.send("rm /var/node/scans/" + req.query.filename.replace(/\ /g, "\\ ").replace(/:/g, "\\:"))
})

app.get('/deleteall', (req, res) => {
  
  process.exec("rm /var/node/scans/*")
  res.send("rm /var/node/scans/*")
})

app.get('/res_delete', (req, res) => {
  console.log(req.query.filename + " deleted")
  
  process.exec("rm res_scans/" + req.query.filename.replace(/\ /g, "\\ ").replace(/:/g, "\\:"))
  res.send("rm res_scans/" + req.query.filename.replace(/\ /g, "\\ ").replace(/:/g, "\\:"))
})

app.get('/res_deleteall', (req, res) => {
  
  process.exec("rm res_scans/*")
  res.send("rm res_scans/*")
})




app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})

// Websockets Server
const wss = new ws.Server({ server })

const availableCommands = ['A', 'B', 'C', 'D', 'E', 'F', 'b', 'T', 'Y', 'Z', 'M', 'N', 'G', 'Q', 'J', 'P', '0', '1', '2', 'L']

let verify = false

const bn = new Gpio(18, 'in', 'both', { debounceTimeout: 20 })
const bl = new Gpio(23, 'in', 'both', { debounceTimeout: 20 })
const bb = new Gpio(24, 'in', 'both', { debounceTimeout: 20 })
const bd = new Gpio(25, 'in', 'both', { debounceTimeout: 20 })
const bm = new Gpio(12, 'in', 'both', { debounceTimeout: 20 })
const bs = new Gpio(16, 'in', 'both', { debounceTimeout: 20 })
const br = new Gpio(20, 'in', 'both', { debounceTimeout: 20 })
const bt = new Gpio(21, 'in', 'both', { debounceTimeout: 20 })
const bo = new Gpio(19, 'in', 'both', { debounceTimeout: 20 })
const bu = new Gpio(26, 'in', 'both', { debounceTimeout: 20 })

const motor = new Gpio(17, 'out');
let stopBlinking = false;

const blinkLed = () => {
  if (stopBlinking) {
    return led.unexport()
  }

}

blinkLed();
setTimeout(_ => stopBlinking = true, 2000);


var timer = 0

bn.watch((err, value) => {
  if (value === 1) {
    start("B.R")
  } else if (value === 0) {
    stop()
  }
})

bl.watch((err, value) => {

  if (value === 1) {
    start("B.D")

  } else if (value === 0) {
    stop()
  }
})

bb.watch((err, value) => {
  if (value === 1) {
    start("B.U")

  } else if (value === 0) {
    stop()
  }
})

bd.watch((err, value) => {
  if (value === 1) {
    start("B.L")

  } else if (value === 0) {
    stop()
4  }
})

bm.watch((err, value) => {
  if (value === 1) {
    start("B.O")

  } else if (value === 0) {
    stop()
  }
})

bs.watch((err, value) => {
  if (value === 1) {
    start("B.S")

  } else if (value === 0) {
    stop()
  }
})

br.watch((err, value) => {
  if (value === 1) {
    start("B.N")

  } else if (value === 0) {
    stop()
  }
})

bt.watch((err, value) => {
  if (value === 1) {
    start("B.M")

  } else if (value === 0) {
    stop()
  }
})

bo.watch((err, value) => {
  if (value === 1) {
    start("B.T")

  } else if (value === 0) {
    stop()
  }
})

bu.watch((err, value) => {
  if (value === 1) {
    start("B.B")

  } else if (value === 0) {
    stop()
  }
})





function start(command) {
  clearInterval(timer)
  console.log(command)
  sendToSocket(command)
  timer = setInterval(() => {
    sendToSocket(command)
  }, 210)

}

function stop() {
  clearInterval(timer)
}


//Soket String istiyor.
const sendToSocket = (data) => {
  // B.U
  // S.A.31
  // B:31
  let dataObj = {}
  let dataType = data.split('.')[0]
  let dataPayload = ''
  let send = false
  if (dataType === 'B') {
    dataPayload = data.split('.')[1]
    dataObj.type = 'button'
    switch (dataPayload) {
      case 'U':
        dataObj.payload = 'up'
        send = true
        break
      case 'D':
        dataObj.payload = 'down'
        send = true
        break
      case 'L':
        dataObj.payload = 'left'
        send = true
        break
      case 'R':
        dataObj.payload = 'right'
        send = true
        break
      case 'O':
        dataObj.payload = 'ok'
        send = true
        break
      case 'B':
        dataObj.payload = 'back'
        send = true
        break
      case 'S':
        dataObj.payload = 'start'
        send = true
        break
      case 'M':
        dataObj.payload = 'zoomin'
        send = true
        break
      case 'N':
        dataObj.payload = 'zoomout'
        send = true
        break
      case 'T':
        dataObj.payload = 'movement'
        send = true
        break
      case 'P':
        dataObj.payload = 'turnoff'
        send = true
        break
    }
  } else if (dataType === 'S') {
    let line = data.split('.')[1]

    if (verify === false) {
      setTimeout(() => {
        port.write(line)
      }, 150)
      verify = true
    } else {
      verify = false
      dataPayload = data.split('.')[2]
      console.log(dataPayload)
      if (line && dataPayload) {
        dataObj.type = 'scan'
        dataObj.line = line
        dataObj.payload = dataPayload
        if (dataPayload.match(/^\d+$/)) {
          send = true
        }
      }
    }
  }
  else if (dataType === 'L') {
    dataObj.type = "button"
    dataObj.payload = data.split('.')[1]
    send = true


  }


  else if (dataType === 'P') {
    dataObj.type = 'battery'
    dataPayload = data.split('.')[1]
    dataObj.payload = dataPayload
    send = true
  } else if (dataType === 'Q') {
    dataObj.type = 'sensor'
    dataPayload = data.split('.')[1]
    dataObj.payload = dataPayload
    send = true
  } else if (dataType === 'J') {
    if (data === "J.fail") {
      var success = false;
      data = "G.0#0#0#0#0#0"
    } else {
      var success = true;
    }
    dataObj.type = 'datetime'
    dataPayload =
      {
        success: success,
        hour: data.substring(2).split('#')[0],
        minute: data.substring(2).split('#')[1],
        second: data.substring(2).split('#')[2],
        day: data.substring(2).split('#')[3],
        month: data.substring(2).split('#')[4],
        year: data.substring(2).split('#')[5]
      }

    dataObj.payload = dataPayload

    send = true
    // command date -s "19 APR 2012 11:14:00"
    newDate = dataObj.payload.year + "-" + dataObj.payload.month + "-" + dataObj.payload.day + " " + dataObj.payload.hour + ":" + dataObj.payload.minute + ":" + dataObj.payload.second
    console.log(newDate)
    if (dataObj.payload.success) {
      
      process.exec("date -s '" + newDate + "'")
    }

  } else if (dataType === 'G') {
    if (data === "G.fail") {
      var success = false;
      data = "G.0#0"
    } else {
      var success = true;
    }
    dataObj.type = 'location'
    dataPayload =
      {
        success: success,
        lat: data.substring(2).split('#')[0],
        lon: data.substring(2).split('#')[1]
      }

    dataObj.payload = dataPayload
    send = true
  }


  if (send) {
    wss.clients.forEach(client => {
      client.send(JSON.stringify(dataObj))
    })
  }
}

wss.on('connection', (client) => {
  // Bağlanınca bunu diyoruz
  client.send('{ "connection" : "ok" }')

  // Mesaj gelince
  client.on('message', message => {
    if (MANUAL_NAVIGATION) {
      console.log("Uygulamadan geldi: " + message)
    }
    if (availableCommands.includes(message)) {
      port.write(message) //soketten geleni serial'a yolluyorum.
      if (message === 'T') {
        if (os.arch() !== 'x64') {
          
          process.exec('poweroff')
        } else {
          console.log('SHUTDOWN REQUEST!!!')
        }
      }
      else if (message === 'Y') {
        if (os.arch() !== 'x64') {
          
          process.exec('reboot')
        } else {
          console.log('REBOOT REQUEST!!!')
        }
      }
    }

    if (message.startsWith("save") === true) {
      console.log("Data has come to get saved.")
      console.log(message.substr(4))
      saveFile(JSON.parse(message.substr(4)), createFilename() + "_" + Date.now() / 1000)
    }

    if (message.startsWith("RES") === true) {
      console.log("Res data has come to get saved.")
      console.log(message.substr(3))
      res_saveFile((message.substr(3)), res_createFilename() + "_" + Date.now() / 1000)
    }

    if (message === "vib") {
      console.log("vibration started")
      motor.write(1)
      var motorTimeOut = setTimeout(_ => { motor.write(0); console.log("vibration ended") }, 100)

    }

    if (message === "status") {
      let statusObj = {}
      if (os.arch() !== 'x64') {
        process.exec('/var/node/status/status.sh', (err, stdout, stderr) => {
          fs.readFile('/var/node/status/out','utf8', function(err, data) {
            console.log(data)
            let temp = ['cpu', 'ram', 'hdd', 'temp']
            data.trim().split(' ').map((e, key) => {
            statusObj[temp[key]] = e;
          })
           client.send(JSON.stringify(statusObj))
          });
          // 3 56.8 5 48.3
        })
      } else {
        statusObj = {
          'cpu': 23,
          'ram': 54,
          'hdd': 50,
          'temp': 60
        }
       client.send(JSON.stringify(statusObj))
      }
      
    }


  })
})

let lastMessage = ''

port.on('data', data => {
  data = data.toString().trim()
  lastMessage = data
  setTimeout(() => {
    if (lastMessage !== data) {
      data = data + lastMessage
    }
    sendToSocket(data)
  }, 50)
})

// Web server
server.listen(SERVER_PORT, () => {
  if (MANUAL_NAVIGATION) {
    let stdin = process.stdin
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    stdin.on('data', key => {
      if (key === '\u001B\u005B\u0041') {
        // up
        sendToSocket('B.U')
      } else if (key === '\u001B\u005B\u0042') {
        // down
        sendToSocket('B.D')
      } else if (key === '\u007F') {
        // back
        sendToSocket('B.B')
      } else if (key === '\u000D') {
        // ok
        sendToSocket('B.O')
      } else if (key === '\u001B\u005B\u0044') {
        // left
        sendToSocket('B.L')
      } else if (key === '\u001B\u005B\u0043') {
        // right
        sendToSocket('B.R')
      } else if (key === '\u002B') {
        // zoom +
        sendToSocket('B.M')
      } else if (key === '\u002D') {
        // zoom - 
        sendToSocket('B.N')
      } else if (key === '\u002A') {
        // rotate or pan
        sendToSocket('B.T')
      } else if (key === '\u002F') {
        // rotate or pan
        sendToSocket('B.P')
      } else if (key === '\u0030') {
        // rotate or pan
        sendToSocket('B.S')
      } else if (key == '\u0003') {
        // ctrl + c
        process.exit()
      }
    })
  }
})


function saveFile(array, filename) {
  var scanstr = "DSAA\n"
  var max = 0;
  var min = 255;
  var en = array[0].length;
  var boy = array.length

  array.forEach(y => {
    y.forEach(x => {
      if (x > max) {
        max = x;
      }
      if (x < min) {
        min = x
      }
    })
  });

  scanstr += " " + en + " " + boy + "\n" + " 0.00 " + (boy - 1) + ".00\n" + " 0.00 " + (en - 1) + ".00\n " + min + ".00 " + max + ".00\n"

  array.forEach((y, key) => {
    scanstr += " "
    y.forEach(x => {
      scanstr += x + ".00 "
    })
    if (key != boy - 1) {
      scanstr += "\n"
    }
  });

  console.log("max: ", max, "min: ", min, "en: ", en, "boy: ", boy)

  fs.writeFile("/var/node/scans/" + filename, scanstr.substring(-2), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });

}

function res_saveFile(array, filename) {
  fs.writeFile("/var/node/res_scans/" + filename, array.toString(), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The resistivity file was saved!");
  });
};


function createFilename() {
  var lastfile = fs.readdirSync(scanFolder);
  if (lastfile.length == 0) {
    return "00000"
  } else {
    return (parseInt(lastfile[lastfile.length - 1]) + 1).toString().lpad("0", 5)
  }
}

function res_createFilename() {
  var lastfile = fs.readdirSync(res_scanFolder);
  if (lastfile.length == 0) {
    return "00000"
  } else {
    return (parseInt(lastfile[lastfile.length - 1]) + 1).toString().lpad("0", 5)
  }
}

String.prototype.lpad = function (padString, length) {
  var str = this;
  while (str.length < length)
    str = padString + str;
  return str;
}


