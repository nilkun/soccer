const team = {


   // bestSupportingSpot: 6,
    numAttemptsToFindValidStrike: 5,
    distanceFromControllingPlayerStrength: 15,
    passSafeStrength: 5,
    canScoreStrength: 2,
    optimalDistance: 1200,
   // distanceFromControllingPlayerStrength: 10,
    homeLineup: [16,9,11,12,14],
    awayLineup: [1,6,8,3,5],
}
const pitch = {
    scale: 4,
    x: 10,
    y: 10,
    color: "green",
    ballColor: "orange",
    sizeX: 105 * scale,
    sizeY: 68 * scale,
    homeColor: "red",
    awayColor: "blue"
}

const players = {
    x: pitch.sizeX/2,
    y: 0,
    passThreatRadius: 70,
    timer: Date.now()
}

export {team, pitch, players};