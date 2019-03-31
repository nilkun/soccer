import Vector from "../../shared/engine/Vector2.js";

export default class DebugMan {
    constructor() {
        this.position = new Vector(110, 110);
        this.heading = new Vector(1, 0);
        this.velocity = new Vector(0,0)

        // The players shot power;
        // Player stats
        this.power = 15;
        this.passing = 20; // Passing precision;
        this.maxPassingForce = 50; // Passing strenght
        this.maxSpeedWithBall = .5; // Running with ball
        this.maxSpeedWithoutBall = 3; // Running without ball

        this.keys = {};

        this.deg45 = 0.70710678118;
    }
    render(renderer) {
        renderer.fillStyle = "blue";
        renderer.beginPath();
        renderer.arc(this.position.x, this.position.y, 1 * 4, 0, Math.PI * 2);
        renderer.fill();
    }
    setVelocity() {
        if(this.keys["ArrowUp"]) {
            if(this.keys["ArrowLeft"]) {
                this.velocity.set(-this.deg45, -this.deg45);
                this.heading.set(-this.deg45, -this.deg45);
                return;
            }
            else if (this.keys["ArrowRight"]) {
                this.velocity.set(this.deg45, -this.deg45);
                this.heading.set(this.deg45, -this.deg45);
                return;
            }
            else {
                // console.log("Up")
                this.velocity.set(0, -1);
                this.heading.set(0, -1);
                return;
            }
        }
        else if(this.keys["ArrowDown"]) {
            if(this.keys["ArrowLeft"]) {
                this.velocity.set(-this.deg45, this.deg45);
                this.heading.set(-this.deg45, this.deg45);
                return;
            }
            else if (this.keys["ArrowRight"]) {
                this.velocity.set(this.deg45, this.deg45);
                this.heading.set(this.deg45, this.deg45);
                return;
            }
            else {
                this.velocity.set(0, 1);
                this.heading.set(0, 1);
                return;
            }
        }
        else if(this.keys["ArrowLeft"]) {
            this.velocity.set(-1, 0);
            this.heading.set(-1, 0);
            return;
        }
        else if (this.keys["ArrowRight"]) {
            this.velocity.set(1, 0);
            this.heading.set(1, 0);
            return;
        }
        else this.velocity.set(0, 0);
        // keep heading the same direction
    }
    update() {
        this.position.add(this.velocity.scaled(this.maxSpeedWithoutBall));
    }

    untag(direction) {
        this.keys[direction] = false;
        this.setVelocity();
    }
    tag(direction) {
        this.keys[direction] = true;
        this.setVelocity();
    }

}