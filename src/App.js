import { useRef, useEffect, useState } from "react";
import "./styles.css";

let cvs, ctx;
let sqrlObj;
let prevDelta = 0,
  t = 0,
  c = 0;
let jump = false;
let jumpFrames = [],
  jumpParams = {
    a: 3000,
    tE: 0.5
  };
let hitboxes = false,
  autojump = false;
let keyPress = {
  w: "R" //P - Pressed, A - activated, R - release
};

class Squirrel {
  w;
  h;
  x;
  y;
  p = 0;
  jx = 0;
  constructor(width, height, posX, posY, hitboxes) {
    this.w = width;
    this.h = height;
    this.x = posX;
    this.y = posY;
    this.hb = hitboxes;
  }
  calcHitboxes(type) {
    switch (type) {
      case "jump":
        return (this.hb = {
          x: sqrlObj.x + 75,
          y: sqrlObj.y + sqrlObj.jx + 30,
          w: sqrlObj.w - 140,
          h: sqrlObj.h - 90
        });
      default:
        return;
    }
  }
}

function renderSquirrel(delta) {
  let tE = jumpParams.tE,
    a = jumpParams.a;
  let V0 = tE * a;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  requestAnimationFrame(renderSquirrel);
  if (delta) {
    t = delta - prevDelta;
    prevDelta = delta;
  }
  c = c + t / 1000;
  if (jump || autojump) {
    sqrlObj.jx = -(c * (2 * V0 - a * c)) / 2;
    sqrlObj.p = (c / (tE * 2)) * 100;
  }

  if (sqrlObj.jx >= 0) {
    jump = false;
    sqrlObj.jx = 0;
    sqrlObj.p = 0;
    c = 0;
  }
  let k = 0;

  for (let i = 1; i <= 21; i++) {
    let j = (100 / 21) * i,
      j1 = (100 / 21) * (i + 1);
    if (sqrlObj.p >= j && sqrlObj.p < j1) k = i - 1;
  }

  ctx.beginPath();
  ctx.drawImage(
    jumpFrames[k],
    sqrlObj.x,
    sqrlObj.y + sqrlObj.jx,
    sqrlObj.w,
    sqrlObj.h
  );
  sqrlObj.calcHitboxes("jump");
  if (hitboxes)
    ctx.rect(sqrlObj.hb.x, sqrlObj.hb.y, sqrlObj.hb.w, sqrlObj.hb.h);
  ctx.stroke();
}
function cancellAllAnimFrame() {
  let id = window.requestAnimationFrame(() => {
    while (id--) {
      window.cancelAnimationFrame(id);
    }
  });
}

export default function App() {
  const canvasRef = useRef();
  const [params, setParams] = useState({
    a: jumpParams.a,
    tE: jumpParams.tE
  });
  useEffect(() => {
    cvs = canvasRef.current;
    ctx = canvasRef.current.getContext("2d");
    cancellAllAnimFrame();
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    sqrlObj = new Squirrel(180, 180, cvs.width / 2 - 90, cvs.height - 180, 0);
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 87) {
        if (keyPress.w === "R") {
          keyPress.w = "P";
        }
        if (keyPress.w === "P") {
          jump = true;
          keyPress.w = "A";
        }
        if (keyPress.w === "A" && !jump) {
          jump = true;
        }
        keyPress.w = "A";
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 38) {
        keyPress.up = "R";
      }
    });
    for (let i = 0; i < 21; i++) {
      jumpFrames.push(new Image(200, 200));
      jumpFrames[
        i
      ].src = `assets/frames/squirrel-jumping/squirrel-jumping000100${(() => {
        if (i + 1 < 10) return "0" + (i + 1);
        return i + 1;
      })()}.png`;
    }
    jumpFrames[20].onload = () => {
      renderSquirrel();
    };
    jumpFrames[20].onError = (e) => {
      alert("Sorry, but we couldn't load the game :/");
    };
  }, []);
  return (
    <div className="App">
      <canvas width={500} height={700} ref={canvasRef}></canvas>
      <div className="customizationPanel">
        <form
          className="customizationPanelForm"
          onSubmit={(e) => {
            e.preventDefault();
            let formData = new FormData(e.target);
            let data = {};
            for (let d of formData) {
              if (d[1][0]) {
                data[d[0]] = d[1];
              } else data[d[0]] = jumpParams[d[0]];
            }
            setParams(data);
            jumpParams = data;
          }}
        >
          <p>Current values</p>
          <p>a = {params.a}</p>
          <p>
            t<sub>e</sub> = {params.tE}
          </p>
          <p>Enter new a:</p>
          <input type="text" name="a" />
          <p>
            Enter new t<sub>e</sub>:
          </p>
          <input type="text" name="tE" />
          <button>Confirm</button>
        </form>
        <label className="checkbox">
          <input
            type="checkbox"
            onChange={() => {
              hitboxes = !hitboxes;
            }}
          />
          <div>Enable hitboxes</div>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            onChange={() => {
              autojump = !autojump;
              t = 0;
            }}
          />
          <div>Enable autojump</div>
        </label>
      </div>
    </div>
  );
}
