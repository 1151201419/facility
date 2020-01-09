
//this js is mainly for the tabcontent
// Get the element with id="defaultOpen" and click on it , when new page open
window.onload = function() {
  document.getElementById("defaultOpen").click();

};


function openDetail(evt, categoryName) {

  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(categoryName).style.display = "block";
  evt.currentTarget.className += " active";
}
 document.getElementById("defaultOpen").click();

function date_time(id)
{
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth();
  var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
  var d = date.getDate();
  var day = date.getDay();
  var days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  var h = date.getHours();
  var m,s;
  if(h<10)
  {h = "0"+h;}
  m = date.getMinutes();
  if(m<10)
  {m = "0"+m;}
  s = date.getSeconds();
  if(s<10)
  {s = "0"+s;}
  result = ''+days[day]+' '+months[month]+' '+d+' '+year+' '+h+':'+m+':'+s;
  document.getElementById(id).innerHTML = result;
  setTimeout('date_time("'+id+'");','1000');
  return true;
}
