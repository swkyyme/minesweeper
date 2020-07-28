let game = {
	count: 10,
	totalLandmineCount: 10,
	sweptLandmineCount: 0,
	remainedLandmineCount: 10,
	mineArray: [],

	timer: 0,
	timerInterval: null,

	fieldTable: document.getElementById("landmine"),
	levels: document.getElementsByName("level"),
	landMineCountDisplay: document.getElementById("landMineCount"),
	costTimeDisplay: document.getElementById("costTime"),
	startButton: document.getElementById("newGame"),

	cells: null,
	theme: "original",
};

setGame();

function setGame() {
	handleLevelChange();
	document
		.getElementById("theme")
		.addEventListener("click", handleThemeChange);
	document
		.getElementById("landmine")
		.addEventListener("contextmenu", (event) => event.preventDefault());
	game.startButton.addEventListener("click", () => {
		initGame();
	});
	initGame();
}

function initGame() {
	stopTimer();
	game.timer = 0;
	updateTimerDisplay();

	game.mineArray = [];
	game.totalLandmineCount = (game.count * game.count) / 5 - game.count;
	game.remainedLandmineCount = game.totalLandmineCount;
	game.sweptLandmineCount = 0;
	updateRemainedLandmineDisplay();

	setFieldTable(game.count);
	game.cells = document.querySelectorAll("td");
	bindCellClick();
	document.getElementsByClassName("main")[0].style.width = `${
		game.count * 32 + 180 + 60
	}px`;

	generateMineArray(game.count);
}

function generateMineArray(count) {
	const arrayLength = count * count;
	const totalLandmine = game.totalLandmineCount;
	const totalSafeLand = arrayLength - totalLandmine;
	const safeArray = new Array(totalSafeLand).fill(0);
	const mineArray = new Array(totalLandmine).fill(9);
	let landArray = safeArray.concat(mineArray);
	landArray = shuffle(landArray);
	game.mineArray = landArray;
	generateSurroundingMineCount(count);
}

function generateSurroundingMineCount(count) {
	for (let i = 0; i < count; i++) {
		for (let j = 0; j < count; j++) {
			if (!game.mineArray[i * count + j]) {
				game.mineArray[i * count + j] = calculateSurroundingMines(i, j);
			}
		}
	}
	function calculateSurroundingMines(rowPosition, colPosition) {
		let minesNumber = 0;
		for (let i = rowPosition - 1; i < rowPosition + 2; i++) {
			if (i < 0 || i >= count) continue;
			for (let j = colPosition - 1; j < colPosition + 2; j++) {
				if (
					j < 0 ||
					j >= count ||
					(i === rowPosition && j === colPosition)
				)
					continue;
				if (game.mineArray[i * count + j] === 9) {
					minesNumber++;
				}
			}
		}
		return minesNumber;
	}
}

function handleLevelChange() {
	game.levels.forEach((level) => {
		level.addEventListener("click", function () {
			game.count = this.value;
			initGame();
		});
	});
}

function setFieldTable(count) {
	let fieldTable = [];
	for (let i = 0; i < count; i++) {
		fieldTable.push("<tr>");
		for (let j = 0; j < count; j++) {
			fieldTable.push(`<td id="m_${i}_${j}" class="new"></td>`);
		}
		fieldTable.push("</tr>");
	}
	game.fieldTable.innerHTML = fieldTable.join("");
}

function shuffle(array) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function handleEndGame() {
	const overlayElement = document.getElementsByClassName("overlay")[0];
	const closeElement = document.getElementsByClassName("close")[0];
	stopTimer();
	showAll();
	overlayElement.style.display = "block";
	overlayElement.addEventListener("contextmenu", (event) =>
		event.preventDefault()
	);
	closeElement.addEventListener("click", () => {
		overlayElement.style.display = "none";
		initGame();
	});
}

function gameOver() {
	stopTimer();
	showAll();
}

function startTimer() {
	if (game.timerInterval) {
		stopTimer();
	}
	game.timer = 0;
	updateTimerDisplay();
	game.timerInterval = setInterval(() => {
		game.timer++;
		updateTimerDisplay();
	}, 1000);
}

function stopTimer() {
	clearInterval(game.timerInterval);
	game.timerInterval = null;
}

function updateTimerDisplay() {
	game.costTimeDisplay.innerHTML = `${game.timer}`;
}

function updateRemainedLandmineDisplay() {
	game.landMineCountDisplay.innerHTML = `${game.remainedLandmineCount}`;
}

function handleCellClick(e) {
	const cellArray = Array.from(game.cells);
	if (cellArray.every((cell) => cell.className === "new")) {
		startTimer();
	}
	const cellRowPosition = +this.id.split("_")[1];
	const cellColPosition = +this.id.split("_")[2];
	const cellPosition = cellRowPosition * game.count + cellColPosition;
	const surroundingMineCount = game.mineArray[cellPosition];
	if (e.buttons === 2) {
		if (game.theme === "lego") {
			this.className = "flag-lego";
		} else {
			this.className = "flag";
		}
		game.remainedLandmineCount--;
		updateRemainedLandmineDisplay();
		if (game.mineArray[cellPosition] === 9) {
			game.sweptLandmineCount++;
			if (game.sweptLandmineCount === game.totalLandmineCount) {
				handleEndGame();
			}
		}
	} else {
		if (game.mineArray[cellPosition] === 9) {
			this.className = "landMine--red";
			gameOver();
		} else {
			this.className = "normal";
			if (
				document.getElementsByClassName("new").length ===
				game.totalLandmineCount
			) {
				handleEndGame();
			}
			if (surroundingMineCount > 0 && surroundingMineCount < 9) {
				this.innerHTML = surroundingMineCount;
			} else {
				showNoLandMine(cellRowPosition, cellColPosition);
			}
			unbindCellClick(this);
		}
	}
}

function showAll() {
	game.cells.forEach((cell) => {
		unbindCellClick(cell);
		const cellRowPosition = +cell.id.split("_")[1];
		const cellColPosition = +cell.id.split("_")[2];
		const cellPosition = cellRowPosition * game.count + cellColPosition;
		const surroundingMineCount = game.mineArray[cellPosition];
		if (game.mineArray[cellPosition] === 9) {
			if (game.theme === "lego") {
				cell.classList.add("landMine-lego");
			} else {
				cell.classList.add("landMine");
			}
			cell.classList.remove("new");
		} else if (
			!cell.className.includes("flag") &&
			!cell.className.includes("flag-lego")
		) {
			cell.className = "normal";
			if (surroundingMineCount > 0 && surroundingMineCount < 9) {
				cell.innerHTML = surroundingMineCount;
			}
		} else if (
			cell.className.includes("flag") ||
			cell.className.includes("flag-lego")
		) {
			cell.classList.add("flag--yellow");
		}
	});
}

function showNoLandMine(rowPosition, colPosition) {
	for (let i = rowPosition - 1; i < rowPosition + 2; i++) {
		for (let j = colPosition - 1; j < colPosition + 2; j++) {
			if (
				!(i === rowPosition && j === colPosition) &&
				game.mineArray[i * game.count + j] !== 9
			) {
				const cell = document.getElementById(`m_${i}_${j}`);
				const surroundingMineCount = +game.mineArray[
					i * game.count + j
				];
				if (cell && cell.className == "new") {
					cell.className = "normal";
					if (surroundingMineCount) {
						cell.innerHTML = surroundingMineCount;
					} else {
						showNoLandMine(i, j);
					}
					unbindCellClick(cell);
				}
			}
		}
	}
}

/*****************bindings*************************/

function bindCellClick() {
	game.cells.forEach((cell) => {
		cell.addEventListener("mousedown", handleCellClick);
	});
}

function unbindCellClick(cell) {
	cell.removeEventListener("mousedown", handleCellClick);
}

/*****************theme*************************/

function handleThemeChange() {
	switch (game.theme) {
		case "original":
			game.theme = "lego";
			document.querySelector("body").classList.add("body-lego");
			document
				.getElementsByClassName("main")[0]
				.classList.add("main-lego");
			document.getElementById("newGame").classList.add("button-lego");
			document.getElementById("landMineCount").classList.remove("red");
			document.getElementById("costTime").classList.remove("f60");
			document.getElementById("mineImage").src =
				"./images/lego-skeleton.png";
			break;
		case "lego":
			game.theme = "original";
			document.querySelector("body").classList.remove("body-lego");
			document
				.getElementsByClassName("main")[0]
				.classList.remove("main-lego");
			document.getElementById("newGame").classList.remove("button-lego");
			document.getElementById("landMineCount").classList.add("red");
			document.getElementById("costTime").classList.add("f60");
			document.getElementById("mineImage").src = "./images/mine.png";
			break;
		default:
			break;
	}
}
