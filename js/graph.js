export default class Graph {
    constructor(grid) {
        this.graph = {};
        const graphInfo = this.gridToGraphInfo(grid);
        graphInfo.nodes.forEach((node) => this.addNode(node));
        graphInfo.edgesAndCosts.forEach((each) => this.addEdge(each));
    }
    gridToGraphInfo(grid) {
        let h = grid.length;
        let w = grid[0].length;
        let n = [];
        let e = [];
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (!grid[i][j].isWall) {
                    n.push(grid[i][j]);
                    if (j + 1 < w && !grid[i][j + 1].isWall) {
                        e.push({
                            n1: grid[i][j],
                            n2: grid[i][j + 1],
                            cost: 1,
                        });
                    }
                    if (i + 1 < h && !grid[i + 1][j].isWall) {
                        e.push({
                            n1: grid[i][j],
                            n2: grid[i + 1][j],
                            cost: 1,
                        });
                    }
                }
            }
        }
        return { nodes: n, edgesAndCosts: e };
    }
    addNode(node) {
        this.graph[node.id] = { node: node, neighbors: {} };
    }
    addEdge(edge) {
        this.graph[edge.n1.id].neighbors[edge.n2.id] = {
            node: edge.n2,
            cost: edge.cost,
        };
        this.graph[edge.n2.id].neighbors[edge.n1.id] = {
            node: edge.n1,
            cost: edge.cost,
        };
    }
    getCost(n1, n2) {
        var _a, _b;
        if (n1.id === n2.id)
            return 0;
        return ((_b = (_a = this.graph[n1.id]) === null || _a === void 0 ? void 0 : _a.neighbors[n2.id]) === null || _b === void 0 ? void 0 : _b.cost) || Infinity;
    }
}
