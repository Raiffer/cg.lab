import { Line, LaTeX } from "mafs";
import { TLine } from "@/types/Scene2DConfig";

export default function CustomLine({ line }: { line: TLine }) {
  const { point1, point2, color = "white", style = "solid", weight, label } = line;

  const midpoint: [number, number] = [
    (point1[0] + point2[0]) / 2,
    (point1[1] + point2[1]) / 2,
  ];

  return (
    <>
      <Line.ThroughPoints
        point1={point1}
        point2={point2}
        color={color}
        style={style}
        weight={weight}
      />
      {label && <LaTeX at={midpoint} tex={label} />}
    </>
  );
}
