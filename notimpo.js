shotTarget = opponentsGoal.center();

            const minYval = opponentsGoal.leftPost.y + ball.radius;
            const maxYval = opponentsGoal.rightPost.y




        if(player.team.inControl() && !player.isControllingPlayer() && player.isAheadOfAttacker()) {
            player.team.requestPass(player);

            return;
        }
        if(player.pitch.gameOn()) {
            if(player.isClosestTeamMemberToBall() && player.team.receiver === "" && !player.pitch.goalKeeperHasBall()) {
                // Can be bug? arriveOn()
                player.state = player.states["chaseBall"];
                return;
            }
        }
    }