
import Vector from "../../shared/engine/Vector2.js";
import Team from "./Team.js";
import DebugMan from "./DebugMan.js";

import { pitchConstants as C }  from "./Constants.js"
import Ball from "./Ball.js";

export default class Pitch { 
    constructor() {

        // Margin and padding
        this.xMargin = C.xMargin;
        this.yMargin = C.yMargin;

        // Grass color
        this.color = C.color;
        this.friction = C.friction;

        // pitch size
        this.width = C.width;
        this.height = C.height;

        // Objects
        this.ball;
        this.homeTeam;
        this.awayTeam;

        this.regions = [];
        this.regions2 = [];

        this.info = {
            gameOn: true,
            ball: "",
            opponentsGoal: new Vector(C.width, C.height/2)
        }

        // DEV
        this.debug = new DebugMan;
        this.currentTime = Date.now();
        this.lastTime = Date.now();
        this.elapsedTime = 0;

    }

    init(renderer) {
        this.createRegions();
        this.createBall();
        this.createTeams();
        // Set up margins
        renderer.translate(this.xMargin, this.yMargin);
    }

    createBall() {
        this.ball = new Ball();
        this.ball.position = new Vector(100, 100);
        // this.ball.radius = .22 * C.scale;
        this.ball.radius = .22 * 10;

        this.ball.color = C.ballColor;

        // Reference
        this.info.ball = this.ball;
    }
    update() {
        this.lastTime = this.currentTime;
        this.currentTime = Date.now();
        this.elapsedTime = (this.currentTime - this.lastTime)/10000;
        this.ball.update(this.elapsedTime, this);
        this.debug.update();
        this.homeTeam.update();
        this.awayTeam.update();

        // this.debug.innerHTML = this.ball.position.x + " " + this.ball.position.y + " vs " +this.homeTeam.players[2].target.x;

    }
    renderPitch(renderer) {

        // Mowe the lawn
        let green = true;
        let color;
        let stripes = 10;
        let lineSize = C.width / stripes;
        for(let i = 0; i < stripes; i++) {
            renderer.beginPath();   
            color = green ? "green" : "darkgreen";
            renderer.fillStyle = color;
            renderer.rect(i * lineSize, 0, i * lineSize + lineSize, C.height);
            renderer.fill();
            green = !green;
            // alert("wait");
        }
        // renderer.closePath();

        renderer.beginPath();
        renderer.rect(0, 0, this.width, this.height);
        // renderer.fillStyle = this.color;
        renderer.strokeStyle = "white";
        // renderer.fill();
        renderer.moveTo(this.width / 2, 0);
        renderer.lineTo(this.width / 2, this.height);
        renderer.stroke();

        // center spot
        renderer.fillStyle = "white";
        renderer.beginPath();
        renderer.arc(this.width/2, this.height/2,1.5 , 0, Math.PI *2);
        renderer.fill();
        renderer.beginPath();
        renderer.arc(this.width/2, this.height/2, C.scale * 9.15, 0, Math.PI *2);
        renderer.stroke();

        // Penalty area
        // Left
        renderer.rect(0, (C.height/2-40.3/2*C.scale), 16.5 * C.scale, 40.3 * C.scale);
        renderer.rect(0, (C.height/2 - 18.32/2*C.scale), 5.5 * C.scale, 18.32 * C.scale);
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(11*C.scale, C.height/2, 9.15*C.scale, -0.925928397, 0.925928397);
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(11*C.scale, C.height/2, 1.5, 0, Math.PI*2);
        renderer.fill();
        renderer.beginPath();
        renderer.arc(0, 0, 1 * C.scale, 0, Math.PI*2/4)
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(0, C.height, 1 * C.scale, -Math.PI*2/4, 0);

        // renderer.stroke();
        // renderer.rect(this.width, this.height / 3, -16.5 * C.scale, 40.3 * C.scale);
        // renderer.stroke();
        renderer.moveTo(9.15*C.scale, 0);
        renderer.lineTo(9.15*C.scale, -.5 * C.scale); 
        renderer.moveTo(9.15*C.scale, C.height);
        renderer.lineTo(9.15*C.scale, C.height + .5 * C.scale);  
        renderer.moveTo(0, 9.15*C.scale);
        renderer.lineTo(-.5 * C.scale, 9.15*C.scale);  
        renderer.moveTo(0, C.height - 9.15*C.scale);
        renderer.lineTo(-.5 * C.scale, C.height - 9.15*C.scale); 
        renderer.stroke();

        // right area
        renderer.rect(C.width, (C.height/2-40.3/2*C.scale), -16.5 * C.scale, 40.3 * C.scale);
        renderer.rect(C.width, (C.height/2 - 18.32/2*C.scale), -5.5 * C.scale, 18.32 * C.scale);
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(C.width - 11*C.scale, C.height/2, 9.15*C.scale, Math.PI-0.925928397, Math.PI+0.925928397);
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(C.width - 11*C.scale, C.height/2, 1.5, 0, Math.PI*2);
        renderer.fill();
        renderer.beginPath();
        renderer.arc(C.width, 0, 1 * C.scale, Math.PI*2/4, Math.PI);
        renderer.stroke();
        renderer.beginPath();
        renderer.arc(C.width, C.height, 1 * C.scale, Math.PI, -Math.PI*2/4);

        // renderer.stroke();
        // renderer.rect(this.width, this.height / 3, -16.5 * C.scale, 40.3 * C.scale);
        // renderer.stroke();
        renderer.moveTo(C.width - 9.15*C.scale, 0);
        renderer.lineTo(C.width - 9.15*C.scale, -.5 * C.scale); 
        renderer.moveTo(C.width - 9.15*C.scale, C.height);
        renderer.lineTo(C.width - 9.15*C.scale, C.height + .5 * C.scale);  
        renderer.moveTo(C.width, 9.15*C.scale);
        renderer.lineTo(C.width + .5 * C.scale, 9.15*C.scale);  
        renderer.moveTo(C.width, C.height - 9.15*C.scale);
        renderer.lineTo(C.width + .5 * C.scale, C.height - 9.15*C.scale); 
        renderer.stroke();


    }

    render(renderer) {
        this.renderPitch(renderer);
        this.ball.render(renderer);

        this.awayTeam.render(renderer);
        this.homeTeam.render(renderer);

        this.debug.render(renderer);
    }

    tag(e) {
        if(e.key===" ") this.ball.kick(this.debug.heading, this.debug.power); 
        this.debug.tag(e.key);
    }

    untag(e) {
        this.debug.untag(e.key);
    }

    createRegions() {
        let boxX = C.width / 10;
        let boxY = C.height / 5;
        let offX = boxX / 2;
        let offY = boxY / 2;
        for(let i = 1; i < 10+1; i++) {
            for(let j = 1; j < 5+1; j++) {
                const region = new Vector(boxX*i - offX, boxY*j - offY);
                this.regions.push(region);
            }
        }
    }

    createTeams() {
        this.homeTeam = new Team(this.regions, this.info, true);
        this.awayTeam = new Team(this.regions, this.info, false);
        this.homeTeam.opponents = this.awayTeam;
        this.awayTeam.opponents = this.homeTeam;
    }

    mirrorRegion() {

    }
}