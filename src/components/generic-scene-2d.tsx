"use client";

import useWindowSize from "@/hooks/use-window-size";
import { Coordinates, Mafs } from "mafs";
import CustomPoint from "./custom-point";
import VectorWithControls from "./vector-with-controls";
import { Scene2DConfig } from "@/types/Scene2DConfig";
import CustomPolygon from "./custom-polygon";
import { useEffect } from "react";
import { useScene2DStore } from "@/store/scene2DStore";

export default function GenericScene2D({ config }: { config: Scene2DConfig }) {
  const windowSize = useWindowSize();
  const { setViewBox } = useScene2DStore();

  useEffect(() => {
    // If any point is covered by the panel, adjust the view box to show it
    if (config.points) {
      const somePointCoveredByPanel = config.points.some(point => {
        return point.position[0] <= -3 && point.position[1] <= -3;
      });

      if (somePointCoveredByPanel) {
        const newViewBox = {
          x: [-10, 2] as [number, number],
          y: [-10, 2] as [number, number],
        };
        setViewBox(newViewBox);
      }
    }
  }, [config.points, setViewBox]);

  return (
    <Mafs pan={config.pan} viewBox={config.viewBox} height={windowSize.height}>
      <Coordinates.Cartesian subdivisions={config.grid.subdivisions} />

      {config.polygons?.map(polygon => (
        <CustomPolygon key={polygon.id} polygon={polygon} />
      ))}

      {config.vectors?.map(vector => (
        <VectorWithControls key={vector.id} vector={vector} />
      ))}

      {config.points?.map(point => {
        return <CustomPoint key={point.id} point={point} />;
      })}
    </Mafs>
  );
}
