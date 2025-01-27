const global_dungeons = {};
const global_modules = {};
let global_selected_dungeons = [];
const cellFilters = {};

function update_layouts() {
	var v = dungeon_layouts.value;
	if (v === "-- select a layout --") return;
	v = v.replace(" ", "x").split("x");
	let selected_dungeons = match_dungeon_to(
		v[0],
		parseInt(v[1]),
		parseInt(v[2])
	);
	generate_grid(parseInt(v[1]), parseInt(v[2]));
	Object.keys(cellFilters).forEach((key) => delete cellFilters[key]);
	global_selected_dungeons = selected_dungeons;
	fill_grid(selected_dungeons);
}

function generate_grid(size_x, size_y) {
	const gc = document.getElementById("grid_container");
	gc.innerHTML = "";

	const sample_cell = document.createElement("div");
	sample_cell.classList.add("grid_cell");

	document.body.appendChild(sample_cell);
	const computed_style = window.getComputedStyle(sample_cell);
	const cell_width = computed_style.width;
	const cell_height = computed_style.height;
	document.body.removeChild(sample_cell);

	gc.style.gridTemplateColumns = `repeat(${size_x}, ${cell_width})`;
	gc.style.gridTemplateRows = `repeat(${size_y}, ${cell_height})`;

	for (let i = 0; i < size_x * size_y; i++) {
		const cell = document.createElement("button");
		cell.classList.add("grid_cell");
		gc.appendChild(cell);
		cell.onclick = summon_dropdown;
	}
}

function summon_dropdown(_) {
	let self = _.srcElement;
	if (document.querySelectorAll(".grid_cell select").length > 0) {
		return;
	}
	const dropdown = document.createElement("select");
	dropdown.style.width = "100%";
	dropdown.style.height = "100%";
	dropdown.style.fontSize = "12px";

	Object.keys(global_modules).forEach((moduleName) => {
		const option = document.createElement("option");
		option.value = moduleName;
		option.textContent = moduleName;
		dropdown.appendChild(option);
	});

	dropdown.addEventListener("change", function (e) {
		const selectedModuleName = e.target.value;
		const moduleData = global_modules[selectedModuleName][0]; // Get first module instance
		let LS = moduleData.Properties.Name.LocalizedString;
		self.innerHTML = LS;

		// Store the module name as a data attribute on the cell
		self.setAttribute("data-module-name", selectedModuleName);

		const slotTypes = get_slot_types_for_module(LS).map((st) =>
			st.replace("bHas", "")
		);

		// Determine cell index
		const cells = document.getElementsByClassName("grid_cell");
		const cellIndex = Array.from(cells).indexOf(self);
		cellFilters[cellIndex] = slotTypes;

		// Filter dungeons based on cellFilters
		const filteredDungeons = global_selected_dungeons.filter((dungeon) => {
			return dungeon.Properties.SlotTypes.every((slotType, index) => {
				const allowed = cellFilters[index];
				if (!allowed || allowed.length === 0) return true; // No filter for this cell
				const typeName = slotType.split("::")[1];
				return allowed.includes(typeName);
			});
		});

		fill_grid(filteredDungeons);
	});

	// Close dropdown when clicking outside
	document.addEventListener("click", function closeDropdown(event) {
		if (!self.contains(event.target)) {
			dropdown.remove();
			document.removeEventListener("click", closeDropdown);
		}
	});

	self.appendChild(dropdown);
}

const typeColors = {
	Key: "gold",
	Down: "darkred",
	Boss: "black",
	None: "gray",
	Escape: "lightblue",
	EscapeStairs: "lightblue",
	EscapePortal: "lightblue",
};

function fill_grid(selected_dungeons) {
	const gridCells = document.getElementsByClassName("grid_cell");
	const cellCount = gridCells.length;
	if (cellCount === 0 || selected_dungeons.length === 0) return;

	const cellStats = Array.from({ length: cellCount }, () => ({}));
	const totalLayouts = selected_dungeons.length;

	selected_dungeons.forEach((dungeon) => {
		dungeon.Properties.SlotTypes.forEach((slotType, index) => {
			if (index >= cellCount) return;
			cellStats[index][slotType] = (cellStats[index][slotType] || 0) + 1;
		});
	});

	Array.from(gridCells).forEach((cell, index) => {
		const stats = cellStats[index];

		const typeEntries = Object.entries(stats)
			.map(([type, count]) => ({
				type: type.split("::")[1],
				count: count,
			}))
			.sort((a, b) => b.count - a.count);

		cell.innerHTML = "";

		// Add the module name as a label if it exists
		const moduleName = cell.getAttribute("data-module-name");
		if (moduleName) {
			const moduleLabel = document.createElement("div");
			moduleLabel.textContent = `- ${moduleName} -`;
			moduleLabel.style.fontWeight = "bold";
			moduleLabel.style.marginBottom = "4px";
			moduleLabel.style.color = "white"; // Customize color if needed
			cell.appendChild(moduleLabel);
		}

		const typeList = document.createElement("div");
		typeList.style.display = "flex";
		typeList.style.flexDirection = "column";
		typeList.style.gap = "2px";
		typeList.style.fontSize = "10px";
		typeList.style.textAlign = "center";
		typeList.style.pointerEvents = "none";

		typeEntries.forEach((entry) => {
			const typeEntry = document.createElement("div");
			typeEntry.textContent = `${entry.type}: ${entry.count}/${totalLayouts}`;

			// Apply color from the external typeColors map
			if (typeColors[entry.type]) {
				typeEntry.style.color = typeColors[entry.type];
				typeEntry.style.fontWeight = "bold";
				typeEntry.style.textShadow = `1px 1px 2px rgba(0, 0, 0, 0.5)`;
			}

			typeList.appendChild(typeEntry);
		});

		cell.appendChild(typeList);
	});
}

async function load_document() {
	const resL = await fetch("./DungeonLayout.json");
	const resM = await fetch("./DungeonModule.json");
	const layouts = await resL.json();
	const modules = await resM.json();
	for (const i in layouts) {
		await load_dungeon(layouts[i].name);
	}
	for (const i in modules) {
		await load_module(modules[i].name);
	}
	dungeon_layouts.classList = "";
}

function get_pretty_name_dungeon(input) {
	let name = input[0].Name;
	return name.replace("Id_DungeonLayout_", "").split("_")[0];
}

function get_pretty_name_module(input) {
	return input[0].Properties.Name.LocalizedString;
}

async function load_module(name) {
	const res = await fetch(`./DungeonModule/${name}`);
	const data = await res.json();
	const pretty_name = get_pretty_name_module(data);
	if (!global_modules[pretty_name]) {
		global_modules[pretty_name] = [];
	}

	global_modules[pretty_name].push(data[0]);
}

async function load_dungeon(name) {
	const res = await fetch(`./DungeonLayout/${name}`);
	const data = await res.json();
	const pretty_name = get_pretty_name_dungeon(data);
	if (!global_dungeons[pretty_name]) {
		global_dungeons[pretty_name] = [];
	}

	global_dungeons[pretty_name].push(data[0]);
}

function match_dungeon_to(name, size_x, size_y) {
	const filtered_dungeon = global_dungeons[name].filter(
		(element) =>
			element.Properties.Size.X === size_x &&
			element.Properties.Size.Y === size_y
	);
	return filtered_dungeon;
}

function get_slot_types_for_module(name) {
	let avail = global_modules[name];
	let bHas = [
		"bHasEscapeStairs",
		"bHasAltar",
		"bHasEscape",
		"bHasKey",
		"bHasEscapePortal",
		"bHasDown",
		"bHasBoss",
	];
	let rHas = [];
	for (mod in avail) {
		mod = avail[mod];
		for (i in bHas) {
			let prop = mod.Properties[bHas[i]];
			if (prop) {
				rHas.push(bHas[i]);
			}
		}
	}
	return rHas;
}

dungeon_layouts.addEventListener("change", update_layouts);
window.onload = load_document;
