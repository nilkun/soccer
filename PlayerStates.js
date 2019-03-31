import { players as C } from "./Constants.js";

const MaxShootingForce = 10;
const MaxPassingForce = 10;
const MaxDribbleForce = 10;
const ChancePlayerAttemptsPotShot = .3;

class ChaseBall {
    enter(player) {
        player.seekOn();
        player.team.controllingPlayer = player;
        console.log("chaseball" + player);
    }
    execute(player) {
        if(player.ballWithinKickingRange()) {
            player.changeState("kickBall");
            return;
        }
        if(player.isClosestTeamMemberToBall()) {
            player.target = player.team.pitch.ball.position;
            return;
        }
        player.changeState("returnToHomeRegion");
    }
    exit(player) {
        player.seekOff();
    }
}

class Wait {
    enter(player){
        // player.pursuitOff();
        // player.seekOff();
        // player.arriveOff();
        console.log("wait")} //
    execute(player) {

        // player.velocity.set(0, 0);
        // console.log("wait start")
        if(!player.atTarget()) {
            player.arriveOn();
            return;
        }
        else {
            player.arriveOff();
            player.velocity.set(0, 0);
            player.trackBall();
        }

        if(player.team.inControl() && !player.isControllingPlayer() && player.isAheadOfAttacker()) {
            player.team.requestPass(player);
            return;
        }
        if(player.team.pitch.gameOn) {
            if(player.isClosestTeamMemberToBall() 
                && !player.team.receiver 
                && !player.pitch.goalKeeperHasBall()) {
                // Can be bug? arriveOn()
                console.log("gell")
                player.changeState("chaseBall");
                return;
            }
        }
        // console.log("wait end")
    }
    exit(){}
}

class ReceiveBall {
    enter(player) {
        player.team.receiver = player;
        player.team.controllingPlayer = player;
        console.log("receive")
        // if(player.inHotRegion() || Math.random() < chanceOfUsingArriveTypeReceiveBehavior && !player.team.isOpponentWithinRadius(player.position, C.passThreatRadius)) {
        //     player.arriveOn();
        // }
        // else player.pursuitOn();
        player.arriveOn();
    }
    execute(player) {
        // console.log(player.ballWithinReceivingRange());
        if(player.ballWithinReceivingRange() || !player.team.inControl()) {
            player.changeState("chaseBall");
            return;
        }
        if(player.pursuitIsOn) {
            player.target.replace(player.team.pitch.ball.position);
        }
        if(player.atTarget()) {
            player.arriveOff();
            player.pursuitOff();
            player.trackBall();
            player.velocity.set(0, 0);
        }
    }
    exit(player) {
        player.arriveOff();
        player.pursuitOff();
    }
}

class KickBall {
    enter(player) {
        player.team.controllingPlayer = player;
        if(!player.isReadyForNextKick()) {
            player.changeState("chaseBall");
        }
        // console.log("kick")
    }
    execute(player) {
        const toBall = player.team.pitch.ball.position.subtracted(player.position);
        const dot = player.heading.dot(toBall.normalized());

        if(player.team.receiver!=="" || player.pitch.goalKeeperHasBall() || dot < 0) {
            player.changeState("chaseBall");
            return;
        }

        let power = 100 * MaxShootingForce * dot;
        let ballTarget;

        if(player.team.canShoot(ball.position, power, ballTarget) || Math.random() < ChancePlayerAttemptsPotShot) {
            ballTarget = addNoiseToKick(ball.position, ballTarget);
            let kickDirection = balltarget.subtracted(ball.position);
            ball.kick(kickDirection, power);
            player.changeState("wait");
            player.findSupport();
            return;
        }

        let receiver = player.team.receiver;
        power = MaxPassingForce * dot;
        
        if(player.isThreatened() && player.team.canPass()) {
            ballTarget = addNoiseToKick(ball.position, ballTarget);
            let kickDirection = ballTarget.subtracted(ball.position);

            ball.kick(kickDirection, power);
            receiver.onMessage("receiveBall", ballTarget);
            player.changeState("wait");
            player.findSupport();
            return;
        }
        else {
            player.findSupport();
            player.changeState("dribble");
        }
    }
    exit(){}
}

class Dribble {
    enter(){console.log("dribble")}
    execute(player) {
        const dot = player.team.homeGoal.facing.dot(player.heading);

        if(dot < 0) {
            let direction = player.heading.clone();
            let angle = Math.PI/4 * -1 * player.team.homeGoal.facing.sign(player.heading);

            direction.rotateAroundOrigin(angle);
            const kickingForce = 0.8;

            ball.kick(direction, kickingForce);
        }
        else {
            ball.kick(player.team.homeGoal.facing, MaxDribbleForce);
        }
        player.changeState("chaseBall");
        return;
    }
    exit(){}
}

class SupportAttacker {
    enter(player) {
        console.log("support", player.team.bestSupportPosition);
        player.arriveOn();
        player.target.replace(player.team.bestSupportingPosition);
    }
    execute(player) {

        if(!player.team.inControl()) {
            player.changeState("returnToHomeRegion");
            return;
        }

        let temp = player.team.bestSupportingPosition;
        // console.log(temp)
        if(temp.x !== player.target.x && temp.y !== player.target.y) {
            player.target.set(temp);
            player.arriveOn();
        }

        if(player.team.canShoot(player.position, MaxShootingForce)) {
            player.team.requestPass(player);
        }
        if(player.atTarget()) {
            player.arriveOff();
            player.trackBall();
            player.velocity.set(0,0);

            if(!player.isThreatened()) {
                player.team.controllingPlayer.onMessage("passToMe", player.position, player);
            }
        }
    }
    exit(){}
}

class ReturnToHomeRegion {
    enter(player) {
        player.arriveOn();
    }
    execute(player) {
    }
    exit(player) {
        player.arriveOff();  
    }
}
const States = {
    "chaseBall": new ChaseBall(),
    "kickBall": new KickBall(),
    "wait": new Wait(),
    "receiveBall": new ReceiveBall(),
    "dribble": new Dribble(),
    "returnToHomeRegion": new ReturnToHomeRegion(),
    "supportAttacker": new SupportAttacker(),
    // "globalPlayerState": new GlobalPlayerState()
}

export default States;


