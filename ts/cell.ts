export default class Cell {
    private static readonly cellClasses = [
        "wall",
        "target",
        "explored",
        "source",
        "path",
    ];
    private prevState: {
        isWall: boolean;
        explored: boolean;
        isShortestPath: boolean;
    };
    private _isWall: boolean;
    private _isSource: boolean;
    private _isTarget: boolean;
    private _explored: boolean;
    private _isShortestPath: boolean;
    public div: HTMLElement;
    public mouseEnterEventListener: EventListener | undefined;
    public mouseDownEventListener: EventListener | undefined;

    public constructor(
        rowNum: number,
        colNum: number,
        sideLengthPercent: number
    ) {
        this.prevState = {
            isWall: false,
            explored: false,
            isShortestPath: false,
        };
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div = document.createElement("div");
        this.div.id = `(${rowNum},${colNum})`;
        this.div.className = "cell";
        this.div.style.width = `${sideLengthPercent}%`;
    }
    public get id(): string {
        return this.div.id;
    }
    public get isWall(): boolean {
        return this._isWall;
    }
    public get isSource(): boolean {
        return this._isSource;
    }
    public get isTarget(): boolean {
        return this._isTarget;
    }
    public get explored(): boolean {
        return this._explored;
    }
    public get isShortestPath(): boolean {
        return this._isShortestPath;
    }
    public get position(): { row: number; col: number } {
        const pos = this.div.id.replace(/\(+|\)+/g, "").split(",");
        return { row: parseInt(pos[0]), col: parseInt(pos[1]) };
    }
    public setBlank(): void {
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.removeAttribute("data-hint-text");
    }
    public setSource(): Cell {
        this.storeState();
        this._isWall = false;
        this._isSource = true;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses);
        this.div.classList.add("source", "with-hint");
        this.div.setAttribute("data-hint-text", "Source");
        return this;
    }
    public setTarget(): Cell {
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = true;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses);
        this.div.classList.add("target", "with-hint");
        this.div.setAttribute("data-hint-text", "Target");
        return this;
    }
    public setExplored(force: boolean = false): void {
        if (!force && this._isWall) return;
        this.storeState();
        this._explored = true;
        if (!force && (this.isSource || this.isTarget)) return;
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.classList.add("explored");
        this.div.removeAttribute("data-hint-text");
    }
    public setShortestPath(force: boolean = false): void {
        if (
            !force &&
            (this.isSource || this.isTarget || this.isWall || !this.explored)
        ) {
            return;
        }
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = true;
        this._isShortestPath = true;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.classList.add("explored", "path");
        this.div.removeAttribute("data-hint-text");
    }
    public setWall(force: boolean = false): void {
        if (!force && (this.isSource || this.isTarget)) return;
        this.storeState();
        if (!this._isWall) {
            this._isWall = true;
            this._isSource = false;
            this._isTarget = false;
            this._explored = false;
            this._isShortestPath = false;
            this.div.classList.remove(...Cell.cellClasses, "with-hint");
            this.div.classList.add("wall");
        } else this.setBlank();
        this.div.removeAttribute("data-hint-text");
    }
    public storeState(): void {
        this.prevState = {
            isWall: this._isWall,
            explored: this._explored,
            isShortestPath: this._isShortestPath,
        };
    }
    public backToPrevState(): void {
        // Only source or target will call this method.
        if (this.prevState.isWall) this.setWall(true);
        else if (this.prevState.isShortestPath) this.setShortestPath(true);
        else if (this.prevState.explored) this.setExplored(true);
        else this.setBlank();
    }
}
