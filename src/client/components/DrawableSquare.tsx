import { MouseEvent, useRef, useState } from "react";

type OnDrawStop = (canvas: HTMLCanvasElement) => boolean;
type OnDrawStart = () => void;
type CoordinateArray = [x: number, y: number];

interface DrawableSquareProps {
  /** The color of the line to draw*/
  drawColor: string;
  /** The width of the line to draw */
  lineWidth: number;
  /** Allows passing of css classes onto the canvas component */
  className?: string;
  /** Whether or not the user should be able to draw on the component */
  disabled: boolean;
  /** The background colour of the component */
  fill?: string;

  /** A callback which is called when the user stops drawing a line */
  onDrawStop?: OnDrawStop;
  /** A callback which is called when the user starts drawing a line */
  onDrawStart?: OnDrawStart;
}

/**
 * A square component which allows the user to draw on it
 */
export function DrawableSquare({
  className,
  drawColor,
  lineWidth,
  disabled,
  fill,

  onDrawStop = () => false,
  onDrawStart = () => undefined,
}: DrawableSquareProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const [previousPosition, setPreviousPosition] = useState<CoordinateArray>([
    0, 0,
  ]);
  const [currentPosition, setCurrentPosition] = useState<CoordinateArray>([
    0, 0,
  ]);
  const [isDrawing, setIsDrawing] = useState(false);

  /** Start drawing a line */
  const handleMouseDown = function (e: MouseEvent<HTMLCanvasElement>) {
    if (disabled) return;

    onDrawStart();

    const mousePosition: CoordinateArray = [
      e.clientX - canvas.current.offsetLeft,
      e.clientY - canvas.current.offsetTop,
    ];

    // If there is no previous position, use the current position
    if (currentPosition[0] === 0 && currentPosition[1] === 0) {
      setPreviousPosition(mousePosition);
    } else {
      setPreviousPosition(currentPosition);
    }

    setCurrentPosition(mousePosition);

    setIsDrawing(true);
  };

  /** Draw the line */
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setPreviousPosition(currentPosition);
      setCurrentPosition([
        e.clientX - canvas.current.offsetLeft,
        e.clientY - canvas.current.offsetTop,
      ]);

      draw();
    }
  };

  /** Finish drawing the line */
  const handleMouseUp = () => {
    setIsDrawing(false);

    if (!onDrawStop(canvas.current)) {
      canvas.current
        .getContext("2d")
        .clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  /** A helper function to draw a line between the current and previous positions */
  function draw() {
    const ctx = canvas.current.getContext("2d");
    ctx.beginPath();

    // Set the path style
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawColor;
    ctx.lineCap = "round";

    // Draw the line
    ctx.moveTo(...previousPosition);
    ctx.lineTo(...currentPosition);
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
