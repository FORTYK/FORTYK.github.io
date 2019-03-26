function init() {
    new GameEngine();
}
class Sprite {
    constructor(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(ctx, x, y) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height, x, y, this.width, this.height);
    }
}
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    difference(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    }
    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        var m = this.magnitude();
        return new Vector(this.x / m, this.y / m);
    }
    multiply(val) {
        return new Vector(this.x * val, this.y * val);
    }
}
class Game {
    constructor(ctx, canvas, sprites) {
        this.ctx = ctx;
        this.sprites = sprites;
        this.mouseX = 250;
        this.mouseY = 250;

        this.mouseStart = new Vector(0, 0);
        this.mouseDiff = new Vector(0, 0);
        this.mouseEnd = new Vector(0, 0);
        this.mouseActive = false;

        this.world = [];
        this.island = [];

        this.camera = new Vector(0, 0);
        this.crash_site = null;
        this.docks = null;
        this.dharma = null;
        this.dharma_sprite = new Sprite(this.sprites, 0, 0, 36, 36);

        this.ctx.font = "16px Arial";



        this.initLevel();

        let self = this;
        canvas.addEventListener('click', function (event) {
            console.log('self :', self);
            self.click(canvas, event);
        }, false);
        canvas.addEventListener('mousedown', function (event) {
            self.mouseDown(event);
        }, false);
        canvas.addEventListener('mouseup', function (event) {
            self.mouseUp(event);
        }, false);
        canvas.addEventListener('mousemove', function (event) {
            self.mouseMove(canvas, event);
        }, false);
    }

    click(canvas, event) {
        this.mouseX = event.pageX - canvas.offsetLeft;
        this.mouseY = event.pageY - canvas.offsetTop;
    }

    mouseDown(event) {
        this.mouseActive = true;

        this.mouseStart.x = this.mouseX;
        this.mouseStart.y = this.mouseY;
    }
    mouseUp(event) {
        this.mouseActive = false;

        this.mouseEnd.x = this.mouseX;
        this.mouseEnd.y = this.mouseY;
    }

    mouseMove(canvas, event) {
        this.mouseDiff.x = this.mouseX;
        this.mouseDiff.y = this.mouseY;

        this.mouseX = event.pageX - canvas.offsetLeft;
        this.mouseY = event.pageY - canvas.offsetTop;

        this.moveCamera();
    }

    moveCamera() {
        if (this.mouseActive) {
            this.camera = this.camera.add(this.mouseDiff.difference(new Vector(this.mouseX, this.mouseY)).multiply(-1));
        }
    }

    initLevel() {
        for (let i = 0; i < 1600; i++) {
            this.world[i] = new Array(1000);
            this.island[i] = new Array(1000);
        }

        let center = new Vector(800, 500);
        noise.seed(Math.random());
        let islandSize = 500;

        for (let i = 0; i < this.world.length; i++) {
            for (let j = 0; j < this.world[i].length; j++) {
                this.world[i][j] = {};
                this.island[i][j] = {};

                let position = new Vector(i, j);
                let value = noise.perlin2(i / 120, j / 120) + 1; // Range of 0 to 2

                if (position.difference(center).magnitude() > islandSize) {
                    //this.world[i][j].c = "#354680";
                    //this.world[i][j].t = "w";
                    this.island[i][j] = null
                } else {
                    // Perlin
                    let perlin_multiplier = 255 / 2;
                    let perlin = Math.round(perlin_multiplier * value);
                    let perlix_hex = Number(perlin).toString(16);
                    if (perlix_hex.length < 2) {
                        perlix_hex = "0" + perlix_hex;
                    }
                    // End - Perlin

                    // Gradient
                    let multiplier = 255 / islandSize; // Color range

                    let gradient = 255 - Math.round(position.difference(center).magnitude() * multiplier);
                    if (gradient < 0) gradient = 0;

                    let hex = Number(gradient).toString(16);
                    if (hex.length < 2) {
                        hex = "0" + hex;
                    }
                    // End - Gradient

                    this.island[i][j].g = perlin + "_" + gradient;

                    this.island[i][j].v = (Math.round(perlin * (gradient / 255))) / (255 / 2);

                    let hex3 = Math.round(perlin * (gradient / 255));
                    hex3 = Number(hex3).toString(16);
                    if (hex3.length < 2) {
                        hex3 = "0" + hex3;
                    }

                    if (this.island[i][j].v > 1.44) {
                        this.island[i][j].c = "#a8a1a1";
                        this.island[i][j].t = "t";
                    } else if (this.island[i][j].v > 1.22) {
                        this.island[i][j].c = "#7f7575";
                        this.island[i][j].t = "m";
                    } else if (this.island[i][j].v > 0.87) {
                        this.island[i][j].c = "#447051";
                        this.island[i][j].t = "f";
                    } else if (this.island[i][j].v > 0.72) {
                        this.island[i][j].c = "#5c986e";
                        this.island[i][j].t = "g";
                    } else if (this.island[i][j].v > 0.63) {
                        this.island[i][j].c = "#e9de78";
                        this.island[i][j].t = "b";
                    } else if (this.island[i][j].v > 0.59) {
                        this.island[i][j].c = "#475fad";
                        this.island[i][j].t = "s";
                    } else if (this.island[i][j].v <= 0.59) {
                        this.island[i][j] = null;
                        this.world[i][j].c = "#354680";
                        this.world[i][j].t = "w";
                        //"#354680";
                        //this.island[i][j].t = "w";
                    }

                    //this.world[i][j].c = "#" + hex3 + hex3 + hex3; // Multiply
                    //this.world[i][j].c = "#" + perlix_hex + perlix_hex + perlix_hex; // Perlin
                    //this.world[i][j].c = "#" + hex + hex + hex; // Gradient
                }
            }
        }

        this.crash_site = this.getPositionInType("b", 12);
        this.dharma = this.getPositionInType("f", 7);
        this.docks = {};
        this.docks.position = this.getPositionInType("s", 1);
        this.docks.closestWater = this.getClosestOfType(this.world, this.docks.position, "w", 30);
        this.docks.closestBeach = this.getClosestOfType(this.island, this.docks.position, "b", 30);

        this.render();
    }
    getClosestOfType(search, position, type, distance) {
        let {
            min,
            max,
            objects
        } = this.getAreaContaining(type);
        let closest = null;
        for (let i = position.x - distance; i < position.x + distance; i++) {
            for (let j = position.y - distance; j < position.y + distance; j++) {
                if (search[i][j] !== null && search[i][j].t === type) {
                    if (closest === null) {
                        closest = new Vector(i, j);
                    } else {
                        if (Math.abs(new Vector(i, j).difference(position).magnitude()) < Math.abs(closest.difference(position).magnitude())) {
                            closest.x = i;
                            closest.y = j;
                        }
                    }
                }
            }
        }
        return closest;
    }
    getPositionInType(type, distance) {
        let found = false;

        let {
            min,
            max,
            objects
        } = this.getAreaContaining(type);

        while (!found) {
            let x = Math.round(Math.random() * (max.x - min.x) + min.x);
            let y = Math.round(Math.random() * (max.y - min.y) + min.y);
            if (objects[x][y] !== null) {
                let position = new Vector(x, y);
                let free = true;

                for (let i = 0; i < distance * 2; i++) {
                    position.x = (x - distance) + i;
                    for (let j = 0; j < distance * 2; j++) {
                        position.y = (y - distance) + j;

                        if (objects[position.x][position.y] === null) {
                            free = false;
                        }
                    }
                }
                if (free) {
                    return new Vector(x, y);
                }
            }
        }
    }
    getAreaContaining(type) {
        let arr = [],
            min = new Vector(1600, 100),
            max = new Vector(0, 0);

        for (let i = 0; i < 1600; i++) {
            arr[i] = new Array(1000);
        }

        for (let i = 0; i < this.island.length; i++) {
            for (let j = 0; j < this.island[i].length; j++) {
                if (this.island[i][j] !== null && this.island[i][j].t === type) {
                    arr[i][j] = this.island[i][j];
                    if (min.x > i) {
                        min.x = i;
                    }
                    if (min.y > j) {
                        min.y = j;
                    }
                    if (max.x < i) {
                        max.x = i;
                    }
                    if (max.y < j) {
                        max.y = j;
                    }
                } else {
                    arr[i][j] = null;
                }
            }
        }
        return {
            min: min,
            max: max,
            objects: arr
        };
    }
    update() {

    }
    render() {
        //console.log(new Vector(this.mouseX, this.mouseY).difference(new Vector(800, 500)).angle() * 180 / Math.PI);
        this.renderBackground();

        for (let i = 0; i < this.world.length; i++) {
            for (let j = 0; j < this.world[i].length; j++) {
                if (this.world[i][j]) {
                    this.ctx.fillStyle = this.world[i][j].c;
                    this.ctx.fillRect(i, j, 1, 1);
                }
            }
        }

        for (let i = 0; i < this.island.length; i++) {
            for (let j = 0; j < this.island[i].length; j++) {
                if (this.island[i][j]) {
                    this.ctx.fillStyle = this.island[i][j].c;
                    this.ctx.fillRect(i, j, 1, 1);
                }
            }
        }

        if (this.crash_site !== null) {
            this.ctx.strokeStyle = "#ff0000";
            this.ctx.strokeRect(this.crash_site.x - 5, this.crash_site.y - 5, 10, 10);
        }

        if (this.dharma !== null) {
            this.dharma_sprite.draw(this.ctx, this.dharma.x - 12, this.dharma.y - 12);
        }

        if (this.docks.position !== null && this.docks.closestWater !== null && this.docks.closestBeach !== null) {
            /*this.ctx.strokeStyle = "#ff0000";
            this.ctx.strokeRect(this.docks.x - 5, this.docks.y - 5, 10, 10);
            */


            this.ctx.lineWidth = 10;
            this.ctx.strokeStyle = "#992716";
            let diff = (this.docks.closestBeach).difference(this.docks.closestWater);
            diff = diff.normalize();

            this.ctx.beginPath();
            let start = diff.multiply(20);
            this.ctx.moveTo(this.docks.closestWater.x - start.x, this.docks.closestWater.y - start.y);
            let end = diff.multiply(8);
            this.ctx.lineTo(this.docks.closestBeach.x + end.x, this.docks.closestBeach.y + end.y);
            this.ctx.stroke();
            this.ctx.lineWidth = 10;
        }

        // docks 

        this.renderHUD();
    }

    renderBackground() {
        this.ctx.fillStyle = "#354680";
        this.ctx.fillRect(0, 0, 1600, 1000);
    }

    convertToHex() {

    }

    renderHUD() {

        this.ctx.fillStyle = "#000";
        let diff = this.docks.closestWater.difference(this.docks.closestBeach);

        this.ctx.fillText("Crash site", this.crash_site.x - 35, this.crash_site.y + 12 + 16);
        this.ctx.fillText("Dharma", this.dharma.x - 28, this.dharma.y + 12 + 16);
        this.ctx.fillText("Dock", this.docks.closestBeach.x + diff.x - 20, this.docks.closestBeach.y + diff.y + 12 + 16);

        //this.ctx.strokeStyle = "#fff";
        //this.ctx.strokeRect(640, 450, 160, 100);
        /*
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("x:" + this.mouseX, 10, 26);
        this.ctx.fillText("y:" + this.mouseY, 10, 42);

        this.ctx.fillRect(this.camera.x - 25, this.camera.y - 25, 50, 50);

        if (this.mouseActive) {
            this.ctx.fillText("start x:" + this.mouseStart.x, 10, 60);
            this.ctx.fillText("start y:" + this.mouseStart.y, 10, 76);

            this.ctx.strokeStyle = "#f00";
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouseStart.x, this.mouseStart.y);
            this.ctx.lineTo(this.mouseX, this.mouseY);
            this.ctx.stroke();
        }
        */
    }
}

class GameEngine {
    constructor(img) {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        var self = this;

        var img = new Image();
        img.onload = function () {
            self.run();
            self.game = new Game(self.ctx, self.canvas, this);
        }
        img.src = "./sheet.png";
    }

    run() {
        var self = this;
        var loop = function () {
            self.game.update();

            window.requestAnimationFrame(loop, self.canvas);
        }
        window.requestAnimationFrame(loop, this.canvas);
    }
}