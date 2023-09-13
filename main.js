const _timeDisplay = document.getElementById("time")

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = " " + hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

function grabDate() {
	var _d = new Date()
	_timeDisplay.innerHTML = formatAMPM(_d)
	console.log(_d)
	setTimeout(grabDate, 1000);
}

function initWindowHeightVariable() {
	const appHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
	window.addEventListener('resize', appHeight)
	appHeight() // grab inner height of window (relevant for mobile devices)
}

function fadeIntoBootScreen() {
	setTimeout(() => {
		document.querySelector("#fade-overlay").style.opacity = 0
	}, 250)
	setTimeout(() => {
		document.querySelector("#loader-img").src = "img/boot/boot_cntr.gif"
	}, 750)
	setTimeout(() => {
		document.querySelector("#fade-overlay").remove()
	}, 3500)
}

function clearBoot() {
	document.querySelector("#bootscreen").remove()
	document.querySelector("#main").classList.remove("hidden")
	document.querySelector("#welcome").classList.remove("hidden")
}
function fadeOutOfBootScreen() {
	clearBoot()
	setTimeout(() => {
		procWelcome()
	}, 500)
}

function procWelcome() {
	let welcomeBars = document.querySelectorAll("#welcomebar")
	welcomeBars.forEach(bar => {
		bar.classList.remove("hidden")
	})
	setTimeout(() => {
		clearWelcome()
	}, 2000)
}

function clearWelcome() {
	document.querySelector("#nav").classList.remove("undraggable")
	document.querySelector("#main").classList.remove("pointer-wait")
	let siteIds = document.querySelectorAll("#site")
	siteIds.forEach(element => {
		element.classList.remove("hidden")
	});
	document.querySelector("#welcome").remove()
}

function initAll() {
	initWindowHeightVariable()
	grabDate()
	if (window.location.href.includes("?skipBoot")) { // special case for skipping the boot screen
		clearBoot()
		clearWelcome()
		document.querySelector("#main").classList.remove("pointer-wait", "hidden", "transition-opacity-1s")
		return // break on ""boot fin""
	}
	// otherwise we can "boot" normally
	fadeIntoBootScreen()
	setTimeout(() => {
		fadeOutOfBootScreen()
	}, 6000)

}

initAll()