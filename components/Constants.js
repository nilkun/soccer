const PITCHSIZE = 500;
const scale = PITCHSIZE/105;

const pitchConstants = {
    // pixels from edge
    xMargin: 10,
    yMargin: 10,

    // Grass color
    color: "green",
    ballColor: "orange",
    ballRadius: 5,
    friction: .995,

    // pitch size
    scale: scale,
    width: 105 * scale,
    height: 68 * scale,
    // width: 400,
    // height: 250,    
}
const teamConstants = {
    size: 5,
    ["4-4-2"]: [ 1, 20, 43, 33, 32 ],
    ["1-4-2"]: [ 50-1, 50-20, 50-43, 50-33, 50-32 ],
}

const playerConstants = {
    x: pitchConstants.width / 2,
    y: 0,
    kickRangeSq: 25,
    passRangeSq: 25,
    timer: Date.now(),
    comfortZone: 10000
}

export { pitchConstants, teamConstants, playerConstants }
