// animated gif ascii
var currentIndex = 0
var timerId = null
var in_dir = null
var fileArray = []
var fileCache = {}

function generateFileNames(num) {
    let fileNames = []
    switch (num) {
        case 'bitdance_frames':
            num = 288
		break
        default:
            num
    }
    for (let i = 1; i <= num; i++) {
        fileNames.push(i + ".txt")
    }
    return fileNames
}

function startLoop(input, timer = 60) {
    in_dir = input
    fileArray = generateFileNames(input)
    timerId = setInterval(fix_display, timer)
}
function stopLoop() {
    clearInterval(timerId)
}
const fix_display = () => {
    displayNextFile(in_dir)
}

function displayNextFile(in_dir) {
    var filePath = fileArray[currentIndex];
    if (fileCache[filePath]) {
        // file has already been loaded, retrieve from cache
        var output = "<pre>" + fileCache[filePath].replace(/\n/g, "<br>") + "</pre>";
        document.getElementById("file-contents").innerHTML = output;
    } else {
        // file not in cache, make a GET request
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Store the response in cache
                fileCache[filePath] = this.responseText;
                var output = "<pre>" + this.responseText.replace(/\n/g, "<br>") + "</pre>";
                document.getElementById("file-contents").innerHTML = output;
            }
        };
        xhttp.open("GET", "/gif2ascii/" + in_dir + "/" + filePath, true);
        xhttp.send();
    }
    currentIndex = (currentIndex + 1) % fileArray.length;
}

startLoop('bitdance_frames')