import Cell from "./cell";
import Graph from "./graph.js";

export interface PathFindingAlgorithm {
    execute(): Promise<void>;
    showPath(
        target: Cell,
        instant: boolean,
        currentIndex: number
    ): Promise<void> | void;
}

export class Dijkstra implements PathFindingAlgorithm {
    public static algorithmName = "Dijkstra";
    public static explanation =
        "Dijkstra algorithm works by initializing the starting node's distance to zero and all other nodes to infinity. Then, it repeatedly selects the unvisited node with the smallest known distance, updates the distances of its neighbors, and marks it as visited. This process continues until all nodes are visited or the shortest path to the target node is found.";
    private graph: Graph<Cell>;
    private pathFromSourceTo: { [id: string]: Cell[] };
    private distanceFromSourceTo: { [id: string]: number };
    private unsolvedCells: Cell[];
    private delayMs: number;

    public constructor(grid: Cell[][], delayMs: number = 0) {
        this.graph = new Graph(grid);
        const flattenGrid = [...grid.flat()];
        const source = flattenGrid.find((cell) => cell.isSource);
        if (source === undefined) throw Error("Source is not defined.");
        this.unsolvedCells = flattenGrid.filter((cell) => !cell.isSource);
        this.pathFromSourceTo = { [source.id]: [source] };
        this.distanceFromSourceTo = { [source.id]: 0 };
        this.unsolvedCells.forEach((cell) => {
            const cost = this.graph.getCost(cell, source);
            if (cost !== Infinity) {
                this.distanceFromSourceTo[cell.id] = cost;
                this.pathFromSourceTo[cell.id] = [source, cell];
            }
        });
        this.delayMs = delayMs;
    }
    public execute(): Promise<void> {
        return new Promise((resolve) => {
            const minUnsolvedDistance: number = Math.min(
                ...this.unsolvedCells.map((cell) => {
                    return cell.id in this.distanceFromSourceTo
                        ? this.distanceFromSourceTo[cell.id]
                        : Infinity;
                })
            );

            if (minUnsolvedDistance < Infinity && !isNaN(minUnsolvedDistance)) {
                const cellsToSolve: Cell[] = this.unsolvedCells.filter(
                    (c) =>
                        this.distanceFromSourceTo[c.id] === minUnsolvedDistance
                );
                this.unsolvedCells = this.unsolvedCells.filter(
                    (c) =>
                        this.distanceFromSourceTo[c.id] !== minUnsolvedDistance
                );
                for (let w of cellsToSolve) {
                    w.setExplored();
                    if (w.isTarget) {
                        resolve();
                        return;
                    } else {
                        for (let v of Object.values(
                            this.graph.graph[w.id].neighbors
                        ).map((e) => e.node)) {
                            const oldDistance =
                                v.id in this.distanceFromSourceTo
                                    ? this.distanceFromSourceTo[v.id]
                                    : Infinity;
                            const newDistance = Math.min(
                                oldDistance,
                                minUnsolvedDistance + this.graph.getCost(w, v)
                            );
                            if (newDistance !== Infinity) {
                                if (newDistance < oldDistance) {
                                    this.distanceFromSourceTo[v.id] =
                                        newDistance;
                                    this.pathFromSourceTo[v.id] = [
                                        ...(this.pathFromSourceTo[w.id] || []),
                                        v,
                                    ];
                                }
                            }
                        }
                    }
                }
                if (this.unsolvedCells.length > 0) {
                    setTimeout(() => resolve(this.execute()), this.delayMs);
                    return;
                }
            }

            // Target is not found after exploring all reachable area.
            resolve();
            return;
        });
    }
    public showPath(
        target: Cell,
        instant: boolean = false,
        currentIndex: number = 0
    ): Promise<void> | void {
        if (!(target.id in this.pathFromSourceTo)) return;
        const path = this.pathFromSourceTo[target.id];
        if (instant) {
            for (let cell of path) {
                if (!cell.isSource && !cell.isTarget) cell.setShortestPath();
            }
        } else {
            // Recursive
            // Return promise to make the UI stay freezed before showing the whole path.
            return new Promise((resolve) => {
                if (currentIndex < path.length) {
                    const cell: Cell = path[currentIndex];
                    if (!cell.isSource && !cell.isTarget) {
                        cell.setShortestPath();
                    }
                    setTimeout(() => {
                        resolve(
                            this.showPath(target, instant, currentIndex + 1)
                        );
                    }, 5);
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
    public showPath(
        target: Cell,
        instant: boolean = false,
        currentIndex: number = 0
    ): void | Promise<void> {
        // TODO
    }
}
