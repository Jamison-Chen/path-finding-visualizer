export class Graph {
    constructor(nodes, edgesAndCosts) {
        this.graph = {};
        for (let i = 0; i < nodes.length; i++) {
            this.graph[nodes[i]] = {};
        }
        edgesAndCosts.forEach(each => {
            this.graph[each.n1][each.n2] = each.costs;
            this.graph[each.n2][each.n1] = each.costs;
        });
    }
    appendNode(node) {
        this.graph[node] = {};
    }
    appendEdge(edge) {
        this.graph[edge.n1][edge.n2] = edge.costs;
        this.graph[edge.n2][edge.n1] = edge.costs;
    }
    getCost(n1, n2) {
        if (this.graph[n1][n2] != 0) {
            return this.graph[n1][n2];
        } else if (n1 == n2) {
            return 0;
        }
        return Infinity;
    }

}