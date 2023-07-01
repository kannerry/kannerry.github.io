const loadingText = document.getElementById("loadingtext")
const _lt = loadingtext.textContent.replaceAll(".", "")

const introElement = document.getElementById("intro")
const loginElement = document.getElementById("login")
const loginContent = document.getElementById("logincontent")

function updateLoadingText() {
    if (loadingText.textContent.endsWith("...")) {
        loadingText.textContent = _lt;
    } else {
        loadingText.textContent += ".";
    }
}

var _href = window.location.href

if(_href.includes("?skipintro")){
    introElement.classList.add("hidden")
    loginElement.classList.remove("hidden")
    loginContent.classList.remove("opacity-0")
}else{
    let ltInterval = setInterval(() => {
        updateLoadingText()
    }, 500);
    
    setTimeout(function(){
        clearInterval(ltInterval)
        introElement.classList.add("hidden")
        loginElement.classList.remove("hidden")
        setTimeout(() => {
            loginContent.classList.remove("opacity-0")
        }, 500);
    }, 4000)
}