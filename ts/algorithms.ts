import Cell from "./cell";
import Graph from "./graph.js";

export interface PathFindingAlgorithm {
    execute(): Promise<void>;
    showPath(
        target: Cell,
        instant: boolean,
        currentIndex?: number
    ): Promise<void> | void;
}

export class Dijkstra implements PathFindingAlgorithm {
    public static algorithmName = "Dijkstra";
    public static explanation =
        "Dijkstra algorithm works by initializing the starting node's distance to zero and all other nodes to infinity. Then, it repeatedly selects the unvisited node with the smallest known distance, updates the distances of its neighbors, and marks it as visited. This process continues until all nodes are visited or the shortest path to the target node is found.";
    private graph: Graph<Cell>;
    private pathFromSourceTo: { [id: string]: Cell[] };
    private distanceFromSourceTo: { [id: string]: number };
    private unsolved: Cell[];
    private delayMs: number;
    public constructor(source: Cell, grid: Cell[][], delayMs: number = 0) {
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
    public execute(): Promise<void> {
        return new Promise((resolve) => {
            const minUnsolvedDistance = Math.min(
                ...this.unsolved.map((cell) => {
                    return this.distanceFromSourceTo[cell.id] ?? Infinity;
                })
            );
            if (minUnsolvedDistance < Infinity && !isNaN(minUnsolvedDistance)) {
                for (let w of this.unsolved.filter(
                    (c) =>
                        this.distanceFromSourceTo[c.id] === minUnsolvedDistance
                )) {
                    w.setExplored();
                    if (w.isTarget) return resolve();
                    for (let v of Object.values(
                        this.graph.get(w.id).neighbors
                    ).map((e) => e.node)) {
                        const oldDistance =
                            this.distanceFromSourceTo[v.id] ?? Infinity;
                        const newDistance =
                            minUnsolvedDistance +
                            this.graph.getNeighborCost(w, v);
                        if (
                            newDistance !== Infinity &&
                            newDistance < oldDistance
                        ) {
                            this.distanceFromSourceTo[v.id] = newDistance;
                            this.pathFromSourceTo[v.id] = [
                                ...(this.pathFromSourceTo[w.id] ?? []),
                                v,
                            ];
                        }
                    }
                }
                this.unsolved = this.unsolved.filter(
                    (c) =>
                        this.distanceFromSourceTo[c.id] !== minUnsolvedDistance
                );
                if (this.unsolved.length > 0) {
                    setTimeout(() => resolve(this.execute()), this.delayMs);
                    return;
                }
            }
            return resolve(); // Target is not found after full exploration.
        });
    }
    public showPath(
        target: Cell,
        instant: boolean = false,
        currentIndex: number = 0
    ): Promise<void> | void {
        if (!(target.id in this.pathFromSourceTo)) return;
        const path = this.pathFromSourceTo[target.id];
        if (instant) path.forEach((cell) => cell.setShortestPath());
        else {
            // Recursive: Return `Promise` to make the UI stay freezed before
            // showing the whole path.
            return new Promise((resolve) => {
                if (currentIndex < path.length) {
                    path[currentIndex].setShortestPath();
                    setTimeout(() => {
                        resolve(
                            this.showPath(target, instant, currentIndex + 1)
                        );
                    }, this.delayMs);
                } else resolve();
            });
        }
    }
}

export class AStar implements PathFindingAlgorithm {
    public static algorithmName = "A*";
    public static explanation =
        "A* uses a cost function f(n)=g(n)+h(n), where g(n) is the cost to reach node n from the start, and h(n) is the estimated cost from n to the goal. The algorithm prioritizes nodes with the lowest f(n) value, expanding them until the goal is reached.";
    public constructor() {}
    public execute(): Promise<void> {
        return new Promise(() => {});
    }
    public showPath(): void | Promise<void> {
        // TODO
    }
}
