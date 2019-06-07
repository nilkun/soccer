import Player from "./Player.js";
import { teamConstants as C } from "./Constants.js";
import { STATES } from "./states/Team.js";
import Vector from "../../shared/engine/Vector.js";
// import Vector from "../shared/engine/Vector2.js";

export default class Team {
    constructor(regions, info, isLeft) {

        // Create players and lineup
        this.players = new Array(C.size);
        this.lineup = [ 0, 1, 2, 3, 4];
        this.lineup = [ 2, 6, 8, 20, 24];
        this.lineup = [ 2, 21, 23, 35, 39];

        this.regions = regions; // a reference to all regions on the pitch
        this.info = info;

        // Set up opponent
        this.opponentsGoal = isLeft ? new Vector(1, 0) : new Vector(-1, 0);
        this.opponents;
        // console.log(isLeft)
        this.color = isLeft ? "black" : "white";
        this.noseColor = isLeft ? "red" : "black";
        if(!isLeft) this.team2setup();

        for(let i = 0; i < C.size; i++) {
            this.players[i] = new Player(this.lineup[i], this);
            this.players[i].arriveOn();
            this.players[i].name = "Player " + i;
            this.players[i].position = new Vector(isLeft ? 100 : 400, 8);
        }  
        
        // Prepare for kickoff
        this.setState("prepareForKickOff");

        // important info
        this.playerClosestToBall;
    }

    team2setup() {
        // this.color = "black";
        this.lineup = [49, 48, 47, 46, 45];

        this.lineup = [ 49-2, 49-21, 49-23, 49-35, 49-39];
        this.lineup = [ 49-2, 49-6, 49-8, 49-20, 49-24];
        // let awayPositions = [];
        // for(let i = 0; i < 5; i++) {
        //     awayPositions.push(100 - this.lineup[i]);
        // }
        // this.lineup = awayPositions;
    }

    setState(state) {
        // This is only used for first kickoff
        this.state = STATES[state];
        this.state.enter(this);
    }

    changeState(state) {
        this.state.exit(this);
        this.state = STATES[state];
        this.state.enter(this);
    }

    returnHome() {
        for(let i = 0; i < C.size; i++) {
            this.players[i].changeState("returnToHomeRegion");
            // console.log(this.players[i].target)
        }
    }

    update() {
        this.getClosestPlayer(); // set who is closest to the ball in the team
        this.state.execute(this);
        for(let i = 0; i < C.size; i++) this.players[i].update();

        // This is excellent for troubleshooting!
        // console.log(this.players[0].target)
    }

    render(renderer) {
        renderer.fillStyle = this.color;
        this.players.forEach(player => {
            player.render(renderer);
        })
    }

    allPlayersAtHome() {
        // check if all players are in home area
        return false;
    }

    getClosestPlayer() {
        // finding closest to ball
        let closest = Infinity;
        for(let i = 0; i < C.size; i++) {
            let current = this.players[i].position.distanceSq(this.info.ball.position);
            if( current < closest) {
                closest = current;
                this.playerClosestToBall = this.players[i];
            }
        }
        // console.log("Closest member is " + this.playerClosestToBall.name)
    }

    rankPlayers() {
        let ranking = [];
        let from = this.playerClosestToBall.position;
        for(let i = 0; i < C.size; i++) {
            if(this.players[i]===this.playerClosestToBall) continue;
            let to = this.players[i].position;
            let current = new Vector();
            current.add(to.subtracted(from));
            ranking.push({ target: current, magnitude: to.distanceSq(from) })
        }

        ranking.sort((a, b) => a - b);            
        return ranking;
    }
 
    











//     changePlayerHomeRegions(regions) {
//         for(let i = 0; i < 5; i++) this.players[i].homeRegion = regions[i];
//     }

//     allPlayersAtHome() {
//         for(let i = 0; i < 5; i++) {
//             if(Math.floor(this.players[i].position.x) !== Math.floor(this.regions[this.players[i].homeRegion].center.x) 
//                 && Math.floor(this.players[i].position.y) !== Math.floor(this.regions[this.players[i].homeRegion].center.y)) {
//                 return false; }
//         }
//         return true;
//     }

//     updateTargetsOfWaitingPlayers() {
//         // For waiting and returnToHomeRegion
//         // Similar to returnAllFieldPlayersToHome
//         for(let i = 0; i < 5; i++) {
//             if(this.players[i].state.constructor.name === "ReturnToHomeRegion"
//              || this.players[i].state.constructor.name === "Wait") { 
//                 this.players[i].target = this.regions[this.players[i].homeRegion].center;
//             }
//         }
//     }

//     inControl() {
//         return this.ball.owner === this;
//     }

//     setSupportAttacker() {
//         this.supportingPlayer = this.players[3];
//         this.supportingPlayer.changeState("supportAttacker");
//     }

//     determineBestSupportingPosition() {
//         // DONT UPDATE EVERY FRAME
//         let bestScoreSoFar = 0;
//         let bestSupportingRegion;
        

//         for(let currentRegion = this.teamRegion; currentRegion < this.teamRegion + 9; currentRegion++) {
//             let score = 1;
//             if(this.isPassSafeFromAllOpponents(this.regions[currentRegion].center)) {
//                 score += C.passSafeStrength;
//             } 
//             if(this.canShoot(this.regions[currentRegion])) {
//                 score += C.canScoreStrength;
//             }
//             const dist = this.controllingPlayer.position
//                 .subtracted(this.regions[currentRegion].center)
//                 .magnitude();
//             const temp = Math.abs(C.optimalDistance - dist);

//             if(temp < C.optimalDistance) {
//                 score += C.distanceFromControllingPlayerStrength * (C.optimalDistance-temp)/C.optimalDistance;
//                 // console.log(C.distanceFromControllingPlayerStrength);
//             }
//             if(score > bestScoreSoFar) {
//                 bestScoreSoFar = score;
//                 bestSupportingRegion = this.regions[currentRegion];
//             }
//         }
//         this.bestSupportingPosition = bestSupportingRegion.center;
//         // console.log(this.bestSupportingPosition);
//     }
// // console.log("check: " + this.regions[currentRegion].center);
//     isPassSafeFromAllOpponents(to) {
//         // Could be refactored for efficiency
//         for(let i = 0; i < 5; i++) {
//             if(!this.isPassSafeFromOpponent(to, this.opponents.players[1])) return false;
//         }
//         return true;
//     }

//     pointToLocalSpace(globalPosition, heading, object) {
//         // for clarity
//         const cos0 = heading.y;
//         const sin0 = heading.x;

//         let localPosition = new Vector();
//         localPosition.replace(object.subtracted(globalPosition));

//         let temp = localPosition.x * cos0 - localPosition.y * sin0;
//         localPosition.y = localPosition.x * sin0 + localPosition.y * cos0;
//         localPosition.x = temp;
//         return localPosition;
//     }

//     //determine...
//     isPassSafeFromOpponent(to, opponent) { //(from, target, receiver, opponent, passingForce) {
//         // WHOIS receiver???
//         // passingForce
//         // console.log(to)
//         const passingForce = 5;
//         const receiver = this.receiver;

//         const from = this.ball.position;
//         const toTarget = to.subtracted(from);
//         const toTargetNormalized = toTarget.normalized();

//         const localPosOpp = this.pointToLocalSpace(from, toTargetNormalized, opponent.position); 
        
//         if(localPosOpp.x < 0) return true;

//         if(from.distanceSq(to) < opponent.position.distanceSq(from)) {
//             if(receiver) {
//                 if(to.distanceSq(opponent.position) > to.distanceSq(receiver.position)) return true;
//             }
//             else return true;
//         }

//         let timeForBall = this.ball.timeToCoverDistance(new Vector(), new Vector(localPosOpp.x, 0), passingForce);
//         let reach = opponent.maxSpeed * timeForBall + this.ball.radius + opponent.radius;
//         if(Math.abs(localPosOpp.y) < reach) return false;
//         return true;

//     }

//     canShoot() {
//         // POWER
//         const power = 6;

//         let numAttempts = C.numAttemptsToFindValidStrike;
//         while(0 > numAttempts--) {
//             shotTarget = this.opponentsGoal.center();

//             const minYval = this.opponentsGoal.leftPost.y + this.ball.radius;
//             const maxYval = this.opponentsGoal.rightPost.y - this.ball.radius;

//             const cleanUp = maxYval - minYval;
//             shotTarget.y = Math.random() * cleanUp + minYval;

//             const time = this.ball.timeToCoverDistance(this.ball.position, shotTarget, power);
//             if(time > 0) {
//                 if(isPassSafeFromAllOpponents(shotTarget)) {
//                     return true;
//                 }
//             }
//         }     
//     return false;   
//     }

//     findPass(passer, receiver, passTarget, power, minPassingDist) {
//         let closestToGoalSoFar = Infinity;
//         let ballTarget;
//         for(let i = 0; i < this.teamMembers; i++) {
//             if(team.player[i] !== passer && passer.position.distanceSq(team.player[i]) > minPassingDistance * minPassingdistance) {
//                 if(this.getBestPassToReceiver(passer, team.player[i], ballTarget, power)) {
//                     let distanceToGoal = Math.abs(balltarget.x - this.opponentsGoal.center.x);
//                     if(distanceToGoal < closestToGoalSoFar) {
//                         closestToGoalSoFar = distanceToGoal;
//                         receiver = team.player[i];
//                         passTarget = ballTarget;
//                     }
//                 }
//             }
//         }

//         if(receiver) return true;
//         else return false;
//     }

//     getBestPassToReceiver(passer, receiver, passTarget, power) {
//         const time = ball.timeToCoverDistance(ball.position, reveicer.position, power);

//         if(time <=0) return false;
//         let interceptRange = time * receiver.maxSpeed;
//         const scalingFactor = 0.3;
//         interceptRange *= scalingFactor;
//         let ip1, ip2;

//         getTangentPoints(receiver.position, interceptRange, ball.posiiton, ip1, ip2);

//         const NumPassesToTry = 3;
//         let passes = [];
//         passes.push(ip1);
//         passes.push(receiver.position);
//         passes.push(ip2);

//         let closestSoFar = Infinity;
//         let result = false;

//         for(let pass = 0; pass < numPassesToTry; ++pass) {
//             let dist = Math.abs(passes[pass].x - this.opponentsGoal.center.x);

//             if(dist < closestSoFar &&
//                 pitch.playingArea.inside(passes[pass]) && this.isPassSafeFromAllOpponents(ball.position, passes[pass], receiver, power)) {
//                 closestSoFar = dist;
//                 passTarget = passes[pass];
//                 result = true;
//             }
//         }
//         return result;

//     }
}

