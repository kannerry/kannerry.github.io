const dungeons = {};
const selected_dungeons = {};
let overrides = {}; // Tracks cell index to slot type overrides
let currentFilteredDungeons = []; // Stores dungeons filtered by layout
let currentSizeX, currentSizeY; // Current grid dimensions

async function init_document() {
	await grab_dungeons();
}

async function grab_dungeons() {
	const res = await fetch("./DungeonLayout.json");
	const data = await res.json();

	for (const layout in data) {
		const layoutData = data[layout];
		const pretty_name = layoutData.name
			.replace("Id_DungeonLayout_", "")
			.split("_")[0];
		await load_dungeon(pretty_name, layoutData.name);
	}
}

async function load_dungeon(pretty_name, res_dir) {
	const res = await fetch(`./DungeonLayout/${res_dir}`);
	const data = await res.json();

	if (!dungeons[pretty_name]) {
		dungeons[pretty_name] = [];
	}

	dungeons[pretty_name].push(data[0]);
}

function assert_dungeon_is(dungeon_name, size_x, size_y) {
	const filtered_dungeon = dungeons[dungeon_name].filter(
		(element) =>
			element.Properties.Size.X === size_x &&
			element.Properties.Size.Y === size_y
	);
	selected_dungeons[0] = filtered_dungeon;
	return filtered_dungeon;
}

function create_grid(size_x, size_y) {
	const container = document.getElementById("skibidi_container");
	container.innerHTML = "";

	container.style.display = "grid";
	container.style.gridTemplateColumns = `repeat(${size_x}, 128px)`;
	container.style.gridTemplateRows = `repeat(${size_y}, 128px)`;
	container.style.gap = "4px";
	container.style.justifyContent = "center";
	container.style.alignContent = "center";

	for (let i = 0; i < size_x * size_y; i++) {
		const cell = document.createElement("div");
		cell.style.backgroundColor = "#333";
		cell.style.border = "1px solid #555";
		// Highlight cell if overridden
		if (overrides[i]) cell.style.border = "2px solid #00ff80";
		cell.dataset.index = i;
		cell.addEventListener("click", handleCellClick);
		container.appendChild(cell);
	}
}

// Modify _dlc function to reset overrides on layout change
function _dlc(event) {
	if (dungeon_layouts.value === "-- select a layout --") return;
	const layout_matcher = dungeon_layouts.value.split(" ");
	const dungeon_name = layout_matcher[0];
	const size = layout_matcher[1].split("x");
	const size_x = parseInt(size[0]);
	const size_y = parseInt(size[1]);
	currentSizeX = size_x;
	currentSizeY = size_y;
	overrides = {}; // Reset overrides when layout changes

	const fulldead = assert_dungeon_is(dungeon_name, size_x, size_y);
	currentFilteredDungeons = fulldead;

	create_grid(size_x, size_y);
	fill_grid(fulldead);
}

function fill_grid(fd) {
	const totalDungeons = fd.length;
	const slotCounts = {}; // To store counts of each slot type for each position

	// Initialize slotCounts
	for (let i = 0; i < fd[0].Properties.SlotTypes.length; i++) {
		slotCounts[i] = {};
	}

	// Count the occurrences of each slot type in each position
	for (let dungeon of fd) {
		const slotTypes = dungeon.Properties.SlotTypes;
		for (let i = 0; i < slotTypes.length; i++) {
			const slotType = slotTypes[i].replace(
				"EDCDungeonLayoutSlotType::",
				""
			); // Trim the prefix
			if (!slotCounts[i][slotType]) {
				slotCounts[i][slotType] = 0;
			}
			slotCounts[i][slotType]++;
		}
	}

	// Display all slot types and their fractions in each cell
	const container = document.getElementById("skibidi_container");
	const cells = container.children;

	for (let i = 0; i < cells.length; i++) {
		const cell = cells[i];
		const slotData = slotCounts[i];

		// Clear the cell content
		cell.innerHTML = "";

		// Create a container for the slot type list
		const slotList = document.createElement("div");
		slotList.style.display = "flex";
		slotList.style.flexDirection = "column";
		slotList.style.gap = "2px"; // Space between items
		slotList.style.width = "100%";
		slotList.style.height = "100%";
		slotList.style.overflowY = "auto"; // Scroll if content overflows

		// Add each slot type and its fraction as a separate element
		for (const slotType in slotData) {
			const fraction = `${slotData[slotType]}/${totalDungeons}`;

			// Create a container for the slot type and fraction
			const slotItem = document.createElement("div");
			slotItem.style.display = "flex";
			slotItem.style.justifyContent = "space-between";
			slotItem.style.alignItems = "center";
			slotItem.style.padding = "2px 4px";
			slotItem.style.backgroundColor = getColorForSlotType(slotType); // Color coding
			slotItem.style.borderRadius = "4px";
			slotItem.style.fontSize = "10px";
			slotItem.style.color = "#fff";

			// Create the slot type text
			const slotTypeText = document.createElement("span");
			slotTypeText.textContent = slotType;
			slotTypeText.style.color = getTextColorForSlotType(slotType);
			slotItem.appendChild(slotTypeText);

			// Create the fraction text
			const fractionText = document.createElement("span");
			fractionText.textContent = fraction;
			fractionText.style.color = getTextColorForSlotType(slotType);
			slotItem.appendChild(fractionText);

			// Add the slot item to the slot list
			slotList.appendChild(slotItem);
		}

		// Add the slot list to the cell
		cell.appendChild(slotList);

		// Style the cell
		cell.style.backgroundColor = "#1e1e1e"; // Default background color
		cell.style.border = "1px solid #555";
		cell.style.padding = "4px";
		cell.style.overflow = "hidden"; // Ensure text doesn't overflow
	}
}

function getTextColorForSlotType(slotType) {
	switch (slotType) {
		case "Key":
		case "Altar":
			return "black";
		default:
			return "white";
	}
}

function handleCellClick(event) {
	event.stopPropagation();
	const cell = event.currentTarget;
	const index = parseInt(cell.dataset.index);

	// Create dropdown
	const dropdown = document.createElement("select");
	dropdown.className = "slot-type-dropdown";

	// Populate options
	const slotTypes = ["Clear", "None", "Key", "Escape", "Altar", "Down", "Boss", "EscapePortal"];
	slotTypes.forEach(type => {
		const option = document.createElement("option");
		option.value = type;
		option.textContent = type;
		if (overrides[index] === type) option.selected = true;
		dropdown.appendChild(option);
	});

	// Position dropdown
	const rect = cell.getBoundingClientRect();
	dropdown.style.position = "fixed";
	dropdown.style.left = `${rect.left}px`;
	dropdown.style.top = `${rect.bottom}px`;
	dropdown.style.zIndex = "1000";

	// Handle selection
	dropdown.addEventListener("change", (e) => {
		const selectedType = e.target.value;
		if (selectedType === "Clear") {
			delete overrides[index];
		} else {
			overrides[index] = selectedType;
		}
		applyOverridesAndRefresh();
		document.body.removeChild(dropdown);
	});

	document.body.appendChild(dropdown);

	// Close dropdown on outside click
	const closeDropdown = (e) => {
		if (!dropdown.contains(e.target)) {
			document.body.removeChild(dropdown);
			document.removeEventListener("click", closeDropdown);
		}
	};
	document.addEventListener("click", closeDropdown);
}

function applyOverridesAndRefresh() {
	// Filter dungeons based on overrides
	const filtered = currentFilteredDungeons.filter(dungeon => {
		return Object.entries(overrides).every(([indexStr, requiredType]) => {
			const index = parseInt(indexStr);
			const slotType = dungeon.Properties.SlotTypes[index].replace("EDCDungeonLayoutSlotType::", "");
			return slotType === requiredType;
		});
	});

	create_grid(currentSizeX, currentSizeY);
	fill_grid(filtered);
}

// Helper function to assign colors based on slot type
function getColorForSlotType(slotType) {
	switch (slotType) {
		case "None":
			return "#333";
		case "Key":
			return "gold";
		case "Escape":
		case "EscapePortal":
			return "rgb(64,80,128)";
		case "Altar":
			return "rgb(198, 216, 216)";
		case "Down":
			return "rgb(134, 37, 50)";
		case "Boss":
			return "black";
	}
}
window.onload = init_document;
dungeon_layouts.addEventListener("change", _dlc);
