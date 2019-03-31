import PlayerStates from "./PlayerStates.js";
import { players as C } from "./Constants.js";
import Vector from "../shared/engine/Vector2.js";

export default class Player {
    constructor(homeRegion, team) {

        this.position = new Vector(C.x, C.y+8);
        this.homeRegion = homeRegion;
        this.radius = 8;

        this.target = new Vector(); 

        this.mass = 1;
        this.velocity = new Vector();

        // TODO
        this.heading = new Vector();
        this.team = team;
        this.lockedOn;
        this.deceleration = 1;
        this.steering;
        this.state = PlayerStates["returnToHomeRegion"];


        this.maxSpeed = 10;
        this.maxPassingForce = 50;
        this.maxSpeedWithBall = 5;
        this.maxSpeedWithoutBall = 10;

        this.arriveIsOn = false;
        this.seekIsOn = false;
        this.pursuitIsOn = false;
        this.message = false;
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
        this.state = PlayerStates[state];
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
        return Math.floor(this.position.x) === Math.floor(this.target.x) && Math.floor(this.position.y) === Math.floor(this.target.y)
    }

    steering() {
        let steeringForce = new Vector();
        if(this.arriveIsOn) steeringForce.add(this.arrive());
        if(this.seekIsOn) steeringForce.add(this.seek());
        if(this.pursuitIsOn) steeringForce.add(this.pursuit());
        return steeringForce;
    }

    update(elapsedTime = 1, renderer) {
        if(this.message) {
            this.message = false;
        }

        this.state.execute(this);
        // console.log(this.position)
        const steeringForce = this.steering();
        const acceleration = steeringForce.scaled(1/this.mass);
        this.velocity = new Vector();
        this.velocity.add(acceleration.scaled(elapsedTime));

        this.velocity.truncate(this.maxSpeed);
        this.position.add(this.velocity.scaled(elapsedTime));

        const magSquared = this.velocity.x**2 + this.velocity.y**2;
        if(magSquared > 0.00000001) {
            this.heading = this.velocity.normalized();
            this.side = this.heading.perpendicularClockwise();
        }
        // Fix heading?
        else if(this.isTracking) console.log("watching");
    }

    arrive() {
        // console.log(this.target)
        const distanceToTarget = this.target.subtracted(this.position);
        const distance = distanceToTarget.magnitude();

        if(distance > 0) {
            let speed = distance * this.deceleration;
            if(speed > this.maxSpeed) speed = this.maxSpeed;
            return distanceToTarget.scaled(speed/distance);
        }
        return new Vector;
    }


    trackBall() {
        // update the heading to follow the ball (but not too fast)
    }

    inHotRegion() {

    }
    isThreatened() {
        return false;
    }
    findSupport() {

    }


    ballWithinReceivingRange() {
        let x = Math.abs(this.position.x - this.team.pitch.ball.position.x);
        let y = Math.abs(this.position.y - this.team.pitch.ball.position.y);
        let radius = 8 * 8;
        let hyp = x*x + y*y;
        return radius > hyp;
    }
    ballWithinKickingRange() {
        let x = Math.abs(this.position.x - this.team.pitch.ball.position.x);
        let y = Math.abs(this.position.y - this.team.pitch.ball.position.y);
        let radius = 8 * 8;
        let hyp = x*x + y*y;
        return radius > hyp;
    }

    isClosestTeamMemberToBall() {
        for(let i = 0; i < 5; i++) {
            if(this.team.players[i].position.distanceSq(this.team.pitch.ball) < this.position.distanceSq(this.team.pitch.ball)
             && this!==this.team.players[i]) {
                return false;
            }
        }
        return true;
    }

    isReadyForNextKick() {
        if(C.timer-Date.now() < C.coolingTime) {
            return false;            
        }
        C.timer = Date.now();
        return true;

    }

    isControllingPlayer() {
        return this === this.team.controllingPlayer;
    }



    seek() {
        // Target is a vector
        return this.target.subtracted(this.position)
            .normalized()
            .scaled(this.maxSpeed)
            .subtracted(this.velocity);
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