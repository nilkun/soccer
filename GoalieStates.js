const GoalKeeperTendingDistance = 10;

export default States = {
    "globalKeeperState": GlobalKeeperState(),
    "tendGoal": TendGoal(),
    "returnHome": ReturnHome(),
    "putBallBackInPlay": PutBallBackInPla(),
    "interceptBall": InterceptBall(),
}

class GlobalKeeperState {
    execute(player) {
        if(player.message) this.onMessage();
    }
    onMessage(message, keeper, position) {
        switch(message) {
            case "goHome": {
                keeper.setDefaultHomeRegion();
                keeper.state = keeper.states["returnHome"];
                break;
            }
            case "receiveBall": {
                keeper.state = keeper.states["interceptBall"];
                break;
            }
        }
        return false;
    }
}

class TendGoal {
    enter(goalie) {
        goalie.interposeOn(GoalKeeperTendingDistance);
        goalie.target.set(getRearInterposeTarget());
    }
    execute(goalie) {
        goalie.target.set(keeper.getRearInterposeTarget());
        if(goalie.ballWithinPlayerRange()) {
            goalie.ball.trap();
            goalie.pitch.setGoalKeeperHasBall(true);
            goalie.stae = gooalie.staes["putBackInPlay"];
            return;
        }
        if(goalie.ballWitinRangeForIntercept()) {
            goalie.state = goalie.states["interceptBall"];
        }
        if(goalie.tooFarFromGoalMouth() && goalie.team.inControl()) {
            goalie.state = goalie.states["returnHome"];
            return;
        }
    }
    exit(goalie) {
        goalie.interposeOff();
    }
}

class ReturnHome {
    enter(goalie) {
        goalie.arriveOn();
    }
    execute(goalie) {
        goalie.target.set(goalie.homeRegion.center());

        if(goalie.inHomeRegion() || !goalie.team.inControl()) {
            goalie.state = goalie.states["tendGoal"];
        }
    }
    exit(goalie) {
        goalie.arriveOff();
    }
}

class PutBallBackInPlay {
    enter(goalie) {
        goalie.team.controllingPlayer = goalie;

        goalie.team.opponents.returnAllFieldPlayersToHome();
        goalie.team.returnAllFieldPlayersToHome();
    }
    execute(goalie) {
        let receiver;
        let ballTarget;

        if(goalie.team.findPass(goalie, ballTarget, receiver)) {
            ball.kick(ballTarget.subtracted(ball.position).normalized(), MaxPassingForce);
            goalie.pitch.getGoalKeeperHasBall(false);
            receiver.onMessage("receiveBall", ballTarget);

            goalie.state = goalie.states["tendGoal"];

            return;
        }
        goalie.velocity.set(0,0);
    }
}

class InterceptBall {
    enter(goalie) {
        goalie.pursuitOn();
    }
    execute(goalie) {

        if(goalie.tooFarFromGoalMouth() && !goalie.closestPlayerOnPitchToBall()) {
            goalie.state = golie.states["returnHome"];
            return;
        }
        if(goalie.ballWithinPlayerRange()) {
            ball.trap();
            goalie.pitch.setGoalKeeperHasBall(true);
            goalie.state = goalie.states["putBallBackInPlay"];
            return;
        }        
    }
    exit(goalie) {
        goalie.pursuitOff();
    }
}
