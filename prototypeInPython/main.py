import graph
import copy


class mapPathSearch():
    def __init__(self, n, e):
        # self.n = ["u", "v", "w", "x", "y", "z"]
        # self.e = [("u", "v", 7), ("u", "w", 3), ("u", "x", 5),
        #           ("v", "w", 3), ("v", "y", 4),
        #           ("w", "x", 4), ("w", "y", 8),
        #           ("x", "y", 7), ("x", "z", 9),
        #           ("y", "z", 2)]
        self.n = n
        self.e = e
        self.map = graph.Graph(nodes=self.n, edgesAndCosts=self.e)

    def dijkstra(self, n, m=None):
        shortestD = {n: 0}
        shortestPath = {n: [n]}
        unsolved = copy.deepcopy(self.n)
        unsolved.remove(n)
        for each in unsolved:
            if self.map.getGraph()[each][n] != 0:
                shortestD.update({each: self.map.getGraph()[each][n]})
                shortestPath.update({each: [n, each]})
            else:
                shortestD.update({each: float('inf')})
        while len(unsolved) != 0:
            minD = float('inf')
            w = None
            for each in unsolved:
                if shortestD[each] < minD:
                    w = each
                    minD = shortestD[w]
            if w != None:
                unsolved.remove(w)
            else:
                break
            for v in self.map.getGraph()[w]:
                if self.map.getGraph()[w][v] != 0 and v in unsolved:
                    prev = shortestD[v]
                    shortestD[v] = min(prev, minD + self.map.getCost(w, v))
                    if shortestD[v] != prev:
                        newPath = copy.deepcopy(shortestPath[w])
                        newPath.append(v)
                        shortestPath[v] = newPath
        if m:
            try:
                return shortestD[m], shortestPath[m]
            except:
                print("Unreachable Destination")
                return float('inf'), [n]
        return shortestD, shortestPath


def arrary2graph(anArray):
    h = len(anArray)
    w = len(anArray[0])
    n = []
    e = []
    for i in range(h):
        for j in range(w):
            if anArray[i][j] != 1:
                n.append((i, j))
                if j+1 < w and anArray[i][j+1] != 1:
                    e.append(((i, j), (i, j+1), 1))
                if i+1 < h and anArray[i+1][j] != 1:
                    e.append(((i, j), (i+1, j), 1))
    return n, e


def printPathString(distance, path):
    result = str(distance) + "\n"
    i = 0
    for i in range(len(path)-1):
        result += "%s -> " % str(path[i])
    result += str(path[-1])
    print(result)


def pathVisualize(map, path):
    localMap = copy.deepcopy(map)
    localMap[path[0][0]][path[0][1]] = "☆"
    i = 0
    for i in range(1, len(path)-1):
        if path[i+1][0] != path[i][0]:
            localMap[path[i][0]][path[i][1]] = "|"
        else:
            localMap[path[i][0]][path[i][1]] = "_"
    localMap[path[-1][0]][path[-1][1]] = "★"
    mapVisualize(localMap)


def mapVisualize(map):
    for each in map:
        print(*each)


arrayMap = []
shape = (10, 10)
for i in range(shape[0]):
    row = []
    for j in range(shape[1]):
        row.append(0)
    arrayMap.append(row)
arrayMap[0][3] = 1
arrayMap[1][3] = 1
arrayMap[1][2] = 1
arrayMap[1][1] = 1
arrayMap[2][1] = 1
arrayMap[2][0] = 1
arrayMap[3][1] = 1
arrayMap[3][2] = 1
arrayMap[3][3] = 1
arrayMap[3][4] = 1
arrayMap[3][5] = 1
arrayMap[2][5] = 1
arrayMap[1][5] = 1
# mapVisualize(arrayMap)
n, e = arrary2graph(arrayMap)
m = mapPathSearch(n, e)
dijDist, dijPath = m.dijkstra((6, 1), (2, 2))
# printPathString(dijDist, dijPath)
# print("-------------------------")
pathVisualize(arrayMap, dijPath)
