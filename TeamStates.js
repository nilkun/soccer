class PrepareForKickOff {
    enter(team) {
        team.receivingPlayer = false;
        team.playerClosestToBall = false;
        team.supportingPlayer = false;
        team.controllingPlayer = false;

        team.returnAllFieldPlayersToHome();
    }
    execute(team) {
        if(team.allPlayersAtHome() && team.opponents.allPlayersAtHome()) {
            team.changeState("defending");
            console.log("Team " + team.color + " is ready.");
            team.pitch.kickoff();
        }
    }
    exit() {}
}

class Defending {
    enter(team) {
        const blueRegions = [1,6,8,3,5];
        const redRegions = [16,9,11,12,14];
        if(team.isHome) team.changePlayerHomeRegions(redRegions);
        else team.changePlayerHomeRegions(blueRegions);

        team.updateTargetsOfWaitingPlayers();
    }
    execute(team) {
        if(team.inControl()) {
            team.changeState("attacking");
        }
    }
    exit() {}
}

class Attacking {
    enter(team) {
        const blueRegions = [1,12,14,4,8];
        const redRegions = [16,3,5,9,13];
        console.log("attack")

        if(team.isHome) team.changePlayerHomeRegions(redRegions);
        else team.changePlayerHomeRegions(blueRegions);

        team.determineBestSupportingPosition();
        team.updateTargetsOfWaitingPlayers();

        // team.setControllingPlayer();

        team.setSupportAttacker();
    }
    execute(team) {
        if(!team.inControl()) {
            team.changeState("defending");
        }

        // Don't update every frame!
        team.determineBestSupportingPosition();
    }
    exit() {}
}

export const states = {
    defending: new Defending(),
    attacking: new Attacking(),
    prepareForKickOff: new PrepareForKickOff()
};