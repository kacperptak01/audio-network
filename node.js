function Poll(){
  $.post(
    "HandleNodePoll.php",
    {},
    Poll_returned,
    "json"
    );
}

function Poll_returned(json){
  log = document.getElementById("log");
  log.text += "Last polled at: " + json["node"]["last_polled"];
}
  
  
setInterval(Poll, 5000);
