import Graph from "./graph.js";
import MinHeap from "./heap.js";
export class Dijkstra {
    constructor(source, grid, delayMs = 0) {
        this.graph = new Graph(grid);
        this.unsolvedHeap = new MinHeap([[source, 0]], (e) => e[1]);
        this.delayMs = delayMs;
        this.pathFromSourceTo = { [source.id]: [source] };
        this.distanceFromSourceTo = { [source.id]: 0 };
    }
    execute() {
        return new Promise((resolve) => {
            const minUnsolvedDistance = this.unsolvedHeap.peek()[1];
            while (this.unsolvedHeap.size > 0 &&
                this.unsolvedHeap.peek()[1] === minUnsolvedDistance) {
                const w = this.unsolvedHeap.pop()[0];
                w.setExplored();
                if (w.isTarget)
                    return resolve();
                for (const { node, cost } of Object.values(this.graph.get(w.id).neighbors)) {
                    const newDistance = minUnsolvedDistance + cost;
                    if (newDistance <
                        (this.distanceFromSourceTo[node.id] ?? Infinity)) {
                        this.distanceFromSourceTo[node.id] = newDistance;
                        this.pathFromSourceTo[node.id] = [
                            ...(this.pathFromSourceTo[w.id] ?? []),
                            node,
                        ];
                        this.unsolvedHeap.push([node, newDistance]);
                    }
                }
            }
            if (this.unsolvedHeap.size > 0) {
                setTimeout(() => resolve(this.execute()), this.delayMs);
                return;
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
