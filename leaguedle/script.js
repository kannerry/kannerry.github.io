const blacklist = ["The Golden Spatula",
	"Innervating Locket", "Spectral Cutlass", "Lifeline",
	"Ghostcrawlers", "Atma's Reckoning", "Scorchclaw Pup",
	"Gustwalker Hatchling", "Mosstomper Seedling", "Scarecrow Effigy",
	"Health Potion", "Obsidian Edge", "Doran's Shield", "Doran's Blade",
	"Doran's Ring", 'Dark Seal', 'Cull', 'Refillable Potion', 'Corrupting Potion',
	"Guardian's Amulet", "Guardian's Shroud", "Guardian's Horn", 'Control Ward',
	'Elixir of Iron', "Guardian's Blade", 'Zephyr', 'Hextech Gunblade', "Guardian's Orb", 'Rite Of Ruin', "Boots", "Boots of Swiftness",
	"Mobility Boots", "Ionian Boots of Lucidity", "Mejai's Soulstealer", 'Oracle Lens', 'Farsight Alteration', 'Stealth Ward', 'Deathfire Grasp',
	"Mercury's Treads", "Berserker's Greaves", 'Juice of Haste', 'Juice of Vitality',
	'Juice of Power', 'Cappa Juice', 'Elixir of Wrath', 'Elixir of Sorcery', 'Spectral Sickle',
	'Steel Shoulderguards', "Kalista's Black Spear",]

var global_items

function start_game(_items) {
	var shop_items = _items.filter((item) => item.from.length >= 1 && !blacklist.includes(item.name) && item.inStore == true)
	global_items = _items
	const random_item = shop_items[Math.floor(Math.random() * shop_items.length)];
	let main_item = generate_point(document.getElementById("item_tree"), random_item, random_item.id, true)
	loop_through_components(random_item, _items, main_item)
}

function loop_through_components(base_item, _items, item_div) {
	let branch = generate_branch_for_element(item_div.parentElement)
	base_item.from.forEach(component => {
		var component_def = _items.filter((def) => def.id == component)[0]
		component_point = generate_point(branch, component_def, component_def.id)
		if (component_def.from.length > 0) {
			loop_through_components(component_def, _items, component_point)
		}
	});
}

function generate_item_to_div(_item, div) {
	let img = document.createElement("img")
	let img_str = "https://raw.communitydragon.org/latest/game/" + _item.iconPath.split("/lol-game-data/assets/")[1]
	img.src = img_str.toLowerCase()
	div.appendChild(img)
}

function generate_point(div, item_def, uuid, isMain = false) {
	let li = document.createElement("li")
	let span = document.createElement("span")
	let img = document.createElement("img")
	div.appendChild(li)
	li.appendChild(span)
	span.appendChild(img)
	img.src = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-postgame/global/default/icon-bot-spell-placeholder.png"
	let imgencrypt = window.btoa("https://raw.communitydragon.org/latest/game/" + item_def.iconPath.split("/lol-game-data/assets/")[1].toLowerCase())
	img.id = imgencrypt // please dont cheat <3
	if (isMain == true) {
		img.classList = "main_item"
	}
	return span
}

function generate_branch_for_element(element) {
	let ul = document.createElement("ul")
	element.appendChild(ul)
	return ul
}

var i = 0

function try_input() {
	i++
	if (i > 6) {
		document.getElementById("giveup").classList = ""
	}
	let input = document.getElementById("autocomplete").innerHTML.replace("[", "").replace("]", "")
	document.getElementById("go_input").value = ""
	document.getElementById("btn").className = "hidden"
	document.getElementById("autocomplete").innerHTML = ""
	document.querySelectorAll("img").forEach(element => {
		let src = window.atob(element.id)
		let csrc = src.replace("https://raw.communitydragon.org/latest/game/", "/lol-game-data/assets/")
		// /lol-game-data/assets/ASSETS/Items/Icons2D/1033_Base_T1_MagicMantle.png
		let win_filter = global_items.filter((item) => item.iconPath.toLowerCase() == csrc && item.name == input)
		win_filter.forEach(fw => {
			element.src = src
		});
	});
}

function give_up() {
	document.querySelectorAll("img").forEach(element => {
		let src = window.atob(element.id)
		element.src = src
	});
}

function uniq(a) {
	var seen = {};
	return a.filter(function (item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
}

fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json')
	.then(res => res.json())
	.then(data => { start_game(data) })

let doc = document.querySelector("#go_input")

function check_win() {
	var main_item = document.querySelector(".main_item")
	var main_src = atob(main_item.id)
	if (main_src == main_item.src) {
		document.querySelector("#retry").classList = ""
		let csrc = main_src.replace("https://raw.communitydragon.org/latest/game/", "/lol-game-data/assets/")
		let itemdef = global_items.filter((item) => item.iconPath.toLowerCase() == csrc)[0]
		document.getElementById("name").innerHTML = itemdef.name
		document.getElementById("name").classList = ""
	}
}

setInterval(check_win, 1000);

window.addEventListener("DOMContentLoaded", (event) => {
	let doc = document.querySelector("#go_input")
	doc.addEventListener("change", (event) => {
		if (document.getElementById("btn").className == "") {
			try_input()
		}
	});
	doc.addEventListener("input", (event) => {
		var items_allowed = global_items.filter((item) => !blacklist.includes(item.name) && item.inStore == true)
		var items_real = items_allowed.filter((item) => item.name.toLowerCase().replace("'", "").includes(doc.value))
		let custom_array = []

		items_real.sort((a, b) => b.length - a.length)
		items_real = uniq(items_real)

		items_real.forEach(element => {
			custom_array.push(element.name)
		});
		custom_array = uniq(custom_array)
		if (custom_array.length == 1) {
			custom_array[0] = "[" + custom_array[0] + "]"
			document.getElementById("btn").className = ""
		} else {
			document.getElementById("btn").className = "hidden"
		}
		if (doc.value == "") {
			document.getElementById("autocomplete").innerHTML = ""
			return
		}
		document.getElementById("autocomplete").innerHTML = custom_array
	});
});