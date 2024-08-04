import { Dijkstra, PathFindingAlgorithm } from "./algorithms.js";
import Cell from "./cell.js";
import Maze from "./maze.js";
import { throttle } from "./utils.js";

const cellSizeOptions = ["s", "m", "l"] as const;
type CellSizeOption = (typeof cellSizeOptions)[number];

const speedOptions = ["slow", "normal", "fast"] as const;
type SpeedOption = (typeof speedOptions)[number];

const algorithmOptions = [
    Dijkstra,
    // AStar,
] as const;
type AlgorithmOption = (typeof algorithmOptions)[number];

const cleanModeOptions = ["retain-the-wall", "clean-all"] as const;
type CleanMode = (typeof cleanModeOptions)[number];

class Main {
    private domPrevAlgoButton = document.querySelector(
        "body > .control-panel > .mid > .prev"
    )!;
    private domNextAlgoButton = document.querySelector(
        "body > .control-panel > .mid > .next"
    )!;
    private domAlgorithmText = document.querySelector(
        "body > .control-panel > .mid > .algorithm"
    )!;
    private domVisualizeButton = document.querySelector(
        "body > .control-panel > .right > .visualize"
    )!;
    private domCleanButton = document.querySelector(
        "body > .control-panel > .right > .clean"
    )!;
    private domGenMazeButton = document.querySelector(
        "body > .control-panel > .right > .generate-maze"
    )!;
    private domSettingsButton = document.querySelector(
        "body > .control-panel > .right > .settings"
    )!;
    private domCanvas = document.querySelector("body > .canvas")!;
    private domModal = document.querySelector("body > .modal")!;
    private domModalTutorialMain = document.querySelector(
        "body > .modal > .main.tutorial"
    )!;
    private domModalExplainAlgoMain = document.querySelector(
        "body > .modal > .main.explain-algorithm"
    )!;
    private domModalCleanOptionsMain = document.querySelector(
        "body > .modal > .main.clean-options"
    )!;
    private domModalSettingsMain = document.querySelector(
        "body > .modal > .main.settings"
    )!;
    private tutorialLocalStorageKey = "not-show-tutorial";
    private tutorialStepIndex: number;
    private choosedAlgorithmIndex: number;
    private cellSize: CellSizeOption;
    private speed: SpeedOption;
    private cleanMode: CleanMode;
    private isMousePressedOnCell: boolean;
    private isMovingSource: boolean;
    private isMovingTarget: boolean;
    private grid: Cell[][];
    private algorithm: PathFindingAlgorithm | undefined;
    private source: Cell;
    private target: Cell;

    public constructor() {
        this.tutorialStepIndex = 0;
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
        this.domVisualizeButton.addEventListener(
            "click",
            this.onClickVisualizeButton
        );
        this.domCleanButton.addEventListener("click", this.onClickCleanButton);
        this.domGenMazeButton.addEventListener(
            "click",
            this.onClickGenMazeButton
        );
        this.domSettingsButton.addEventListener(
            "click",
            this.onClickSettingsButton
        );
        document.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener(
            "resize",
            throttle(() => window.location.reload(), 100)
        );
        if (!window.localStorage.getItem(this.tutorialLocalStorageKey)) {
            this.domModalTutorialMain.setAttribute(
                "data-order",
                `${this.tutorialStepIndex}`
            );
            this.domModalTutorialMain
                .querySelector(`.body[data-order='${this.tutorialStepIndex}']`)
                ?.classList.add("active");
            this.domModal.classList.add("active");
            this.domModalTutorialMain.classList.add("active");
            this.domModalTutorialMain
                .querySelector(".footer > .do-not-show > input")
                ?.addEventListener("click", this.onClickTutorialDoNotShow);
            this.domModalTutorialMain
                .querySelector(".footer > .button-container > .discard")
                ?.addEventListener("click", this.onClickTutorialSkip);
            this.domModalTutorialMain
                .querySelector(".footer > .button-container > .confirm")
                ?.addEventListener("click", this.onClickTutorialNext);
        }
    }
    private get algorithmClass(): AlgorithmOption {
        return algorithmOptions[this.choosedAlgorithmIndex];
    }
    private initCanvas(): void {
        this.domCanvas.innerHTML = "";
        if (this.grid) this.grid.length = 0;
        else this.grid = [];
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
        this.algorithm = undefined;
    }
    private onClickTutorialDoNotShow = (e: Event): void => {
        if ((e.currentTarget as HTMLInputElement).checked) {
            window.localStorage.setItem(this.tutorialLocalStorageKey, "1");
        } else window.localStorage.removeItem(this.tutorialLocalStorageKey);
    };
    private onClickTutorialNext = (): void => {
        if (this.tutorialStepIndex == 3) this.onClickTutorialSkip();
        else {
            this.domModalTutorialMain
                .querySelector(`.body[data-order='${this.tutorialStepIndex}']`)
                ?.classList.remove("active");
            this.tutorialStepIndex += 1;
            this.domModalTutorialMain.setAttribute(
                "data-order",
                `${this.tutorialStepIndex}`
            );
            this.domModalTutorialMain
                .querySelector(`.body[data-order='${this.tutorialStepIndex}']`)
                ?.classList.add("active");
            if (this.tutorialStepIndex == 3) {
                this.domModalTutorialMain.querySelector(
                    ".footer > .button-container > .confirm"
                )!.innerHTML = "Close";
            }
        }
    };
    private onClickTutorialSkip = (): void => {
        this.domModal.classList.remove("active");
        this.domModalTutorialMain.classList.remove("active");
    };
    private onClickPrevAlgoButton = (): void => {
        // TODO: If visualized, show alert.
        this.choosedAlgorithmIndex--;
        this.onChangeAlgorithm();
    };
    private onClickNextAlgoButton = (): void => {
        // TODO: If visualized, show alert.
        this.choosedAlgorithmIndex++;
        this.onChangeAlgorithm();
    };
    private onClickAlgorithm = (): void => {
        this.domModal.classList.add("active");
        this.domModalExplainAlgoMain.classList.add("active");
        this.domModalExplainAlgoMain.querySelector(".body")!.textContent =
            this.algorithmClass.explanation;
        this.domModalExplainAlgoMain
            .querySelector(".footer > .button.confirm-fill")!
            .addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalExplainAlgoMain.classList.remove("active");
            });
    };
    private onClickVisualizeButton = async (): Promise<void> => {
        this.cleanExploreResult();

        // Disable all buttons
        this.domPrevAlgoButton.classList.add("disabled");
        this.domPrevAlgoButton.removeEventListener(
            "click",
            this.onClickPrevAlgoButton
        );
        this.domNextAlgoButton.classList.add("disabled");
        this.domNextAlgoButton.removeEventListener(
            "click",
            this.onClickNextAlgoButton
        );
        this.domVisualizeButton.classList.add("disabled");
        this.domVisualizeButton.removeEventListener(
            "click",
            this.onClickVisualizeButton
        );
        this.domCleanButton.classList.add("disabled");
        this.domCleanButton.removeEventListener(
            "click",
            this.onClickCleanButton
        );
        this.domGenMazeButton.classList.add("disabled");
        this.domGenMazeButton.removeEventListener(
            "click",
            this.onClickGenMazeButton
        );
        this.domSettingsButton.classList.add("disabled");
        this.domSettingsButton.removeEventListener(
            "click",
            this.onClickSettingsButton
        );
        document.removeEventListener("mouseup", this.onMouseUp);
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell.mouseEnterEventListener) {
                    cell.div.removeEventListener(
                        "mouseenter",
                        cell.mouseEnterEventListener
                    );
                }
                cell.mouseEnterEventListener = undefined;
                if (cell.mouseDownEventListener) {
                    cell.div.removeEventListener(
                        "mousedown",
                        cell.mouseDownEventListener
                    );
                }
                cell.mouseDownEventListener = undefined;
            }
        }

        this.algorithm = new this.algorithmClass(
            this.source,
            this.grid,
            this.speed === "slow" ? 250 : this.speed === "normal" ? 80 : 0
        );
        await this.algorithm?.execute();
        await this.algorithm?.showPath(this.target, false);

        // Enable all buttons
        this.onChangeAlgorithm();
        this.domVisualizeButton.classList.remove("disabled");
        this.domVisualizeButton.addEventListener(
            "click",
            this.onClickVisualizeButton
        );
        this.domCleanButton.classList.remove("disabled");
        this.domCleanButton.addEventListener("click", this.onClickCleanButton);
        this.domGenMazeButton.classList.remove("disabled");
        this.domGenMazeButton.addEventListener(
            "click",
            this.onClickGenMazeButton
        );
        this.domSettingsButton.classList.remove("disabled");
        this.domSettingsButton.addEventListener(
            "click",
            this.onClickSettingsButton
        );
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
    private onClickCleanButton = (): void => {
        this.domModal.classList.add("active");
        this.domModalCleanOptionsMain.classList.add("active");
        const left =
            this.domModalCleanOptionsMain.querySelector(".body > .left")!;
        const leftOption: HTMLInputElement = left.querySelector(
            ".option-container > input"
        )!;
        const right =
            this.domModalCleanOptionsMain.querySelector(".body > .right")!;
        const rightOption: HTMLInputElement = right.querySelector(
            ".option-container > input"
        )!;
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
        if (this.cleanMode === "retain-the-wall") leftOption.checked = true;
        else rightOption.checked = true;
        this.domModalCleanOptionsMain
            .querySelector(".footer > .button.discard")!
            .addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalCleanOptionsMain.classList.remove("active");
            });
        this.domModalCleanOptionsMain
            .querySelector(".footer > .button.confirm-fill")!
            .addEventListener("click", () => {
                if (this.cleanMode === "retain-the-wall") {
                    this.cleanExploreResult();
                } else this.cleanAll();
                this.domModal.classList.remove("active");
                this.domModalCleanOptionsMain.classList.remove("active");
            });
    };
    private onClickGenMazeButton = (): void => {
        this.cleanAll();
        this.grid = Maze.createMaze(this.grid);
    };
    private onClickSettingsButton = (): void => {
        this.domModal.classList.add("active");
        this.domModalSettingsMain.classList.add("active");
        let newCellSize = this.cellSize;
        let newSpeed = this.speed;
        const domCellSizeOptionContainers: NodeListOf<HTMLElement> =
            this.domModalSettingsMain.querySelectorAll(
                ".body > .row.cell-size > .options > .option-container"
            )!;
        for (let dom of domCellSizeOptionContainers) {
            const domInput: HTMLInputElement = dom.querySelector("input")!;
            if (this.cellSize === domInput.value) domInput.checked = true;
            dom.addEventListener("click", () => {
                newCellSize = domInput.value as CellSizeOption;
                domInput.checked = true;
            });
        }
        const domSpeedOptionContainers: NodeListOf<HTMLElement> =
            this.domModalSettingsMain.querySelectorAll(
                ".body > .row.speed > .options > .option-container"
            )!;
        for (let dom of domSpeedOptionContainers) {
            const domInput: HTMLInputElement = dom.querySelector("input")!;
            if (this.speed === domInput.value) domInput.checked = true;
            dom.addEventListener("click", () => {
                newSpeed = domInput.value as SpeedOption;
                domInput.checked = true;
            });
        }
        this.domModalSettingsMain
            .querySelector(".footer > .button.discard")!
            .addEventListener("click", () => {
                this.domModal.classList.remove("active");
                this.domModalSettingsMain.classList.remove("active");
            });
        this.domModalSettingsMain
            .querySelector(".footer > .button.confirm-fill")!
            .addEventListener("click", () => {
                this.cellSize = newCellSize;
                this.speed = newSpeed;
                this.domModal.classList.remove("active");
                this.domModalSettingsMain.classList.remove("active");
                this.initCanvas();
            });
    };
    private onMouseDownOnCell = (cell: Cell): EventListener => {
        return (): void => {
            this.isMousePressedOnCell = true;
            if (cell.isSource) this.isMovingSource = true;
            else if (cell.isTarget) this.isMovingTarget = true;
            else cell.setWall();
        };
    };
    private onMouseUp = (): void => {
        this.isMousePressedOnCell = false;
        this.isMovingTarget = false;
        this.isMovingSource = false;
    };
    private onMouseEnter = (cell: Cell): EventListener => {
        return (): void => {
            if (this.isMousePressedOnCell) {
                if (!this.isMovingTarget && !this.isMovingSource) {
                    cell.setWall();
                } else {
                    if (this.isMovingSource && !cell.isTarget) {
                        this.source.backToPrevState();
                        this.source = cell.setSource();
                        this.cleanPath();
                        this.algorithm = undefined;
                    } else if (this.isMovingTarget && !cell.isSource) {
                        this.target.backToPrevState();
                        this.target = cell.setTarget();
                        this.cleanPath();
                        this.algorithm?.showPath(this.target, true);
                    }
                }
            }
        };
    };
    private onChangeAlgorithm(): void {
        this.domAlgorithmText.textContent = this.algorithmClass.algorithmName;
        if (this.choosedAlgorithmIndex === 0) {
            this.domPrevAlgoButton.classList.add("disabled");
            this.domPrevAlgoButton.removeEventListener(
                "click",
                this.onClickPrevAlgoButton
            );
        } else if (this.choosedAlgorithmIndex === 1) {
            this.domPrevAlgoButton.classList.remove("disabled");
            this.domPrevAlgoButton.addEventListener(
                "click",
                this.onClickPrevAlgoButton
            );
        }
        if (this.choosedAlgorithmIndex === algorithmOptions.length - 1) {
            this.domNextAlgoButton.classList.add("disabled");
            this.domNextAlgoButton.removeEventListener(
                "click",
                this.onClickNextAlgoButton
            );
        } else if (this.choosedAlgorithmIndex === algorithmOptions.length - 2) {
            this.domNextAlgoButton.classList.remove("disabled");
            this.domNextAlgoButton.addEventListener(
                "click",
                this.onClickNextAlgoButton
            );
        }
    }
    private cleanPath(): void {
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell.isShortestPath) cell.setExplored();
            }
        }
    }
    private cleanExploreResult(): void {
        for (let row of this.grid) {
            for (let cell of row) {
                if (
                    !cell.isWall &&
                    !cell.isSource &&
                    !cell.isTarget &&
                    cell.explored
                ) {
                    cell.setBlank();
                }
            }
        }
        this.algorithm = undefined;
    }
    private cleanAll(): void {
        for (let row of this.grid) {
            for (let cell of row) {
                if (!cell.isSource && !cell.isTarget) cell.setBlank();
            }
        }
        this.algorithm = undefined;
    }
}

new Main();
