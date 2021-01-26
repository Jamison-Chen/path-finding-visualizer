class Graph():
    def __init__(self, nodes=[], edgesAndCosts=[]):
        self.__graph = {}
        for i in nodes:
            d = {}
            for j in nodes:
                d.update({j: 0})
            self.__graph.update({i: d})
        for each in edgesAndCosts:
            self.__graph[each[0]][each[1]] = each[2]
            self.__graph[each[1]][each[0]] = each[2]

    def getGraph(self):
        return self.__graph

    def appendNode(self, n):
        d = {}
        for each in self.__graph:
            self.__graph[each].update({n: 0})
            d.update({each: 0})
        d.update({n: 0})
        self.__graph.update({n: d})

    def appendEdge(self, edge):
        self.__graph[edge[0]][edge[1]] = edge[2]
        self.__graph[edge[1]][edge[0]] = edge[2]

    def getCost(self, n1, n2):
        if self.__graph[n1][n2] != 0:
            return self.__graph[n1][n2]
        elif n1 == n2:
            return 0
        return float('inf')

    def __str__(self):
        result = "\t"
        for each in self.__graph:
            result += (str(each)+"\t")
        result += "\n"
        for each in self.__graph:
            result += (str(each)+"\t")
            for j in self.__graph[each]:
                result += (str(self.__graph[each][j])+"\t")
            result += "\n"
        return result


if __name__ == "__main__":
    n = ["a", "b", "c", "d", "e"]
    ec = [("a", "b", 1), ("a", "e", 1), ("b", "c", 1),
          ("b", "e", 1), ("c", "d", 1), ("d", "e", 1)]
    g = Graph(n, ec)
    print(g)
    g.appendNode("f")
    print(g)
    print(g.getCost("a", "b"))
