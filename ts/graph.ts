type BaseNode = { id: string; isWall: boolean };

type Edge<T extends BaseNode> = {
    n1: T;
    n2: T;
    cost: number;
};

type Neighbor<T extends BaseNode> = {
    node: T;
    cost: number;
};

export default class Graph<Node extends BaseNode> {
    private graph: {
        [id: string]: {
            node: Node;
            neighbors: { [id: string]: Neighbor<Node> };
        };
    };
    public constructor(grid: Node[][]) {
        this.graph = {};
        this.build(grid);
    }
    private build(grid: Node[][]): void {
        const h = grid.length;
        const w = grid[0].length;
        const nodes: Node[] = [];
        const edges: Edge<Node>[] = [];
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (!grid[i][j].isWall) {
                    nodes.push(grid[i][j]);
                    if (j + 1 < w && !grid[i][j + 1].isWall) {
                        edges.push({
                            n1: grid[i][j],
                            n2: grid[i][j + 1],
                            cost: 1,
                        });
                    }
                    if (i + 1 < h && !grid[i + 1][j].isWall) {
                        edges.push({
                            n1: grid[i][j],
                            n2: grid[i + 1][j],
                            cost: 1,
                        });
                    }
                }
            }
        }
        nodes.forEach((node) => this.addNode(node));
        edges.forEach((edge) => this.addEdge(edge));
    }
    private addNode(node: Node): void {
        this.graph[node.id] = { node: node, neighbors: {} };
    }
    private addEdge(edge: Edge<Node>): void {
        this.graph[edge.n1.id].neighbors[edge.n2.id] = {
            node: edge.n2,
            cost: edge.cost,
        };
        this.graph[edge.n2.id].neighbors[edge.n1.id] = {
            node: edge.n1,
            cost: edge.cost,
        };
    }
    public get(id: string): (typeof this.graph)[keyof typeof this.graph] {
        return this.graph[id];
    }
    public get keys(): string[] {
        return Object.keys(this.graph);
    }
    public get size(): number {
        return this.keys.length;
    }
    public getNeighborCost(n1: Node, n2: Node): number {
        if (n1.id === n2.id) return 0;
        return this.graph[n1.id]?.neighbors[n2.id]?.cost || Infinity;
    }
}
