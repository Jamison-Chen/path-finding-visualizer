export default class MinHeap<T> {
    private heap: T[];
    private keyFunction: (el: T) => number;
    public constructor(arr: T[], keyFunction: (el: T) => number) {
        this.keyFunction = keyFunction;
        this.heap = [];
        let depth = Math.floor(Math.log2(arr.length));
        while (arr.length > 0) {
            for (let i = 2 ** depth - 1; i < arr.length; i++) {
                this.heap[i] = arr.pop()!;
                this.downHeap(i);
            }
            depth--;
        }
    }
    private downHeap(startIndex: number): void {
        while (startIndex * 2 + 1 < this.heap.length) {
            const keyStart = this.keyFunction(this.heap[startIndex]);
            const l = startIndex * 2 + 1;
            const keyLeft = this.keyFunction(this.heap[l]);
            if (startIndex * 2 + 2 < this.heap.length) {
                const r = startIndex * 2 + 2;
                const keyRight = this.keyFunction(this.heap[r]);
                if (keyLeft <= keyRight && keyLeft < keyStart) {
                    [this.heap[startIndex], this.heap[l]] = [
                        this.heap[l],
                        this.heap[startIndex],
                    ];
                    startIndex = l;
                } else if (keyRight < keyStart) {
                    [this.heap[startIndex], this.heap[r]] = [
                        this.heap[r],
                        this.heap[startIndex],
                    ];
                    startIndex = r;
                } else break;
            } else if (keyLeft < keyStart) {
                [this.heap[startIndex], this.heap[l]] = [
                    this.heap[l],
                    this.heap[startIndex],
                ];
                startIndex = l;
            } else break;
        }
    }
    private upHeap(startIndex: number): void {
        while (startIndex > 0) {
            const parentIndex = Math.floor((startIndex - 1) / 2);
            if (
                this.keyFunction(this.heap[startIndex]) <
                this.keyFunction(this.heap[parentIndex])
            ) {
                [this.heap[startIndex], this.heap[parentIndex]] = [
                    this.heap[parentIndex],
                    this.heap[startIndex],
                ];
                startIndex = parentIndex;
            } else break;
        }
    }
    public push(value: T): void {
        this.heap.push(value);
        this.upHeap(this.heap.length - 1);
    }
    public pop(): T {
        if (this.heap.length === 0) throw Error("Empty Heap");
        if (this.heap.length === 1) return this.heap.pop()!;
        const result = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.downHeap(0);
        return result;
    }
    public peek(): T {
        return this.heap[0];
    }
    public get size(): number {
        return this.heap.length;
    }
}
