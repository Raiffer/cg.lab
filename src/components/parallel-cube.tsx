import type { TProjectionCube } from "@/store/scene3DStore";
import ProjectionCube from "./projection-cube";

interface ParallelCubeProps {
  cube: TProjectionCube;
  interactive?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
}

export default function ParallelCube({
  cube,
  interactive = false,
  onDraggingChange,
}: ParallelCubeProps) {
  return (
    <ProjectionCube
      cube={cube}
      mode="parallel"
      interactive={interactive}
      onDraggingChange={onDraggingChange}
    />
  );
}
