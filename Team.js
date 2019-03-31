import Player from "./Players.js";
import { team as C, pitch as offset } from "./Constants.js";
import { states } from "./TeamStates.js";
import Vector from "../shared/engine/Vector2.js";

export default class Team {
    constructor(isHome, color, pitch, tRegion, ball) {

        // Player pointers
        this.receivingPlayer;
        this.playerClosestToBall;
        this.controllingPlayer;
        this.supportingPlayer;

        this.bestSupportingPosition;
        this.shotTarget;

        this.isHome = isHome;
        this.color = color;
        this.teamRegion = tRegion;
        
        this.opponents;
        this.regions = pitch.regions;
        this.pitch = pitch;

        this.ball = ball;

        // Create players
        this.players = new Array(5);
        for(let i = 0; i < 5; i++) {
            const lineup = this.isHome ? C.homeLineup : C.awayLineup;
            this.players[i] = new Player(lineup[i], this);

        }   

        // Constants
        // this.bestSupportingSpot = C.bestSupportingSpot;
        // this.teamSpot = C.teamSpot;
        // this.passSafeStrength = C.passSafeStrength;
        // this.canScoreStrength = C.canScoreStrength;
        // this.optimalDistance = C.optimalDistance;
        // this.distanceFromControllingPlayerStrength = C.distanceFromControllingPlayerStrength;

        this.state = states["prepareForKickOff"];
    }

    setState(state) {
        // This is only used for first kickoff
        this.state = states[state];
        this.state.enter(this);
    }

    changeState(state) {
        this.state.exit(this);
        this.state = states[state];
        this.state.enter(this);
        // console.log(this.state)
    }

    returnAllFieldPlayersToHome() {
        for(let i = 0; i < 5; i++) {
            this.players[i].target = this.regions[this.players[i].homeRegion].center;
            this.players[i].changeState("returnToHomeRegion");
        }
    }

    update() {
        this.state.execute(this);
        for(let i = 0; i < C.size; i++) this.players[i].update();
    }

    render(renderer) {
        renderer.fillStyle = this.color;
        this.players.forEach(player => {
            renderer.beginPath();
            // 10 is the offset
            renderer.arc(offset.x + player.position.x, offset.y +player.position.y, player.radius, 0, Math.PI * 2);
            renderer.fill();
        })
    }
    
    changePlayerHomeRegions(regions) {
        for(let i = 0; i < 5; i++) this.players[i].homeRegion = regions[i];
    }

    allPlayersAtHome() {
        for(let i = 0; i < 5; i++) {
            if(Math.floor(this.players[i].position.x) !== Math.floor(this.regions[this.players[i].homeRegion].center.x) 
                && Math.floor(this.players[i].position.y) !== Math.floor(this.regions[this.players[i].homeRegion].center.y)) {
                return false; }
        }
        return true;
    }

    updateTargetsOfWaitingPlayers() {
        // For waiting and returnToHomeRegion
        // Similar to returnAllFieldPlayersToHome
        for(let i = 0; i < 5; i++) {
            if(this.players[i].state.constructor.name === "ReturnToHomeRegion"
             || this.players[i].state.constructor.name === "Wait") { 
                this.players[i].target = this.regions[this.players[i].homeRegion].center;
            }
        }
    }

    inControl() {
        return this.ball.owner === this;
    }

    setSupportAttacker() {
        this.supportingPlayer = this.players[3];
        this.supportingPlayer.changeState("supportAttacker");
    }

    determineBestSupportingPosition() {
        // DONT UPDATE EVERY FRAME
        let bestScoreSoFar = 0;
        let bestSupportingRegion;
        

        for(let currentRegion = this.teamRegion; currentRegion < this.teamRegion + 9; currentRegion++) {
            let score = 1;
            if(this.isPassSafeFromAllOpponents(this.regions[currentRegion].center)) {
                score += C.passSafeStrength;
            } 
            if(this.canShoot(this.regions[currentRegion])) {
                score += C.canScoreStrength;
            }
            const dist = this.controllingPlayer.position
                .subtracted(this.regions[currentRegion].center)
                .magnitude();
            const temp = Math.abs(C.optimalDistance - dist);

            if(temp < C.optimalDistance) {
                score += C.distanceFromControllingPlayerStrength * (C.optimalDistance-temp)/C.optimalDistance;
                // console.log(C.distanceFromControllingPlayerStrength);
            }
            if(score > bestScoreSoFar) {
                bestScoreSoFar = score;
                bestSupportingRegion = this.regions[currentRegion];
            }
        }
        this.bestSupportingPosition = bestSupportingRegion.center;
        // console.log(this.bestSupportingPosition);
    }
// console.log("check: " + this.regions[currentRegion].center);
    isPassSafeFromAllOpponents(to) {
        // Could be refactored for efficiency
        for(let i = 0; i < 5; i++) {
            if(!this.isPassSafeFromOpponent(to, this.opponents.players[1])) return false;
        }
        return true;
    }

    pointToLocalSpace(globalPosition, heading, object) {
        // for clarity
        const cos0 = heading.y;
        const sin0 = heading.x;

        let localPosition = new Vector();
        localPosition.replace(object.subtracted(globalPosition));

        let temp = localPosition.x * cos0 - localPosition.y * sin0;
        localPosition.y = localPosition.x * sin0 + localPosition.y * cos0;
        localPosition.x = temp;
        return localPosition;
    }

    //determine...
    isPassSafeFromOpponent(to, opponent) { //(from, target, receiver, opponent, passingForce) {
        // WHOIS receiver???
        // passingForce
        // console.log(to)
        const passingForce = 5;
        const receiver = this.receiver;

        const from = this.ball.position;
        const toTarget = to.subtracted(from);
        const toTargetNormalized = toTarget.normalized();

        const localPosOpp = this.pointToLocalSpace(from, toTargetNormalized, opponent.position); 
        
        if(localPosOpp.x < 0) return true;

        if(from.distanceSq(to) < opponent.position.distanceSq(from)) {
            if(receiver) {
                if(to.distanceSq(opponent.position) > to.distanceSq(receiver.position)) return true;
            }
            else return true;
        }

        let timeForBall = this.ball.timeToCoverDistance(new Vector(), new Vector(localPosOpp.x, 0), passingForce);
        let reach = opponent.maxSpeed * timeForBall + this.ball.radius + opponent.radius;
        if(Math.abs(localPosOpp.y) < reach) return false;
        return true;

    }

    canShoot() {
        // POWER
        const power = 6;

        let numAttempts = C.numAttemptsToFindValidStrike;
        while(0 > numAttempts--) {
            shotTarget = this.opponentsGoal.center();

            const minYval = this.opponentsGoal.leftPost.y + this.ball.radius;
            const maxYval = this.opponentsGoal.rightPost.y - this.ball.radius;

            const cleanUp = maxYval - minYval;
            shotTarget.y = Math.random() * cleanUp + minYval;

            const time = this.ball.timeToCoverDistance(this.ball.position, shotTarget, power);
            if(time > 0) {
                if(isPassSafeFromAllOpponents(shotTarget)) {
                    return true;
                }
            }
        }     
    return false;   
    }

    findPass(passer, receiver, passTarget, power, minPassingDist) {
        let closestToGoalSoFar = Infinity;
        let ballTarget;
        for(let i = 0; i < this.teamMembers; i++) {
            if(team.player[i] !== passer && passer.position.distanceSq(team.player[i]) > minPassingDistance * minPassingdistance) {
                if(this.getBestPassToReceiver(passer, team.player[i], ballTarget, power)) {
                    let distanceToGoal = Math.abs(balltarget.x - this.opponentsGoal.center.x);
                    if(distanceToGoal < closestToGoalSoFar) {
                        closestToGoalSoFar = distanceToGoal;
                        receiver = team.player[i];
                        passTarget = ballTarget;
                    }
                }
            }
        }

        if(receiver) return true;
        else return false;
    }

    getBestPassToReceiver(passer, receiver, passTarget, power) {
        const time = ball.timeToCoverDistance(ball.position, reveicer.position, power);

        if(time <=0) return false;
        let interceptRange = time * receiver.maxSpeed;
        const scalingFactor = 0.3;
        interceptRange *= scalingFactor;
        let ip1, ip2;

        getTangentPoints(receiver.position, interceptRange, ball.posiiton, ip1, ip2);

        const NumPassesToTry = 3;
        let passes = [];
        passes.push(ip1);
        passes.push(receiver.position);
        passes.push(ip2);

        let closestSoFar = Infinity;
        let result = false;

        for(let pass = 0; pass < numPassesToTry; ++pass) {
            let dist = Math.abs(passes[pass].x - this.opponentsGoal.center.x);

            if(dist < closestSoFar &&
                pitch.playingArea.inside(passes[pass]) && this.isPassSafeFromAllOpponents(ball.position, passes[pass], receiver, power)) {
                closestSoFar = dist;
                passTarget = passes[pass];
                result = true;
            }
        }
        return result;

    }
}

