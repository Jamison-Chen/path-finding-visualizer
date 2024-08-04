import Graph from "./graph.js";
export class Dijkstra {
    constructor(source, grid, delayMs = 0) {
        this.graph = new Graph(grid);
        this.unsolved = grid.flat().filter((cell) => !cell.isSource);
        this.pathFromSourceTo = { [source.id]: [source] };
        this.distanceFromSourceTo = { [source.id]: 0 };
        this.unsolved.forEach((cell) => {
            const cost = this.graph.getNeighborCost(cell, source);
            if (cost !== Infinity) {
                this.distanceFromSourceTo[cell.id] = cost;
                this.pathFromSourceTo[cell.id] = [source, cell];
            }
        });
        this.delayMs = delayMs;
    }
    execute() {
        return new Promise((resolve) => {
            const minUnsolvedDistance = Math.min(...this.unsolved.map((cell) => {
                return this.distanceFromSourceTo[cell.id] ?? Infinity;
            }));
            if (minUnsolvedDistance < Infinity && !isNaN(minUnsolvedDistance)) {
                for (let w of this.unsolved.filter((c) => this.distanceFromSourceTo[c.id] === minUnsolvedDistance)) {
                    w.setExplored();
                    if (w.isTarget)
                        return resolve();
                    for (const v of Object.values(this.graph.get(w.id).neighbors)) {
                        const newDistance = minUnsolvedDistance + v.cost;
                        if (newDistance <
                            (this.distanceFromSourceTo[v.node.id] ?? Infinity)) {
                            this.distanceFromSourceTo[v.node.id] = newDistance;
                            this.pathFromSourceTo[v.node.id] = [
                                ...(this.pathFromSourceTo[w.id] ?? []),
                                v.node,
                            ];
                        }
                    }
                }
                this.unsolved = this.unsolved.filter((c) => this.distanceFromSourceTo[c.id] !== minUnsolvedDistance);
                if (this.unsolved.length > 0) {
                    setTimeout(() => resolve(this.execute()), this.delayMs);
                    return;
                }
            }
            return resolve();
        });
    }
    showPath(target, instant = false, currentIndex = 0) {
        if (!(target.id in this.pathFromSourceTo))
            return;
        const path = this.pathFromSourceTo[target.id];
        if (instant)
            path.forEach((cell) => cell.setShortestPath());
        else {
            return new Promise((resolve) => {
                if (currentIndex < path.length) {
                    path[currentIndex].setShortestPath();
                    setTimeout(() => {
                        resolve(this.showPath(target, instant, currentIndex + 1));
                    }, this.delayMs);
                }
                else
                    resolve();
            });
        }
    }
}
Dijkstra.algorithmName = "Dijkstra";
Dijkstra.explanation = "Dijkstra algorithm works by initializing the starting node's distance to zero and all other nodes to infinity. Then, it repeatedly selects the unvisited node with the smallest known distance, updates the distances of its neighbors, and marks it as visited. This process continues until all nodes are visited or the shortest path to the target node is found.";
export class AStar {
    constructor() { }
    execute() {
        return new Promise(() => { });
    }
    showPath() {
    }
}
AStar.algorithmName = "A*";
AStar.explanation = "A* uses a cost function f(n)=g(n)+h(n), where g(n) is the cost to reach node n from the start, and h(n) is the estimated cost from n to the goal. The algorithm prioritizes nodes with the lowest f(n) value, expanding them until the goal is reached.";
