import Cell from "./cell.js";
import Graph from "./graph.js";
import Maze from "./maze.js";

class Main {
    private static PANEL: HTMLElement = document.getElementById("panel")!;
    private static NEW_BUTTON_SMALL: HTMLButtonElement =
        document.getElementById("new-btn-small") as HTMLButtonElement;
    private static NEW_BUTTON_MEDIUM: HTMLButtonElement =
        document.getElementById("new-btn-medium") as HTMLButtonElement;
    private static NEW_BUTTON_BIG: HTMLButtonElement = document.getElementById(
        "new-btn-big"
    ) as HTMLButtonElement;
    private static RUN_BUTTON: HTMLButtonElement = document.getElementById(
        "run-btn"
    ) as HTMLButtonElement;
    private static MAZE_BUTTON: HTMLButtonElement = document.getElementById(
        "maze-btn"
    ) as HTMLButtonElement;

    private static cellSize: "small" | "medium" | "big" = "big";
    private static isMousePressed: boolean = false;
    private static isMovingSource: boolean = false;
    private static isMovingTarget: boolean = false;
    private static grid: Cell[][];
    private static graph: Graph<Cell>;
    private static source: Cell;
    private static target: Cell;
    private static pathFromSourceTo: { [id: string]: Cell[] };
    private static distanceFromSourceTo: { [id: string]: number };

    public static main(): void {
        Main.initBoard();

        // Add all event listeners
        document.addEventListener("mouseup", Main.onMouseUp);
        Main.NEW_BUTTON_SMALL.onclick = () => {
            Main.cellSize = "small";
            Main.initBoard();
        };
        Main.NEW_BUTTON_MEDIUM.onclick = () => {
            Main.cellSize = "medium";
            Main.initBoard();
        };
        Main.NEW_BUTTON_BIG.onclick = () => {
            Main.cellSize = "big";
            Main.initBoard();
        };
        Main.MAZE_BUTTON.onclick = () => {
            Main.initBoard();
            Main.grid = Maze.createMaze(Main.grid);
        };
        Main.RUN_BUTTON.onclick = Main.onClickRun;
    }

    private static initBoard() {
        Main.PANEL.innerHTML = "";
        if (Main.grid) Main.grid.length = 0;
        Main.grid = [];

        const d =
            Main.cellSize === "small"
                ? 5
                : Main.cellSize === "medium"
                ? 10
                : 15;

        const numOfRows = Math.floor((Main.PANEL.clientHeight - 30) / d);
        const numOfColumns = Math.floor((Main.PANEL.clientWidth - 30) / d);

        const cellSideLength = 100 / numOfColumns;
        for (let i = 0; i < numOfRows; i++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            Main.grid[i] = [];
            for (let j = 0; j < numOfColumns; j++) {
                const cell = new Cell(i, j, cellSideLength);
                rowDiv.appendChild(cell.div);
                Main.grid[i][j] = cell;
                cell.div.onmouseenter = Main.onMouseEnter(cell);
                cell.div.onmousedown = Main.onMouseDownOnCell(cell);
            }
            Main.PANEL.appendChild(rowDiv);
        }

        // Initialize source and target
        Main.source = Main.grid[0][0].setSource();
        Main.target =
            Main.grid[Main.grid.length - 1][
                Main.grid[0].length - 1
            ].setTarget();
    }

    private static onMouseUp = (): void => {
        Main.isMousePressed = false;
        if (Main.isMovingTarget) Main.isMovingTarget = false;
        if (Main.isMovingSource) Main.isMovingSource = false;
    };

    private static onMouseEnter = (cell: Cell): EventListener => {
        return (): void => {
            if (Main.isMousePressed) {
                if (!Main.isMovingTarget && !Main.isMovingSource) {
                    cell.setWall();
                } else {
                    if (Main.isMovingSource && !cell.isTarget) {
                        Main.source.backToStoredState();
                        cell.storeState();
                        Main.source = cell.setSource();
                    } else if (Main.isMovingTarget && !cell.isSource) {
                        Main.target.backToStoredState();
                        cell.storeState();
                        Main.target = cell.setTarget();
                        Main.clearPath();
                        if (
                            Main.pathFromSourceTo &&
                            Main.target.id in Main.pathFromSourceTo
                        ) {
                            Main.showPath(
                                Main.pathFromSourceTo[Main.target.id],
                                true
                            );
                        }
                    }
                }
            }
        };
    };

    private static onMouseDownOnCell = (cell: Cell): EventListener => {
        return (): void => {
            Main.isMousePressed = true;
            cell.setWall();
            if (cell.isSource) Main.isMovingSource = true;
            else if (cell.isTarget) Main.isMovingTarget = true;
        };
    };

    private static onClickRun = async (): Promise<void> => {
        // Clear explore history
        for (let row of Main.grid) {
            for (let cell of row) {
                if (cell.isExplored) cell.setUnexplored();
            }
        }

        // Remove all event listener
        document.removeEventListener("mouseup", Main.onMouseUp);
        Main.NEW_BUTTON_SMALL.disabled = true;
        Main.NEW_BUTTON_MEDIUM.disabled = true;
        Main.NEW_BUTTON_BIG.disabled = true;
        Main.RUN_BUTTON.disabled = true;
        Main.MAZE_BUTTON.disabled = true;
        for (let row of Main.grid) {
            for (let cell of row) {
                cell.div.onmouseenter = null;
                cell.div.onmousedown = null;
            }
        }

        Main.graph = new Graph(Main.grid);

        await Main.dijkstra();

        if (Main.target.id in Main.pathFromSourceTo) {
            await Main.showPath(Main.pathFromSourceTo[Main.target.id]);
        }

        // Reset all event listener
        document.addEventListener("mouseup", Main.onMouseUp);
        Main.NEW_BUTTON_SMALL.disabled = false;
        Main.NEW_BUTTON_MEDIUM.disabled = false;
        Main.NEW_BUTTON_BIG.disabled = false;
        Main.RUN_BUTTON.disabled = false;
        Main.MAZE_BUTTON.disabled = false;
        for (let row of Main.grid) {
            for (let cell of row) {
                cell.div.onmouseenter = Main.onMouseEnter(cell);
                cell.div.onmousedown = Main.onMouseDownOnCell(cell);
            }
        }
    };

    // Recursive Approach
    private static dijkstra(
        unsolvedCells: Cell[] = Main.prepareForDijkstra()
    ): Promise<void> {
        return new Promise((resolve) => {
            const minUnsolvedDistance: number = Math.min(
                ...unsolvedCells.map((c) => {
                    return c.id in Main.distanceFromSourceTo
                        ? Main.distanceFromSourceTo[c.id]
                        : Infinity;
                })
            );

            if (minUnsolvedDistance < Infinity && !isNaN(minUnsolvedDistance)) {
                const cellsToSolve: Cell[] = unsolvedCells.filter(
                    (c) =>
                        Main.distanceFromSourceTo[c.id] === minUnsolvedDistance
                );
                unsolvedCells = unsolvedCells.filter(
                    (c) =>
                        Main.distanceFromSourceTo[c.id] !== minUnsolvedDistance
                );
                for (let w of cellsToSolve) {
                    w.setExplored();
                    if (w.isTarget) {
                        resolve();
                        return;
                    } else {
                        for (let v of Object.values(
                            Main.graph.graph[w.id].neighbors
                        ).map((e) => e.node)) {
                            const oldDistance =
                                v.id in Main.distanceFromSourceTo
                                    ? Main.distanceFromSourceTo[v.id]
                                    : Infinity;
                            const newDistance = Math.min(
                                oldDistance,
                                minUnsolvedDistance + Main.graph.getCost(w, v)
                            );
                            if (newDistance !== Infinity) {
                                if (newDistance < oldDistance) {
                                    Main.distanceFromSourceTo[v.id] =
                                        newDistance;
                                    Main.pathFromSourceTo[v.id] = [
                                        ...(Main.pathFromSourceTo[w.id] || []),
                                        v,
                                    ];
                                }
                            }
                        }
                    }
                }
                if (unsolvedCells.length > 0) {
                    setTimeout(() => resolve(Main.dijkstra(unsolvedCells)));
                    return;
                }
            }
            // Target is not found after exploring all reachable area.
            resolve();
            return;
        });
    }

    private static prepareForDijkstra(): Cell[] {
        const unsolvedCells: Cell[] = [...Main.grid.flat()].filter(
            (cell) => cell.id !== Main.source.id
        );
        Main.pathFromSourceTo = { [Main.source.id]: [Main.source] };
        Main.distanceFromSourceTo = { [Main.source.id]: 0 };
        unsolvedCells.forEach((cell) => {
            const distance = Main.graph.getCost(cell, this.source);
            if (distance !== Infinity) {
                Main.distanceFromSourceTo[cell.id] = distance;
                Main.pathFromSourceTo[cell.id] = [Main.source, cell];
            }
        });
        return unsolvedCells;
    }

    private static showPath(
        path: Cell[],
        instant: boolean = false,
        idx: number = 0
    ): Promise<void> | void {
        if (instant) {
            for (let cell of path) {
                if (!cell.isSource && !cell.isTarget) cell.setShortestPath();
            }
        } else {
            // Recursive
            // Return promise to make the UI stay freezed before showing the whole path.
            return new Promise((resolve) => {
                if (idx < path.length) {
                    const cell: Cell = path[idx];
                    if (!cell.isSource && !cell.isTarget) {
                        cell.setShortestPath();
                    }
                    setTimeout(
                        () => resolve(Main.showPath(path, instant, idx + 1)),
                        5
                    );
                } else resolve();
            });
        }
    }

    private static clearPath(): void {
        for (let row of Main.grid) {
            for (let cell of row) {
                if (cell.isShortestPath && cell.isExplored) cell.setExplored();
            }
        }
    }
}

Main.main();
