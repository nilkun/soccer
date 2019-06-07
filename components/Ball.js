import Vector from "../../shared/engine/Vector.js"

const C = {

};

export default class Ball {
    constructor() {
        this.position;
        this.velocity = new Vector();  
        this.radius;  
        
        this.friction = 0.8;
    }
    outOfBounds(pitch) {
        if(this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = -this.velocity.x;
        }
        else if(this.position.x > pitch.width) {
            this.position.x = pitch.width;
            this.velocity.x = -this.velocity.x;
        }
        if(this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = -this.velocity.y;
        }
        else if(this.position.y > pitch.height) {
            this.position.y = pitch.height;
            this.velocity.y = -this.velocity.y;
        }
    }
    render(renderer) {
        renderer.beginPath();
        renderer.fillStyle = this.color;
        renderer.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        renderer.fill();
    }
    update(elapsedTime = 1, pitch) {
        const scalar = this.friction; // / elapsedTime;
        this.velocity.scale(scalar);
        if(Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.y) > 0.05) this.position.add(this.velocity);
        else this.velocity = new Vector();

        // console.log(scalar);
        this.outOfBounds(pitch);
    }
    // kick(who, target) {
    //     if(this.position.distanceSq(who.position)<15*15) {
    //         this.velocity.x = who.heading.x * who.power;
    //         this.velocity.y = who.heading.y * who.power;
            
    //     }
    // }
    kick(direction, force) {
        // console.log(direction.x)
        this.velocity.x = direction.x * force;
        this.velocity.y = direction.y * force;
    }
}
