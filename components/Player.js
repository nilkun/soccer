import STATES from "./states/Player.js";
import { playerConstants as C } from "./Constants.js";
import Vector from "../../shared/engine/Vector.js";

export default class Player {
    constructor(homeIndex, team) {

        // Info about player
        this.name;
        this.number;

        // Mobility
        this.position = new Vector(C.x, C.y+8);
        this.velocity = new Vector();
        this.heading = new Vector();
        this.target = new Vector();
        this.side = new Vector();
        // target points to somebody or something else's position, should never be directly modified!!!

        this.state = STATES["returnToHomeRegion"]; // To avoid exit bug
        // head size
        this.radius = 5;
        this.homeIndex = homeIndex;        
        // Write here if used
        this.team = team;

        // PLAYER STATS
        this.mass = 1;
        this.maxSpeed = 3;
        this.maxDribbleForce = this.maxSpeed * 3;
        this.maxPassingForce = 15;
        this.maxShotDistanceSq = 3000;

        // Steering booleans        
        this.arriveIsOn = false;
        this.seekIsOn = false;
        this.pursuitIsOn = false;
    }

    setTarget(target) {
        this.target = target;
    }

    arrive() { 
        const distanceToTarget = this.target.subtracted(this.position);
        const distance = distanceToTarget.magnitude();
        const deceleration = 20;

        if(distance > 0) {
            let speed = distance / deceleration;
            if(speed > this.maxSpeed) speed = this.maxSpeed;
            return distanceToTarget
                .scaled(speed/distance)
                .subtracted(this.velocity);
        }
        return new Vector;
    }

    update(elapsedTime = 1) {
        this.state.execute(this);
        // console.log(this.name)

        const steeringForce = this.steering();
        const acceleration = steeringForce.scaled(1/this.mass);

        // Update velocity and set position
        this.velocity.add(acceleration.scaled(elapsedTime));

        this.velocity.truncate(this.maxSpeed);
        this.position.add(this.velocity.scaled(elapsedTime));
        
        if (this.isColliding()) {
            this.position.subtract(this.velocity.scaled(elapsedTime))
            // console.log("colliding")
        }
        else {
            const magSquared = this.velocity.x**2 + this.velocity.y**2;
            if(magSquared > 0.00000001) {
                this.heading = this.velocity.normalized();
                this.side = this.heading.perpendicularClockwise();
            }
        }

    }
    isColliding() {
        const mag = (this.radius + this.radius)**2;
        // console.log(mag);
        for(let i = 0; i < 5; i++) {
            if(mag > this.position.distanceSq(this.team.opponents.players[i].position)) return true;
            // console.log(this.position.distanceSq(this.team.opponents.players[i]));
        }
        return false;
    }

    render(renderer) {

        // shoulders
        renderer.beginPath();
        renderer.fillStyle = "black";
        renderer.arc(this.position.x + this.side.x * 4, this.position.y + this.side.y * 4, this.radius/2, 0, Math.PI * 2);
        renderer.arc(this.position.x - this.side.x * 4, this.position.y - this.side.y * 4, this.radius/2, 0, Math.PI * 2);
        renderer.fill();

        // nose
        renderer.beginPath();
        renderer.fillStyle = this.team.noseColor
        renderer.arc(this.position.x+ this.heading.x * 6, this.position.y+ this.heading.y * 5, this.radius/4, 0, Math.PI * 2);
        renderer.fill();

        //head
        renderer.beginPath();
        renderer.fillStyle = this.team.color;
        renderer.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        renderer.fill();
    }

    steering() {
        // COULD DO CALCULATIONS AFTER ALL VECTORS ARE ADDED?
        let steeringForce = new Vector();
        if(this.arriveIsOn) steeringForce.add(this.arrive());
        if(this.seekIsOn) steeringForce.add(this.seek());
        if(this.pursuitIsOn) steeringForce.add(this.pursuit());
        return steeringForce;
    }




    setHomeRegionAsTarget(region) {
        this.target.replace(region[this.homeRegion].center);
    }
    // setState(state) {
    //     this.state.exit(this);
    //     this.state = PlayerStates[state];
    //     this.state.enter(this);
    // }
    changeState(state) {
        this.state.exit(this);
        this.state = STATES[state];
        this.state.enter(this);
    }
    arriveOn() {
        this.arriveIsOn = true;
    }
    arriveOff() {
        this.arriveIsOn = false;
    }
    seekOn() {
        this.seekIsOn = true;
    }
    seekOff() {
        this.seekIsOn = false;
    }
    pursuitOn() {
        this.pursuitIsOn = true;
    }
    pursuitOff() {
        this.pursuitIsOn = false;
    }
    atTarget() {

        // all this to avoid slowing down too much before target.
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const tX = Math.floor(this.target.x);
        const tY = Math.floor(this.target.y);
        // return Math.floor(this.position.x) === Math.floor(this.target.x) && Math.floor(this.position.y) === Math.floor(this.target.y)
        return(x <= tX + 1 && x >= tX - 1 && y <= tY + 1 && y >= tY - 1)
    }
    isClosestTeamMemberToBall() {
        return this.team.playerClosestToBall === this;
    }

    ballWithinReceivingRange() {
        let x = Math.abs(this.position.x - this.team.info.ball.position.x);
        let y = Math.abs(this.position.y - this.team.info.ball.position.y);
        let radius = C.passRangeSq;
        let hyp = x*x + y*y;
        return radius > hyp;
    }
    ballWithinKickingRange() {
        let x = Math.abs(this.position.x - this.team.info.ball.position.x);
        let y = Math.abs(this.position.y - this.team.info.ball.position.y);
        let radius = C.kickRangeSq;
        let hyp = x*x + y*y;
        return radius > hyp;
    }
    isReadyForNextKick() {
        if(C.timer-Date.now() < C.coolingTime) {
            return false;            
        }
        C.timer = Date.now();
        return true;

    }

    getShotPower() {
        // implement magic formula
        return 30;
    }

    trackBall() {

        const targetHeading = this.team.info.ball.position.subtracted(this.position).normalized();

        // const currentHeading = this.heading;

        // const currentAngle = this.heading.angle();
        // const targetAngle = targetHeading.angle();
        // const diff =  targetAngle+currentAngle;
        // const maxTurn = 0.02;
        // if(diff < 0) {
        //     this.heading.rotate(diff < -maxTurn ? -maxTurn : diff)
        // }
        // else if(diff > 0) {
        //     this.heading.rotate(diff > maxTurn ? maxTurn : diff)
        // }
        // console.log(diff)
        this.heading = targetHeading;
        // const location = this.team.info.ball.position.normalized().subtracted(this.position.normalized());
        // const neededAngle = this.heading.subtracted(location).angle();
        // console.log(targetAngle, currentAngle);
        // this.heading = targetHeading;

        this.side = this.heading.perpendicularClockwise();
        // update the heading to follow the ball (but not too fast)
    }


    addNoiseToKick(position, target) {
        // NO NOISE YET
        return target;
    }

    canShootAtGoal() {
        const distanceToGoal = this.team.opponentsGoal.subtracted(this.position);
        // console.log(this.position.distanceSq(this.team.info.opponentsGoal))
        if(this.position.distanceSq(this.team.info.opponentsGoal) < this.maxShotDistanceSq) return distanceToGoal.normalized();
        return false;
    }

    isThreatened() {
            // console.log(this.team.opponents.players[0])
        for(let i = 0; i < this.team.opponents.players.length; i++) {
            const current = this.team.opponents.players[i];
            const dotProduct = this.position.dot(current.position);
            if(dotProduct > 0 && this.position.distanceSq(current.position) < C.comfortZone) return true;
        }
        return false;
    }

    seek() {
        // Target is a vector
        return this.target.subtracted(this.position)
            .normalized()
            .scaled(this.maxSpeed)
            .subtracted(this.velocity);
    }




    inHotRegion() {

    }

    findSupport() {

    }





 

    isControllingPlayer() {
        return this === this.team.controllingPlayer;
    }


    pursuit() {
        const distanceToTarget = this.lockedOn.position.subtracted(this.position);
        const relativeHeading = this.heading.dot(this.lockedOn.heading);
        
        if((distanceToTarget.dot(this.heading) > 0)
            && relativeHeading < -0.95) { //acos(0.95) = 18 degrees;
                return this.target.subtracted(this.position)
                    .normalized()
                    .scaled(this.maxSpeed)
                    .subtracted(this.velocity);
            }
        const lookAheadTime = distanceTothis.lockedOn.magnitude() / (this.maxSpeed + this.lockedOn.maxSpeed);
        this.target = this.lockedOn.position.added(this.lockedOn.velocity.scaled(lookAheadTime)); 
        
        return this.target.subtracted(this.position)
            .normalized()
            .scaled(this.maxSpeed)
            .subtracted(this.velocity);
    }


    onMessage(action, position, otherPlayer) {
        // console.log("You've got mail")
        switch(action) {
            case "receiveBall": {
                this.target.replace(position);
                this.changeState("receiveBall");
                // console.log("I'm receiving the ball.")
                return true;
            }
            case "supportAttacker": {
                if(this.state===PlayerStates["supportAttacker"]) return true;
                this.target.set(this.team.bestSupportingPosition());
                this.changeState("supportAttacker");
                return true;
            }
            case "goHome": {
                this.target = this.homeRegion;
                this.changeState("returnToHomeRegion");
                return true;
            }
            case "wait": {
                this.state = states["wait"];
                return true;
            }
            case "passToMe": {
                if(!this.ballWithinKickingRange()) return true;
                // console.log("passing")
                // console.log("1. " + position.x + " 2. " + otherPlayer + " 3. " + otherPlayer.position.x);
                // console.log("I'm passing the ball: ",otherPlayer.position - this.team.pitch.ball.position);
                this.team.pitch.ball.kick(otherPlayer.position
                    .subtracted(this.team.pitch.ball.position)
                    .normalized(),
                    this.maxPassingForce);
                otherPlayer.onMessage("receiveBall", otherPlayer.position);
                this.changeState("wait");
                this.findSupport();
                C.timer = Date.now();
                return true;
            }
        }
        return false;
    }
        globalExecute() {
            if(this.ballWithinReceivingRange() && this.team.controllingPlayer === this) {
                this.maxSpeed = this.maxSpeedWithBall;
            }
        }

}
