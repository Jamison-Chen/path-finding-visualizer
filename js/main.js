var _a;
import Cell from "./cell.js";
import Graph from "./graph.js";
import Maze from "./maze.js";
class Main {
    static main() {
        _a.initBoard();
        document.addEventListener("mouseup", _a.onMouseUp);
        _a.NEW_BUTTON_SMALL.onclick = () => {
            _a.cellSize = "small";
            _a.initBoard();
        };
        _a.NEW_BUTTON_MEDIUM.onclick = () => {
            _a.cellSize = "medium";
            _a.initBoard();
        };
        _a.NEW_BUTTON_BIG.onclick = () => {
            _a.cellSize = "big";
            _a.initBoard();
        };
        _a.MAZE_BUTTON.onclick = () => {
            _a.initBoard();
            _a.grid = Maze.createMaze(_a.grid);
        };
        _a.RUN_BUTTON.onclick = _a.onClickRun;
    }
    static initBoard() {
        _a.PANEL.innerHTML = "";
        if (_a.grid)
            _a.grid.length = 0;
        _a.grid = [];
        const d = _a.cellSize === "small"
            ? 5
            : _a.cellSize === "medium"
                ? 10
                : 15;
        const numOfRows = Math.floor((_a.PANEL.clientHeight - 30) / d);
        const numOfColumns = Math.floor((_a.PANEL.clientWidth - 30) / d);
        const cellSideLength = 100 / numOfColumns;
        for (let i = 0; i < numOfRows; i++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            _a.grid[i] = [];
            for (let j = 0; j < numOfColumns; j++) {
                const cell = new Cell(i, j, cellSideLength);
                rowDiv.appendChild(cell.div);
                _a.grid[i][j] = cell;
                cell.div.onmouseenter = _a.onMouseEnter(cell);
                cell.div.onmousedown = _a.onMouseDownOnCell(cell);
            }
            _a.PANEL.appendChild(rowDiv);
        }
        _a.source = _a.grid[0][0].setSource();
        _a.target =
            _a.grid[_a.grid.length - 1][_a.grid[0].length - 1].setTarget();
    }
    static dijkstra(unsolvedCells = _a.prepareForDijkstra()) {
        return new Promise((resolve) => {
            const minUnsolvedDistance = Math.min(...unsolvedCells.map((c) => {
                return c.id in _a.distanceFromSourceTo
                    ? _a.distanceFromSourceTo[c.id]
                    : Infinity;
            }));
            if (minUnsolvedDistance < Infinity && !isNaN(minUnsolvedDistance)) {
                const cellsToSolve = unsolvedCells.filter((c) => _a.distanceFromSourceTo[c.id] === minUnsolvedDistance);
                unsolvedCells = unsolvedCells.filter((c) => _a.distanceFromSourceTo[c.id] !== minUnsolvedDistance);
                for (let w of cellsToSolve) {
                    w.setExplored();
                    if (w.isTarget) {
                        resolve();
                        return;
                    }
                    else {
                        for (let v of Object.values(_a.graph.graph[w.id].neighbors).map((e) => e.node)) {
                            const oldDistance = v.id in _a.distanceFromSourceTo
                                ? _a.distanceFromSourceTo[v.id]
                                : Infinity;
                            const newDistance = Math.min(oldDistance, minUnsolvedDistance + _a.graph.getCost(w, v));
                            if (newDistance !== Infinity) {
                                if (newDistance < oldDistance) {
                                    _a.distanceFromSourceTo[v.id] =
                                        newDistance;
                                    _a.pathFromSourceTo[v.id] = [
                                        ...(_a.pathFromSourceTo[w.id] || []),
                                        v,
                                    ];
                                }
                            }
                        }
                    }
                }
                if (unsolvedCells.length > 0) {
                    setTimeout(() => resolve(_a.dijkstra(unsolvedCells)));
                    return;
                }
            }
            resolve();
            return;
        });
    }
    static prepareForDijkstra() {
        const unsolvedCells = [..._a.grid.flat()].filter((cell) => cell.id !== _a.source.id);
        _a.pathFromSourceTo = { [_a.source.id]: [_a.source] };
        _a.distanceFromSourceTo = { [_a.source.id]: 0 };
        unsolvedCells.forEach((cell) => {
            const distance = _a.graph.getCost(cell, this.source);
            if (distance !== Infinity) {
                _a.distanceFromSourceTo[cell.id] = distance;
                _a.pathFromSourceTo[cell.id] = [_a.source, cell];
            }
        });
        return unsolvedCells;
    }
    static showPath(path, instant = false, idx = 0) {
        if (instant) {
            for (let cell of path) {
                if (!cell.isSource && !cell.isTarget)
                    cell.setShortestPath();
            }
        }
        else {
            return new Promise((resolve) => {
                if (idx < path.length) {
                    const cell = path[idx];
                    if (!cell.isSource && !cell.isTarget) {
                        cell.setShortestPath();
                    }
                    setTimeout(() => resolve(_a.showPath(path, instant, idx + 1)), 5);
                }
                else
                    resolve();
            });
        }
    }
    static clearPath() {
        for (let row of _a.grid) {
            for (let cell of row) {
                if (cell.isShortestPath && cell.isExplored)
                    cell.setExplored();
            }
        }
    }
}
_a = Main;
Main.PANEL = document.getElementById("panel");
Main.NEW_BUTTON_SMALL = document.getElementById("new-btn-small");
Main.NEW_BUTTON_MEDIUM = document.getElementById("new-btn-medium");
Main.NEW_BUTTON_BIG = document.getElementById("new-btn-big");
Main.RUN_BUTTON = document.getElementById("run-btn");
Main.MAZE_BUTTON = document.getElementById("maze-btn");
Main.cellSize = "big";
Main.isMousePressed = false;
Main.isMovingSource = false;
Main.isMovingTarget = false;
Main.onMouseUp = () => {
    _a.isMousePressed = false;
    if (_a.isMovingTarget)
        _a.isMovingTarget = false;
    if (_a.isMovingSource)
        _a.isMovingSource = false;
};
Main.onMouseEnter = (cell) => {
    return () => {
        if (_a.isMousePressed) {
            if (!_a.isMovingTarget && !_a.isMovingSource) {
                cell.setWall();
            }
            else {
                if (_a.isMovingSource && !cell.isTarget) {
                    _a.source.backToStoredState();
                    cell.storeState();
                    _a.source = cell.setSource();
                }
                else if (_a.isMovingTarget && !cell.isSource) {
                    _a.target.backToStoredState();
                    cell.storeState();
                    _a.target = cell.setTarget();
                    _a.clearPath();
                    if (_a.pathFromSourceTo &&
                        _a.target.id in _a.pathFromSourceTo) {
                        _a.showPath(_a.pathFromSourceTo[_a.target.id], true);
                    }
                }
            }
        }
    };
};
Main.onMouseDownOnCell = (cell) => {
    return () => {
        _a.isMousePressed = true;
        cell.setWall();
        if (cell.isSource)
            _a.isMovingSource = true;
        else if (cell.isTarget)
            _a.isMovingTarget = true;
    };
};
Main.onClickRun = async () => {
    for (let row of _a.grid) {
        for (let cell of row) {
            if (cell.isExplored)
                cell.setUnexplored();
        }
    }
    document.removeEventListener("mouseup", _a.onMouseUp);
    _a.NEW_BUTTON_SMALL.disabled = true;
    _a.NEW_BUTTON_MEDIUM.disabled = true;
    _a.NEW_BUTTON_BIG.disabled = true;
    _a.RUN_BUTTON.disabled = true;
    _a.MAZE_BUTTON.disabled = true;
    for (let row of _a.grid) {
        for (let cell of row) {
            cell.div.onmouseenter = null;
            cell.div.onmousedown = null;
        }
    }
    _a.graph = new Graph(_a.grid);
    await _a.dijkstra();
    if (_a.target.id in _a.pathFromSourceTo) {
        await _a.showPath(_a.pathFromSourceTo[_a.target.id]);
    }
    document.addEventListener("mouseup", _a.onMouseUp);
    _a.NEW_BUTTON_SMALL.disabled = false;
    _a.NEW_BUTTON_MEDIUM.disabled = false;
    _a.NEW_BUTTON_BIG.disabled = false;
    _a.RUN_BUTTON.disabled = false;
    _a.MAZE_BUTTON.disabled = false;
    for (let row of _a.grid) {
        for (let cell of row) {
            cell.div.onmouseenter = _a.onMouseEnter(cell);
            cell.div.onmousedown = _a.onMouseDownOnCell(cell);
        }
    }
};
Main.main();
