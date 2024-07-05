import { Dijkstra } from "./algorithms.js";
import Cell from "./cell.js";
import Maze from "./maze.js";
import { throttle } from "./utils.js";
const cellSizeOptions = ["s", "m", "l"];
const speedOptions = ["slow", "normal", "fast"];
const algorithmOptions = [
    Dijkstra,
];
const cleanModeOptions = ["retain-the-wall", "clean-all"];
class Main {
    constructor() {
        this.domPrevAlgoButton = document.querySelector("body > .control-panel > .mid > .prev");
        this.domNextAlgoButton = document.querySelector("body > .control-panel > .mid > .next");
        this.domAlgorithmText = document.querySelector("body > .control-panel > .mid > .algorithm");
        this.domVisualizeButton = document.querySelector("body > .control-panel > .right > .visualize");
        this.domCleanButton = document.querySelector("body > .control-panel > .right > .clean");
        this.domGenMazeButton = document.querySelector("body > .control-panel > .right > .generate-maze");
        this.domSettingsButton = document.querySelector("body > .control-panel > .right > .settings");
        this.domCanvas = document.querySelector("body > .canvas");
        this.domModal = document.querySelector("body > .modal");
        this.domModalExplainAlgoMain = document.querySelector("body > .modal > .main.explain-algorithm");
        this.domModalCleanOptionsMain = document.querySelector("body > .modal > .main.clean-options");
        this.domModalSettingsMain = document.querySelector("body > .modal > .main.settings");
        this.onClickPrevAlgoButton = () => {
            this.choosedAlgorithmIndex--;
            this.onChangeAlgorithm();
        };
        this.onClickNextAlgoButton = () => {
            this.choosedAlgorithmIndex++;
            this.onChangeAlgorithm();
        };
        this.onClickAlgorithm = () => {
            this.domModal.classList.add("active");
            this.domModalExplainAlgoMain.classList.add("active");
            this.domModalExplainAlgoMain.querySelector(".body").textContent =
                this.algorithmChoosed.explanation;
            const confirmButton = this.domModalExplainAlgoMain.querySelector(".footer > .button.confirm");
            confirmButton.addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalExplainAlgoMain.classList.remove("active");
            });
        };
        this.onClickVisualizeButton = async () => {
            this.cleanExploreResult();
            this.domPrevAlgoButton.classList.add("disabled");
            this.domPrevAlgoButton.removeEventListener("click", this.onClickPrevAlgoButton);
            this.domNextAlgoButton.classList.add("disabled");
            this.domNextAlgoButton.removeEventListener("click", this.onClickNextAlgoButton);
            this.domVisualizeButton.classList.add("disabled");
            this.domVisualizeButton.removeEventListener("click", this.onClickVisualizeButton);
            this.domCleanButton.classList.add("disabled");
            this.domCleanButton.removeEventListener("click", this.onClickCleanButton);
            this.domGenMazeButton.classList.add("disabled");
            this.domGenMazeButton.removeEventListener("click", this.onClickGenMazeButton);
            this.domSettingsButton.classList.add("disabled");
            this.domSettingsButton.removeEventListener("click", this.onClickSettingsButton);
            document.removeEventListener("mouseup", this.onMouseUp);
            for (let row of this.grid) {
                for (let cell of row) {
                    if (cell.mouseEnterEventListener) {
                        cell.div.removeEventListener("mouseenter", cell.mouseEnterEventListener);
                    }
                    cell.mouseEnterEventListener = undefined;
                    if (cell.mouseDownEventListener) {
                        cell.div.removeEventListener("mousedown", cell.mouseDownEventListener);
                    }
                    cell.mouseDownEventListener = undefined;
                }
            }
            this.algorithmObject = new this.algorithmChoosed(this.grid, this.speed === "slow" ? 250 : this.speed === "normal" ? 80 : 0);
            await this.algorithmObject?.execute();
            await this.algorithmObject?.showPath(this.target, false, 0);
            this.onChangeAlgorithm();
            this.domVisualizeButton.classList.remove("disabled");
            this.domVisualizeButton.addEventListener("click", this.onClickVisualizeButton);
            this.domCleanButton.classList.remove("disabled");
            this.domCleanButton.addEventListener("click", this.onClickCleanButton);
            this.domGenMazeButton.classList.remove("disabled");
            this.domGenMazeButton.addEventListener("click", this.onClickGenMazeButton);
            this.domSettingsButton.classList.remove("disabled");
            this.domSettingsButton.addEventListener("click", this.onClickSettingsButton);
            document.addEventListener("mouseup", this.onMouseUp);
            for (let row of this.grid) {
                for (let cell of row) {
                    const el1 = this.onMouseEnter(cell);
                    cell.div.addEventListener("mouseenter", el1);
                    cell.mouseEnterEventListener = el1;
                    const el2 = this.onMouseDownOnCell(cell);
                    cell.div.addEventListener("mousedown", el2);
                    cell.mouseDownEventListener = el2;
                }
            }
        };
        this.onClickCleanButton = () => {
            this.domModal.classList.add("active");
            this.domModalCleanOptionsMain.classList.add("active");
            const left = this.domModalCleanOptionsMain.querySelector(".body > .left");
            const leftOption = left.querySelector(".option-container > input");
            const right = this.domModalCleanOptionsMain.querySelector(".body > .right");
            const rightOption = right.querySelector(".option-container > input");
            left.addEventListener("click", () => {
                this.cleanMode = "retain-the-wall";
                leftOption.checked = true;
                rightOption.checked = false;
            });
            right.addEventListener("click", () => {
                this.cleanMode = "clean-all";
                rightOption.checked = true;
                leftOption.checked = false;
            });
            if (this.cleanMode === "retain-the-wall")
                leftOption.checked = true;
            else
                rightOption.checked = true;
            const discardButton = this.domModalCleanOptionsMain.querySelector(".footer > .button.discard");
            const confirmButton = this.domModalCleanOptionsMain.querySelector(".footer > .button.confirm");
            discardButton.addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalCleanOptionsMain.classList.remove("active");
            });
            confirmButton.addEventListener("click", () => {
                if (this.cleanMode === "retain-the-wall")
                    this.cleanExploreResult();
                else
                    this.cleanAll();
                this.domModal.classList.remove("active");
                this.domModalCleanOptionsMain.classList.remove("active");
            });
        };
        this.onClickGenMazeButton = () => {
            this.cleanAll();
            this.grid = Maze.createMaze(this.grid);
        };
        this.onClickSettingsButton = () => {
            this.domModal.classList.add("active");
            this.domModalSettingsMain.classList.add("active");
            let newCellSize = this.cellSize;
            let newSpeed = this.speed;
            const domCellSizeOptionContainers = this.domModalSettingsMain.querySelectorAll(".body > .row.cell-size > .options > .option-container");
            for (let dom of domCellSizeOptionContainers) {
                const domInput = dom.querySelector("input");
                if (this.cellSize === domInput.value)
                    domInput.checked = true;
                dom.addEventListener("click", () => {
                    newCellSize = domInput.value;
                });
            }
            const domSpeedOptionContainers = this.domModalSettingsMain.querySelectorAll(".body > .row.speed > .options > .option-container");
            for (let dom of domSpeedOptionContainers) {
                const domInput = dom.querySelector("input");
                if (this.speed === domInput.value)
                    domInput.checked = true;
                dom.addEventListener("click", () => {
                    newSpeed = domInput.value;
                });
            }
            this.domModalSettingsMain
                .querySelector(".footer > .button.discard")
                .addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalSettingsMain.classList.remove("active");
            });
            this.domModalSettingsMain
                .querySelector(".footer > .button.confirm")
                .addEventListener("click", () => {
                this.cellSize = newCellSize;
                this.speed = newSpeed;
                this.domModal.classList.remove("active");
                this.domModalSettingsMain.classList.remove("active");
                this.initCanvas();
            });
        };
        this.onMouseUp = () => {
            this.isMousePressedOnCell = false;
            this.isMovingTarget = false;
            this.isMovingSource = false;
        };
        this.onMouseEnter = (cell) => {
            return () => {
                if (this.isMousePressedOnCell) {
                    if (!this.isMovingTarget && !this.isMovingSource) {
                        cell.setWall();
                    }
                    else {
                        if (this.isMovingSource && !cell.isTarget) {
                            this.source.backToStoredState();
                            cell.storeState();
                            this.source = cell.setSource();
                        }
                        else if (this.isMovingTarget && !cell.isSource) {
                            this.target.backToStoredState();
                            cell.storeState();
                            this.target = cell.setTarget();
                            this.cleanPath();
                            this.algorithmObject?.showPath(this.target, true, 0);
                        }
                    }
                }
            };
        };
        this.onMouseDownOnCell = (cell) => {
            return () => {
                this.isMousePressedOnCell = true;
                cell.setWall();
                if (cell.isSource)
                    this.isMovingSource = true;
                else if (cell.isTarget)
                    this.isMovingTarget = true;
            };
        };
        this.choosedAlgorithmIndex = 0;
        this.cellSize = "l";
        this.speed = "fast";
        this.cleanMode = "retain-the-wall";
        this.isMousePressedOnCell = false;
        this.isMovingSource = false;
        this.isMovingTarget = false;
        this.grid = [];
        this.source = new Cell(0, 0, 0);
        this.target = new Cell(0, 0, 0);
        this.initCanvas();
        this.onChangeAlgorithm();
        this.domAlgorithmText.addEventListener("click", this.onClickAlgorithm);
        this.domVisualizeButton.addEventListener("click", this.onClickVisualizeButton);
        this.domCleanButton.addEventListener("click", this.onClickCleanButton);
        this.domGenMazeButton.addEventListener("click", this.onClickGenMazeButton);
        this.domSettingsButton.addEventListener("click", this.onClickSettingsButton);
        document.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("resize", throttle(() => window.location.reload(), 100));
    }
    get algorithmChoosed() {
        return algorithmOptions[this.choosedAlgorithmIndex];
    }
    initCanvas() {
        this.domCanvas.innerHTML = "";
        if (this.grid)
            this.grid.length = 0;
        else
            this.grid = [];
        const d = this.cellSize === "s" ? 15 : this.cellSize === "m" ? 30 : 45;
        const rowCount = Math.floor(this.domCanvas.clientHeight / d);
        const colCount = Math.floor(this.domCanvas.clientWidth / d);
        const sideLengthPercent = 100 / colCount;
        for (let i = 0; i < rowCount; i++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            this.grid[i] = [];
            for (let j = 0; j < colCount; j++) {
                const cell = new Cell(i, j, sideLengthPercent);
                rowDiv.appendChild(cell.div);
                this.grid[i][j] = cell;
                const el1 = this.onMouseEnter(cell);
                cell.div.addEventListener("mouseenter", el1);
                cell.mouseEnterEventListener = el1;
                const el2 = this.onMouseDownOnCell(cell);
                cell.div.addEventListener("mousedown", el2);
                cell.mouseDownEventListener = el2;
            }
            this.domCanvas.appendChild(rowDiv);
        }
        this.source = this.grid[0][0].setSource();
        this.target = this.grid[rowCount - 1][colCount - 1].setTarget();
        this.algorithmObject = undefined;
    }
    onChangeAlgorithm() {
        this.domAlgorithmText.textContent = this.algorithmChoosed.algorithmName;
        if (this.choosedAlgorithmIndex === 0) {
            this.domPrevAlgoButton.classList.add("disabled");
            this.domPrevAlgoButton.removeEventListener("click", this.onClickPrevAlgoButton);
        }
        else if (this.choosedAlgorithmIndex === 1) {
            this.domPrevAlgoButton.classList.remove("disabled");
            this.domPrevAlgoButton.addEventListener("click", this.onClickPrevAlgoButton);
        }
        if (this.choosedAlgorithmIndex === algorithmOptions.length - 1) {
            this.domNextAlgoButton.classList.add("disabled");
            this.domNextAlgoButton.removeEventListener("click", this.onClickNextAlgoButton);
        }
        else if (this.choosedAlgorithmIndex === algorithmOptions.length - 2) {
            this.domNextAlgoButton.classList.remove("disabled");
            this.domNextAlgoButton.addEventListener("click", this.onClickNextAlgoButton);
        }
    }
    cleanPath() {
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell.isShortestPath && cell.isExplored)
                    cell.setExplored();
            }
        }
    }
    cleanExploreResult() {
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell.isExplored)
                    cell.setUnexplored();
            }
        }
        this.algorithmObject = undefined;
    }
    cleanAll() {
        for (let row of this.grid) {
            for (let cell of row) {
                if (!(cell.isSource || cell.isTarget))
                    cell.setBlank();
            }
        }
        this.algorithmObject = undefined;
    }
}
new Main();
