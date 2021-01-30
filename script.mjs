import { Cell } from './modules/cell.mjs';
import { Graph } from './modules/graph.mjs';
const cols = 48;
const rows = 27;
let mouseIsPressed = false;
let isDraggingSrc = false;
let isDraggingDest = false;
let grid;
const exploredColor = "#4fdd98ad";
const pathColor = "#FAE214";
const borderColor = "#AAA";
let allNodes;
let allEdgesAndCosts;
let map;
let src = [13, 16];
let dest = [13, 32];
// let lastSrc;
// let lastDest;
let currentPath;
let currentDistance;

// Recursive Approach
function dijkstra(src, dest, unsolved) {
    return new Promise(resolve => {
        let minD = Infinity;
        let w = null;
        unsolved.forEach(
            function(each) {
                if (currentDistance[each] < minD) {
                    w = each
                    minD = currentDistance[w]
                }
            }
        );
        if (w != null) {
            unsolved = unsolved.filter(item => item != w);
            grid[w[0]][w[1]].isExplored = true;
            if (!grid[w[0]][w[1]].isSrc && !grid[w[0]][w[1]].isDest) {
                // setTimeout(() => {
                document.getElementById(`(${w[0]},${w[1]})`).style.backgroundColor = exploredColor;
                // }, 800)
            } else {
                if (grid[w[0]][w[1]].isDest) {
                    resolve({ shortestD: currentDistance, shortestPath: currentPath });
                    return; //This return is used for break the recursive loop.
                }
            }
        } else {
            resolve({ shortestD: currentDistance, shortestPath: currentPath });
        }
        for (let v in map.graph[w]) {
            if (unsolved.some(x => x == v)) {
                let prev = currentDistance[v];
                currentDistance[v] = Math.min(prev, minD + map.getCost(w, v));
                if (currentDistance[v] != prev) {
                    let newPath = JSON.parse(JSON.stringify(currentPath[w]));
                    let vv = v.split(",").map(e => parseInt(e));
                    newPath.push(vv);
                    currentPath[v] = newPath;
                }
            }
        }
        if (unsolved.length != 0) {
            setTimeout(function() {
                resolve(dijkstra(src, dest, unsolved));
            }, 0);
        } else {
            resolve({ shortestD: currentDistance, shortestPath: currentPath });
        }
    });
}

// Used with Recursive Approach
function dijkstraPresetting() {
    currentPath = {};
    currentDistance = {};
    let unsolved = JSON.parse(JSON.stringify(allNodes));
    currentPath[src] = [src]
    unsolved = unsolved.filter(item => item != src);
    unsolved.forEach(
        function(each) {
            if (map.graph[each][src] >= 0) {
                currentDistance[each] = map.graph[each][src];
                currentPath[each] = [src, each];
            } else {
                currentDistance[each] = Infinity
            }
        }
    );
    currentDistance[src] = 0;
    return unsolved;
}

// Iterative Approach
function dijkstra2(src, dest = null) {
    let currentDistance = {};
    let currentPath = {};
    currentPath[src] = [src]
    let unsolved = JSON.parse(JSON.stringify(allNodes));
    unsolved = unsolved.filter(item => item != src);
    unsolved.forEach(
        function(each) {
            if (map.graph[each][src] != 0) {
                currentDistance[each] = map.graph[each][src];
                currentPath[each] = [src, each];
            } else {
                currentDistance[each] = Infinity
            }
        }
    );
    currentDistance[src] = 0;
    // let end = new Date().getTime() + 6000;
    // let frame = 1000 / 300; //30ps
    // (function loop() {
    //     let now = new Date().getTime();
    //     let countend = now + frame;

    while (unsolved.length != 0) { // && new Date().getTime() < countend
        let minD = Infinity;
        let w = null;
        unsolved.forEach(
            function(each) {
                if (currentDistance[each] < minD) {
                    w = each
                    minD = currentDistance[w]
                }
            }
        );
        if (w != null) {
            unsolved = unsolved.filter(item => item != w);
            grid[w[0]][w[1]].isExplored = true;
            document.getElementById(`(${w[0]},${w[1]})`).style.backgroundColor = exploredColor;
        } else {
            break;
        }
        for (let v in map.graph[w]) {
            if (map.graph[w][v] != 0 && unsolved.some(x => x == v)) {
                let prev = currentDistance[v];
                currentDistance[v] = Math.min(prev, minD + map.getCost(w, v));
                if (currentDistance[v] != prev) {
                    let newPath = JSON.parse(JSON.stringify(currentPath[w]));
                    newPath.push([v[0], v[1]]);
                    currentPath[v] = newPath;
                }
            }
        }
    }
    //     if (now < end) {
    //         window.requestAnimationFrame(loop);
    //     }

    // })();
    if (dest != null) {
        try {
            return { shortestD: currentDistance[dest], shortestPath: currentPath[dest] };
        } catch (e) {
            console.log("Unreachable Destination");
            return { shortestD: Infinity, shortestPath: [src] };
        }
    }
    return { shortestD: currentDistance, shortestPath: currentPath };
}

function arrary2graphInfo(anArray) {
    const arrFiltered = anArray.filter(el => {
        return el != null && el != '';
    });
    let h = arrFiltered.length;
    let w = arrFiltered[0].length;
    let n = [];
    let e = [];
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (!anArray[i][j].isWall) {
                n.push([i, j]);
                if (j + 1 < w && !anArray[i][j + 1].isWall) {
                    e.push({
                        n1: [i, j],
                        n2: [i, j + 1],
                        costs: 1
                    });
                }
                if (i + 1 < h && !anArray[i + 1][j].isWall) {
                    e.push({
                        n1: [i, j],
                        n2: [i + 1, j],
                        costs: 1
                    });
                }
            }
        }
    }
    return { nodes: n, edgesAndCosts: e };
}

function setup() {
    initGridDOM();
    clearBoard();
    addAllEventListener();
}

function initGridDOM() {
    let divSideLen = 100 / cols;
    for (let i = 0; i < rows; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.setAttribute("class", "each-row");
        for (let j = 0; j < cols; j++) {
            let cellDiv = document.createElement("div");
            cellDiv.setAttribute("id", `(${i},${j})`);
            cellDiv.setAttribute("class", "cell");
            cellDiv.style.width = `${divSideLen}%`;
            cellDiv.style.height = "0";
            cellDiv.style.paddingTop = `${divSideLen}%`;
            cellDiv.style.transitionDuration = "250ms";
            if (i == 0) {
                cellDiv.style.borderTopWidth = "1px";
            }
            if (j == cols - 1) {
                cellDiv.style.borderRightWidth = "1px";
                if (i == rows - 1) {
                    cellDiv.style.borderRightWidth = "1px";
                }
            }
            rowDiv.appendChild(cellDiv);
        }
        let main = document.getElementById("main");
        main.appendChild(rowDiv);
    }
}


function clearBoard() {
    grid = new Array(cols)
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(rows);
        for (let j = 0; j < cols; j++) {
            grid[i][j] = new Cell(document.getElementById(`(${i},${j})`));
        }
    }
    initSrcAndDest();
}

function hideResult() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!grid[i][j].isSrc && !grid[i][j].isDest && !grid[i][j].isWall) {
                grid[i][j].prevColor = document.getElementById(`(${i},${j})`).style.backgroundColor;
                document.getElementById(`(${i},${j})`).style.backgroundColor = "";
            }
        }
    }
    document.getElementById("hide-result-btn").onclick = showResult;
    document.getElementById("hide-result-btn").innerHTML = "Show Result";
}

function showResult() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!grid[i][j].isSrc && !grid[i][j].isDest && !grid[i][j].isWall) {
                document.getElementById(`(${i},${j})`).style.backgroundColor = grid[i][j].prevColor;
                grid[i][j].prevColor = "";
            }
        }
    }
    document.getElementById("hide-result-btn").onclick = hideResult;
    document.getElementById("hide-result-btn").innerHTML = "Hide Result";
}

function clearExploreHistory() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j].isExplored) {
                grid[i][j].isExplored = false;
                if (!grid[i][j].isSrc && !grid[i][j].isDest) {
                    document.getElementById(`(${i},${j})`).style.backgroundColor = "";
                    document.getElementById(`(${i},${j})`).style.borderColor = borderColor;
                }
            }
        }
    }
}

async function startPathFinding() {
    clearExploreHistory();
    removeAllEventListener();
    createGraphStructure();
    // let dijResult = dijkstra2([6, 1], [2, 2]);                    //Iterative Approach
    let dijResult = await dijkstra(src, dest, dijkstraPresetting()); //Recursive Approach
    // let dijDistance = dijResult.shortestD;
    await visualizePath(dijResult.shortestPath[dest]);
    addAllEventListener();
}

function createGraphStructure() {
    let graphInfo = arrary2graphInfo(grid);
    allNodes = graphInfo.nodes;
    allEdgesAndCosts = graphInfo.edgesAndCosts;
    map = new Graph(allNodes, allEdgesAndCosts);
}

function visualizePath(aPath) {
    return new Promise(resolve => {
        try {
            if (aPath.length != 0) {
                let firstElem = aPath.shift();
                if (!grid[firstElem[0]][firstElem[1]].isSrc && !grid[firstElem[0]][firstElem[1]].isDest) {
                    document.getElementById(`(${firstElem[0]},${firstElem[1]})`).style.backgroundColor = pathColor;
                    // document.getElementById(`(${each[0]},${each[1]})`).style.borderColor = pathColor;
                    document.getElementById(`(${firstElem[0]},${firstElem[1]})`).style.transitionDuration = "250ms";
                }
                setTimeout(function() {
                    resolve(visualizePath(aPath));
                }, 50);
            } else {
                resolve();
            }
        } catch (e) {
            resolve();
        }
    });
}

function addAllEventListener() {
    document.addEventListener('mouseup', mouseUp);
    document.getElementById("clear-board-btn").onclick = clearBoard;
    document.getElementById("hide-result-btn").onclick = hideResult;
    document.getElementById("hide-result-btn").innerHTML = "Hide Result";
    document.getElementById("run-btn").onclick = startPathFinding;
    let cells = document.getElementsByClassName("cell");
    for (let each = 0; each < cells.length; each++) {
        try {
            cells[each].addEventListener("mouseenter", mouseEnter);
            cells[each].addEventListener("mousedown", mouseDownOnCell);
        } catch (e) {
            console.log(each);
        }
    }
}

function removeAllEventListener() {
    document.removeEventListener('mouseup', mouseUp);
    document.getElementById("clear-board-btn").onclick = null;
    document.getElementById("run-btn").onclick = null;
    document.getElementById("hide-result-btn").onclick = null;
    let cells = document.getElementsByClassName("cell");
    for (let each = 0; each < cells.length; each++) {
        try {
            cells[each].removeEventListener("mouseenter", mouseEnter);
            cells[each].removeEventListener("mousedown", mouseDownOnCell);
        } catch (e) {
            console.log(each);
        }
    }
}

function mouseDownOnCell(anEvevt) {
    mouseIsPressed = true;
    let i = parseInt(anEvevt.target.id.split(",")[0].slice(1), 10);
    let j = parseInt(anEvevt.target.id.split(",")[1].slice(0, -1), 10);
    grid[i][j].setWallIfOk(anEvevt.target);
    if (grid[i][j].isSrc) {
        isDraggingSrc = true;
    } else if (grid[i][j].isDest) {
        isDraggingDest = true;
    }
}

function mouseEnter(anEvevt) {
    if (mouseIsPressed) {
        let i = parseInt(anEvevt.target.id.split(",")[0].slice(1), 10);
        let j = parseInt(anEvevt.target.id.split(",")[1].slice(0, -1), 10);
        if (!isDraggingDest && !isDraggingSrc) {
            grid[i][j].setWallIfOk(anEvevt.target);
        } else {
            if (isDraggingSrc && !grid[i][j].isDest) {
                // last cell visited is grid[src[0]][src[1]]
                grid[src[0]][src[1]].backToStoredState(src[0], src[1], document.getElementById(`(${src[0]},${src[1]})`));
                grid[i][j].storeState();
                grid[i][j].setSrc(anEvevt.target);
                src = [i, j];
                // lastSrc = anEvevt.target;
            } else if (isDraggingDest && !grid[i][j].isSrc) {
                // last cell visited is grid[dest[0]][dest[1]]
                grid[dest[0]][dest[1]].backToStoredState(dest[0], dest[1], document.getElementById(`(${dest[0]},${dest[1]})`));
                grid[i][j].storeState();
                grid[i][j].setDest(anEvevt.target);
                dest = [i, j];
                // lastDest = anEvevt.target;
            }
        }
    }
}

function mouseUp() {
    mouseIsPressed = false;
    if (isDraggingDest) {
        isDraggingDest = false;
    } else if (isDraggingSrc) {
        isDraggingSrc = false;
    }

}

function initSrcAndDest() {
    grid[src[0]][src[1]].setSrc(document.getElementById(`(${src[0]},${src[1]})`));
    grid[dest[0]][dest[1]].setDest(document.getElementById(`(${dest[0]},${dest[1]})`));
    // lastSrc = document.getElementById(`(${src[0]},${src[1]})`);
    // lastDest = document.getElementById(`(${dest[0]},${dest[1]})`);
}

setup();