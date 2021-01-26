const srcColor = "#4285F4";
const destColor = "#DB4437";
const wallColor = "#000";
const exploredColor = "#4fdd98ad";
const borderColor = "#AAA"
const pathColor = "#F4B400";
export class Cell {
    constructor(domElement) {
        this.storedState = {
            isWall: false,
            isSrc: false,
            isDest: false,
            isExplored: false
        }
        this.isWall = false;
        this.isSrc = false;
        this.isDest = false;
        this.isExplored = false;
        this.prevColor = "";
        domElement.style.backgroundColor = "";
        domElement.style.borderColor = borderColor;
    }
    setBlank(domElement) {
        this.isWall = false;
        this.isSrc = false;
        this.isDest = false;
        this.isExplored = false;
        domElement.style.backgroundColor = "";
        domElement.style.borderColor = borderColor;
    }
    setSrc(domElement) {
        this.isWall = false;
        this.isSrc = true;
        this.isDest = false;
        this.isExplored = false;
        domElement.style.backgroundColor = srcColor;
    }
    setDest(domElement) {
        this.isWall = false;
        this.isSrc = false;
        this.isDest = true;
        this.isExplored = false;
        domElement.style.backgroundColor = destColor;
    }
    setWallIfOk(domElement) {
        if (!this.isSrc && !this.isDest) {
            this.isExplored = false;
            this.isWall = !this.isWall;
        }
        if (this.isWall) {
            domElement.style.backgroundColor = wallColor;
            domElement.style.borderColor = wallColor;
        } else if (!this.isSrc && !this.isDest) {
            domElement.style.backgroundColor = "";
            domElement.style.borderColor = borderColor;
        }
    }
    storeState() {
        this.storedState = {
            isWall: this.isWall,
            isSrc: this.isSrc,
            isDest: this.isDest,
            isExplored: this.isExplored
        }
    }
    backToStoredState(i, j, domElement) {
        if (this.storedState.isWall) {
            domElement.style.backgroundColor = wallColor;
            domElement.style.borderColor = wallColor;
            // } else if (this.storedState.isExplored) {
            //     // domElement.style.backgroundColor = this.prevColor;
            //     domElement.style.backgroundColor = exploredColor;
        } else {
            domElement.style.backgroundColor = "";
            domElement.style.borderColor = borderColor;
        }
        this.isWall = this.storedState.isWall;
        this.isSrc = this.storedState.isSrc;
        this.isDest = this.storedState.isDest;
        this.isExplored = this.storedState.isExplored;
    }
}