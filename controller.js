var silent = [{name: "test", pingTime: "1620834542398", volume: 1, song: "/audio/axel.ogg", playSince: null}, {name: "test3", pingTime: "1620834542398", volume: 0.8, song: "/audio/axel.ogg", playSince: null}]
var playing = [{name: "test2", pingTime: "1620834542398", playSince: "1620834542398", song: "/audio/axel.ogg", volume: 0.4}]
var correct_time = 0 // difference between server and computer, this will actually be delayed but this doesn't really matter 
var time_delay = 500

setInterval(function() {
   document.getElementById("time").innerHTML = formatTime(Number(Date.now())+correct_time)
},0)

function updateTables() {
   // ran whenever computers are changed/added/whatever
   document.getElementById("nodes").innerHTML = ""
   var data = silent.concat(playing)
   data.sort((a,b) => {
      let fa = a.name.toLowerCase(),
         fb = b.name.toLowerCase();
      if (fa < fb) {
         return -1;
      }
      if (fa > fb) {
         return 1;
      }
      return 0;
   })
   for (var i=0; i < data.length; i++) {
      if (data[i].playSince) document.getElementById("nodes").innerHTML += "<tr><td>" + data[i].name + "</td><td>Yes</td><td></td><td><input type='checkbox' id='p" + data[i].name + "'></input></td><td><input type='text' value='" + data[i].song + "' id='a" + data[i].name + "'></input></td><td><td><input id='v" + data[i].name + "' onclick=\"volume_update('v" + data[i].name + "')\" type='range' min='0' max='100' value='100'></td><td>" + formatTime(data[i].playSince) + "</td></tr>"
      else document.getElementById("nodes").innerHTML += "<tr><td>" + data[i].name + "</td><td>No</td><td></td><td><input type='checkbox' id='s" + data[i].name + "'></input></td><td><input type='text' value='" + data[i].song + "' id='a" + data[i].name + "'></input></td><td><input id='v" + data[i].name + "' onclick=\"volume_update('v" + data[i].name + "')\" type='range' min='0' max='100' value='100'></td></tr>"
   }
}

function volume_update(computer) {
   var volume = document.getElementById(computer).value/100
   computer = computer.slice(1)
   log_update("Set volume of " + computer + " to  " + volume)
   var nodes = silent.concat(playing)
   var send = []
   for (var node of nodes) {
      var object = {play_at: null, audio: null, name: node.name}
      if (node.name == computer) object.volume = volume
      else object.volume = null
      send.push(object)
   }
   Poll_returned(send)
}

function start_playing() {
   var computers = []
   for (var i=0; i < silent.length; i++) {
      if (document.getElementById('s' + silent[i].name).checked) computers.push(silent[i].name)
   }
   if (!computers.length) return
   log_update("Send songs to play to server: " + JSON.stringify(computers))
   var nodes = silent.concat(playing)
   var send = []
   for (var node of nodes) {
      var object = {volume: null, name: node.name}
      if (computers.indexOf(node.name) != -1) {
         object.play_at = Number(Date.now())+time_delay+correct_time
         object.audio = document.getElementById('a' + node.name).value
      }
      else {
         object.play_at = null
         object.audio = null
      }
      send.push(object)
   }
   Poll_returned(send)
}

function stop_playing() {
   var computers = []
   for (var i=0; i < playing.length; i++) {
      if (document.getElementById('p' + playing[i].name).checked) computers.push(playing[i].name)
   }
   if (!computers.length) return
   log_update("Send songs to stop to server: " + JSON.stringify(computers))
   var nodes = silent.concat(playing)
   var send = []
   for (var node of nodes) {
      var object = {volume: null, name: node.name}
      if (computers.indexOf(node.name) != -1) {
         object.play_at = 1
         object.audio = document.getElementById('a' + node.name).value
      }
      else {
         object.play_at = null
         object.audio = null
      }
      send.push(object)
   }
   Poll_returned(send)
}

function update_songs() {
   var computers = []
   for (var i=0; i < playing.length; i++) {
      if (document.getElementById('pa' + playing[i].name).value != playing[i].song) computers.push([playing[i], document.getElementById('pa' + playing[i].name).value])
   }
   if (!computers.length) return
   log_update("Send songs update to server: " + JSON.stringify(computers))
   // send data to server
}

function updateData(newData) { // for when the server sends shit
   var tableUpdate = false
   if (newData[0].length != silent.length || newData[1].length != playing.length) tableUpdate = true
   else {
      for (var i=0; i < silent.length; i++) {
         if (silent[i].name != newData[0][i].name) tableUpdate = true
      }
      for (var i=0; i < playing.length; i++) {
         if (playing[i].name != newData[1][i].name || playing[i].song != newData[1][i].song || playing[i].playSince != newData[1][i].playSince) tableUpdate = true
      }
   }
   silent = newData[0]
   playing = newData[1]
   log_update("Tables were updated")
   if (tableUpdate) updateTables()
}

function formatTime(time) {
   var date = new Date(Number(time))
   return date.getHours() + ":" + ("0" + date.getMinutes()).substr(-2) + ":" + ("0" + date.getSeconds()).substr(-2) + ":" + ("00" + date.getMilliseconds()).substr(-3)
}
updateTables()

function log_update(str) {
   document.getElementById("logs").innerHTML = formatTime(Number(Date.now())+correct_time) + " " + str + "<br></br>" + document.getElementById("logs").innerHTML
}

function Poll() {
   $.post(
      "HandleControllerPoll.php",
      {},
      Poll_returned,
      "json"
      );
}

function Poll_returned(nodes) {
   console.log(nodes)
}
