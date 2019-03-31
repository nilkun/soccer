
import Vector from "../shared/engine/Vector2.js";
import Team from "./Team.js";
import Ball from "./Ball.js";

import { pitch as C }  from "./Constants.js"

export default class Pitch { 
    constructor() {

        // Offset in canvas
        this.x = C.x;
        this.y = C.y;

        this.color = C.color;

        // pitch size
        this.sizeX = C.sizeX;
        this.sizeY = C.sizeY;

        // Objects
        this.ball = new Ball();
        this.homeTeam;
        this.awayTeam;
        this.goal1;
        this.goal2;

        // Completed
        this.regions = [];

        // booleans
        this.keeperHasBall = false;
        this.gameOn = false;

        // Create regions
        this.initRegions();
        this.initTeams();

        this.debug;

    }
    update() {
        this.ball.update();
        this.homeTeam.update();
        this.awayTeam.update();
        this.debug.innerHTML = this.ball.position.x + " " + this.ball.position.y + " vs " +this.homeTeam.players[2].target.x;
    }
    kickoff() {  
        console.log("Team red always win the coinflip");
        this.gameOn=true;
        this.homeTeam.players[1].target = new Vector(C.sizeX/2 - 8, C.sizeY/2 + 8);
        this.homeTeam.players[2].target = new Vector(C.sizeX/2 + 8, C.sizeY/2 - 20);
        while(!this.homeTeam.players[1].atTarget() && !this.homeTeam.players[2].atTarget()){
            // move this logic somewhere else
            this.update();
            // this.render(renderer);
        }

        // INLINE CODE
        this.homeTeam.receiver = this.homeTeam.players[2];

        this.homeTeam.controllingPlayer = this.homeTeam.players[2];

        // console.log(this.homeTeam.players[3])
        let ballTarget = this.homeTeam.receiver.position.cloned();
        // let ballTarget = addNoiceToKick(ball.position, ballTarget);
        let kickDirection = ballTarget.subtracted(this.ball.position).normalized();
        this.ball.kick(kickDirection, 10);
        this.ball.owner = this.homeTeam;

        // this.homeTeam.changeState("attacking");

        // this.homeTeam.players[3].changeState("supportAttacker");
        //ball.kick(kickDirection, power);
        this.homeTeam.receiver.onMessage("receiveBall", ballTarget);
        //THIS MIGHT BE NEEDED player.state = player.states["wait"];
        //player.findSupport();
    }
    init() {      
        this.homeTeam.setState("prepareForKickOff");
        this.awayTeam.setState("prepareForKickOff");
    }

    initTeams() {
        this.homeTeam = new Team(true, C.homeColor, this, 0, this.ball);
        this.awayTeam = new Team(false, C.awayColor, this, 9, this.ball);
        this.homeTeam.opponents = this.awayTeam;
        this.awayTeam.opponents = this.homeTeam;
    }

    initRegions() {
        let regionID=0;
        let boxX = this.sizeX / 6;
        let boxY = this.sizeY / 3;
        for(let i = 1; i < 7; i++) {
            for(let j = 1; j < 4; j++) {
                const topLeft = new Vector(this.sizeX - boxX*i, this.sizeY - boxY*j);
                const bottomRight = new Vector(boxX + this.sizeX - boxX*i, boxY + this.sizeY - boxY*j);
                const center = new Vector(topLeft.x + boxX/2, topLeft.y + boxY/2);
                this.regions.push({topLeft: topLeft, bottomRight: bottomRight, center: center, id: regionID})
                regionID++;
            }
        }
    }
    render(renderer) {

        renderer.beginPath();
        renderer.rect(this.x, this.y, this.sizeX, this.sizeY);
        renderer.fillStyle = this.color;
        renderer.strokeStyle = "white";
        renderer.fill();
        renderer.moveTo(this.x + this.sizeX / 2, this.y);
        renderer.lineTo(this.x + this.sizeX / 2, this.sizeY + this.y );
        renderer.stroke();

        renderer.beginPath();
        renderer.arc(this.x + this.sizeX/2, this.y + this.sizeY/2, this.sizeY / 4, 0, Math.PI *2);
        renderer.stroke();

        renderer.beginPath();
        renderer.fillStyle = "white";
        renderer.arc(this.x + this.sizeX/2, this.y + this.sizeY/2, this.sizeY / 80, 0, Math.PI *2);
        renderer.fill();

        renderer.rect(this.x, this.y + this.sizeY / 3, this.sizeX/20, this.sizeY / 3);
        renderer.rect(this.x + this.sizeX, this.y + this.sizeY / 3, -this.sizeX/20, this.sizeY / 3);
        renderer.stroke();

        // regions
        this.regions.forEach(region => {
            renderer.fillText(region.id, this.x + region.center.x, this.y + region.center.y);
            const boxX = region.bottomRight.x-region.topLeft.x;
            const boxY = region.topLeft.y - region.bottomRight.y;
            renderer.rect(this.x + region.topLeft.x, this.y + region.topLeft.y, boxX, -boxY);
        })


        renderer.beginPath();
        renderer.fillStyle = C.ballColor;
        renderer.arc(this.x + this.ball.position.x, this.y + this.ball.position.y, 6, 0, Math.PI * 2);
        renderer.fill();

        this.homeTeam.render(renderer);
        this.awayTeam.render(renderer);
    }
}