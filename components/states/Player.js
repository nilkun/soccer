import Vector from "../../../shared/engine/Vector.js";

// import { playerConstants as C } from "../Constants.js";



// class ReceiveBall {
//     enter(player) {
//         player.team.receiver = player;
//         player.team.controllingPlayer = player;
//         console.log("receive")
//         // if(player.inHotRegion() || Math.random() < chanceOfUsingArriveTypeReceiveBehavior && !player.team.isOpponentWithinRadius(player.position, C.passThreatRadius)) {
//         //     player.arriveOn();
//         // }
//         // else player.pursuitOn();
//         player.arriveOn();
//     }
//     execute(player) {
//         // console.log(player.ballWithinReceivingRange());
//         if(player.ballWithinReceivingRange() || !player.team.inControl()) {
//             player.changeState("chaseBall");
//             return;
//         }
//         if(player.pursuitIsOn) {
//             player.target.replace(player.team.pitch.ball.position);
//         }
//         if(player.atTarget()) {
//             player.arriveOff();
//             player.pursuitOff();
//             player.trackBall();
//             player.velocity.set(0, 0);
//         }
//     }
//     exit(player) {
//         player.arriveOff();
//         player.pursuitOff();
//     }
// }

class KickBall {
    enter(player) {
        // player.team.controllingPlayer = player;
        
        // console.log(player.name + " kicking")
        if(!player.isReadyForNextKick()) {

            player.changeState("wait");
            // Testing new way
            // player.changeState("chaseBall");
        }
    }
    execute(player) {

        // CHECK IF IN GOOD POSITION TO SHOOT
        let shotTarget;
        // *ADD RANDOM POT SHOTS
        if(shotTarget = player.canShootAtGoal()) {
            // *ADD NOISE
            player.team.info.ball.kick(shotTarget, player.getShotPower());
            player.changeState("returnToHomeRegion");
            return;
        }

        // PASS BALL IF THREATENED
        if(player.isThreatened()) {
            const ranking = player.team.rankPlayers();
            // *RANDOMLY PASS TO THIS GUY/GIRL
            shotTarget = ranking[Math.floor(Math.random() * 4)];
            // *TEMPORARY PASSING FORCE
            const tempPassing = Math.sqrt(shotTarget.magnitude) / 5;

            player.team.info.ball.kick(shotTarget.target.normalized(), tempPassing);
            player.changeState("returnToHomeRegion"); 
            return;       
        }

        else {
            player.changeState("dribble");
        }
    }
    exit(){}
}

class Dribble {
    enter(player){
    }
    execute(player) {
        if(player.isClosestTeamMemberToBall()) {
            
            // THIS IS THE DIRECTION OF THE OPPOSING GOAL
            let dribbleHeading = player.team.opponentsGoal;

            const dot = dribbleHeading.dot(player.heading);

            // TURN AROUND
            if(dot < 0) {
                let direction = player.heading;
                // the sign calculates what direction to turn
                let angle = Math.PI/4 * player.team.opponentsGoal; // * -1; * player.team.homeGoal.facing.sign(player.heading);
                direction.rotate(angle);
                const kickingForce = .8;
                player.team.info.ball.kick(direction, kickingForce);
            }
            else {
                // ball.kick()
                player.team.info.ball.kick(dribbleHeading, player.maxDribbleForce);
            }
            player.changeState("chaseBall");
            return;
        }
        else player.changeState("returnToHomeRegion");
    }
    exit(){}
}

// class SupportAttacker {
//     enter(player) {
//         console.log("support", player.team.bestSupportPosition);
//         player.arriveOn();
//         player.target.replace(player.team.bestSupportingPosition);
//     }
//     execute(player) {

//         if(!player.team.inControl()) {
//             player.changeState("returnToHomeRegion");
//             return;
//         }

//         let temp = player.team.bestSupportingPosition;
//         // console.log(temp)
//         if(temp.x !== player.target.x && temp.y !== player.target.y) {
//             player.target.set(temp);
//             player.arriveOn();
//         }

//         if(player.team.canShoot(player.position, MaxShootingForce)) {
//             player.team.requestPass(player);
//         }
//         if(player.atTarget()) {
//             player.arriveOff();
//             player.trackBall();
//             player.velocity.set(0,0);

//             if(!player.isThreatened()) {
//                 player.team.controllingPlayer.onMessage("passToMe", player.position, player);
//             }
//         }
//     }
//     exit(){}
// }
class ReturnToHomeRegion {
    enter(player) {
        player.target = player.team.regions[player.homeIndex];
        // console.log(player.target);
        player.arriveOn();
    }
    execute(player) {
        player.changeState("wait");
    }
    exit(player) {
        player.arriveOff();  
    }
}

class ChaseBall {
    enter(player) {
        // * cloning to avoid eternal pursuit
        player.target = player.team.info.ball.position.cloned();
        player.seekOn();
        // player.team.controllingPlayer = player;
    }
    execute(player) {
        if(player.ballWithinKickingRange()) {

            // player.changeState("dribble");
            player.changeState("kickBall");
            return;
        }
        // NO KICKING!!!
        if(player.isClosestTeamMemberToBall()) {
            player.target = player.team.info.ball.position;
            return;
        }
        player.changeState("returnToHomeRegion");
    }
    exit(player) {
        player.seekOff();
    }
}

class HandleBall {

}

class Wait {
    enter(player){
    }

    execute(player){
        if(!player.atTarget()) {
            player.arriveOn();
            // return;
        }
        else {
            player.arriveOff();
            player.velocity.set(0, 0);
            player.trackBall();
        }

        // if(player.team.inControl() && !player.isControllingPlayer() && player.isAheadOfAttacker()) {
        //     player.team.requestPass(player);
        //     return;
        // }
        // REQUEST PASSING

        if(player.team.info.gameOn) {
            if(player.isClosestTeamMemberToBall()) {
                // && !player.team.receiver 
                // && !player.pitch.goalKeeperHasBall()) {
                player.changeState("chaseBall");
                return;
            }
        }        
    }
    exit(player){
    }
}

const STATES = {
    "chaseBall": new ChaseBall(),
    "kickBall": new KickBall(),
    "wait": new Wait(),
    // "receiveBall": new ReceiveBall(),
    "dribble": new Dribble(),
    "returnToHomeRegion": new ReturnToHomeRegion(),
    // "supportAttacker": new SupportAttacker(),
    // "globalPlayerState": new GlobalPlayerState()
}

export default STATES;


