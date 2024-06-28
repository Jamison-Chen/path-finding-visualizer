export default class Graph {
    constructor(grid) {
        this.graph = {};
        const graphInfo = this.gridToGraphInfo(grid);
        graphInfo.nodes.forEach((node) => this.addNode(node));
        graphInfo.edgesAndCosts.forEach((each) => this.addEdge(each));
    }
    gridToGraphInfo(grid) {
        const h = grid.length;
        const w = grid[0].length;
        const n = [];
        const e = [];
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (!grid[i][j].isWall) {
                    n.push(grid[i][j]);
                    if (j + 1 < w && !grid[i][j + 1].isWall) {
                        e.push({ n1: grid[i][j], n2: grid[i][j + 1], cost: 1 });
                    }
                    if (i + 1 < h && !grid[i + 1][j].isWall) {
                        e.push({ n1: grid[i][j], n2: grid[i + 1][j], cost: 1 });
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
        if (n1.id === n2.id)
            return 0;
        return this.graph[n1.id]?.neighbors[n2.id]?.cost || Infinity;
    }
}
