import Viewport from "../shared/engine/Viewport.js";
import Pitch from "./components/Pitch.js";

const viewport = new Viewport(730, 395);
const pitch = new Pitch();
viewport.setBackground("green");


window.addEventListener("keydown", (e) => pitch.tag(e));
window.addEventListener("keyup", (e) => pitch.untag(e));

const renderer = viewport.context;
pitch.init(renderer);
pitch.render(renderer);

const update = () => {
    pitch.update();
    pitch.render(renderer);
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

// setInterval(() => update(), 50);


