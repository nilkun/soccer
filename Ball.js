import Pitch from "./Pitch.js";
import Vector from "../shared/engine/Vector2.js";

export default class SoccerBall {
    constructor() {
        this.oldPos;
        this.owner;
        this.mass = 1;
        this.position = new Vector(200, 125);
        this.velocity = new Vector();
        this.friction = 0.8;

    }
    update() {
        // console.log(this.velocity);
        this.velocity.scale(this.friction);
        if(Math.abs(this.velocity.x) > 0.001 || Math.abs(this.velocity.y > 0.1)) this.position.add(this.velocity);
        else this.velocity = new Vector();
    }
    boundaryCollision() {
    }

    kick(direction, force) {
        // console.log(direction.x)
        this.velocity.x = direction.x * force;
        this.velocity.y = direction.y * force;
    }
    timeToCoverDistance(from, to, force = 6) {
        let speed = force / this.mass;

        // v^2 = u^2 + 2ax

        const distanceToCover = from.subtracted(to).magnitude();

        let term = speed * speed + 2.0 * distanceToCover * this.friction;
        if(isNaN(term)) return false;

        let v = Math.sqrt(term);
        return (v-speed) / this.friction;

    }
    futurePosition(time) {
        // x = ut + 1/2at^2, where x = distance, a = friction u = start velocity
        let ut = new Vector(this.velocity.scaled(time));
        // 1/2at^2
        const acc = 0.5 * this.friction * time * time;
        const scalarToVector = this.velocity.normalized().scaled(acc);
        return this.position.added(ut).added(scalarToVector);
    }

    trap(player) {
        // Velocity set to zero

        this.velocity.set(0, 0);
        this.owner = player;
    }

    placeAtPosition(position) {
        this.position.replace(position);
        this.velocity.set(0, 0);
    }


    addNoiseToKick(target, vec) {
        // currently they don't make any mistakes
        return vec.clone();
    }
}
