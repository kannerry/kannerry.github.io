const bootscreen = document.getElementById("bootscreen");
const loadingtext = document.getElementById("loadingtext")
const introbox = document.getElementById("intro")
const mainsite = document.getElementById("mainsite")

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function procLoadingText() {
    loadingtext.style.display = "block";
    setInterval(function() {
        if (loadingtext.textContent.endsWith("...")) {
            loadingtext.textContent = "Loading";
        } else {
            loadingtext.textContent += ".";
        }
    }, 500);
}

// init


for (let i = 0; i < bootscreen.children.length; i++) {
    bootscreen.children[i].style.display = "none";
} // hide bootscreen

loadingtext.style.display = "none";

// main

function doThing() {
    for (let i = 0; i < bootscreen.children.length; i++) {
        setTimeout(function() {
          bootscreen.children[i].style.display = "block";
        }, i * 150);
      }
      
      setTimeout(function(){
          procLoadingText()
      }, 1000)
      
      setTimeout(function(){
          introbox.remove()
          mainsite.classList.add("revealed")
      }, 5000)
}

var _urlskip = (window.location.href).includes("?skip")

if (_urlskip){
    introbox.remove()
    mainsite.classList.add("revealed")
}else{
    doThing()
}