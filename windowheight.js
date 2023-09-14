function initWindowHeightVariable() {
	const appHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
	window.addEventListener('resize', appHeight)
	appHeight() // grab inner height of window (relevant for mobile devices)
}

initWindowHeightVariable()