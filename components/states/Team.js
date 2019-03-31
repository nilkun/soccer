class PrepareForKickOff {
    enter(team) {
        team.returnHome();
    }
    execute(team) {
        if(team.allPlayersAtHome() ){ // ONE TEAM ATM && team.opponents.allPlayersAtHome()) {
            console.log("ready for kickoff");
            team.changeState("defending");
            team.pitch.kickoff();
            // this will be run twice.. change state at kickoff instead?
        }
    }
    exit() {}
}

class Defending {
    enter(team) {
        console.log("Defending")
    }
    execute(team) {
    }
    exit(team) {}
}

class Attacking {
    enter(team) {
    }
    execute(team) {
    }
    exit(team) {}
}

export const STATES = {
    defending: new Defending(),
    attacking: new Attacking(),
    prepareForKickOff: new PrepareForKickOff()
};