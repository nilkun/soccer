import Viewport from "../shared/engine/Viewport2.js";
import Pitch from "./Pitch.js";


// TESTING
// import Vector from "../shared/engine/Vector2.js";

// const p = (globalPosition, heading, object) => {

    // // for clarity
    // const cos0 = heading.y;
    // const sin0 = heading.x;
    // let localPosition = new Vector();
    // localPosition.replace(object.subtracted(globalPosition));

    // let temp = localPosition.x * cos0 - localPosition.y * sin0;
    // localPosition.y = localPosition.x * sin0 + localPosition.y * cos0;
    // localPosition.x = temp;
    // return localPosition;
// }

// const d45 = Math.PI / 4;
// const global = new Vector(1, 1);
// const heading = new Vector(Math.sin(d45), Math.cos(d45));
// const object = new Vector( 0, 0);

// p(global, heading, object);

class GoalPosts {
    // leftpost;
    // rightpost;
    // facing vector;
    // goals scored;
    // center of goal;
    // bool scored;
}

const viewport = new Viewport(420, 270);
const renderer = viewport.context;
const pitch = new Pitch();
const debug = document.getElementById("debug");
pitch.debug = debug;

pitch.render(renderer);

pitch.init();

const update = () => {
    pitch.update(debug);
    pitch.render(renderer);
}

setInterval(() => update(), 100);