import { MouseEvent, useRef, useState } from "react";

type OnDrawStop = (canvas: HTMLCanvasElement) => boolean;
type OnDrawStart = () => void;

export function DrawableSquare({
  className,
  drawColor,
  lineWidth = 5,
  disabled,
  fill,

  onDrawStop = () => false,
  onDrawStart = () => undefined,
}: {
  drawColor: string;
  className?: string;
  lineWidth?: number;
  disabled: boolean;
  fill?: string;

  onDrawStop?: OnDrawStop;
  onDrawStart?: OnDrawStart;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const [prevPos, setPrevPos] = useState<[x: number, y: number]>([0, 0]);
  const [currPos, setCurrPos] = useState<[x: number, y: number]>([0, 0]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = function (e: MouseEvent<HTMLCanvasElement>) {
    if (disabled) return;

    onDrawStart();

    if (currPos[0] === 0 && currPos[1] === 0) {
      setPrevPos([
        e.clientX - canvas.current.offsetLeft,
        e.clientY - canvas.current.offsetTop,
      ]);
    } else {
      setPrevPos(currPos);
    }

    setCurrPos([
      e.clientX - canvas.current.offsetLeft,
      e.clientY - canvas.current.offsetTop,
    ]);

    setIsDrawing(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setPrevPos(currPos);
      setCurrPos([
        e.clientX - canvas.current.offsetLeft,
        e.clientY - canvas.current.offsetTop,
      ]);

      draw();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    if (!onDrawStop(canvas.current)) {
      canvas.current
        .getContext("2d")
        .clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  function draw() {
    const ctx = canvas.current.getContext("2d");

    // ctx.beginPath();
    // ctx.moveTo(...prevPos);
    // ctx.lineTo(...currPos);
    // ctx.strokeStyle = drawColor;
    // ctx.lineWidth = lineWidth;
    // ctx.stroke();
    // ctx.closePath();

    ctx.beginPath(); // begin

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawColor;
    ctx.lineCap = "round";

    ctx.moveTo(...prevPos); // from
    ctx.lineTo(...currPos); // to

    ctx.stroke();
    ctx.closePath();
  }

  return (
    <canvas
      style={{ backgroundColor: fill }}
      ref={canvas}
      height="60px"
      width="60px"
      className={`drawableSquare ${className || ""} ${
        disabled ? "disabled" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
}
