import { useState } from "react";
import { Assignment } from "@/types/Assignment";
import { Button } from "./ui/button";

interface Props {
  assignment: Assignment;
}

export default function SliderAssignment({ assignment }: Props) {
  const slider = assignment.slider;
  const [value, setValue] = useState(slider?.initialValue ?? 0);
  const [selectedButton, setSelectedButton] = useState(
    assignment.buttons?.find(button => button.variant === "default")?.label
  );

  if (!slider) return null;

  const handleChange = (nextValue: number) => {
    setValue(nextValue);
    slider.onChange?.(nextValue);
  };

  return (
    <div className="mt-4 space-y-3 px-10">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{slider.min}</span>
        <output htmlFor={`slider-${assignment.id}`}>{value}</output>
        <span>{slider.max}</span>
      </div>
      <input
        id={`slider-${assignment.id}`}
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step ?? 1}
        value={value}
        onChange={event => handleChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
      {assignment.buttons && assignment.buttons.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {assignment.buttons.map(button => (
            <Button
              key={button.label}
              type="button"
              variant={
                button.selectable
                  ? button.label === selectedButton
                    ? "default"
                    : "outline"
                  : button.variant
              }
              onClick={() => {
                if (button.selectable) setSelectedButton(button.label);
                const nextValue = button.onClick();
                if (typeof nextValue === "number") setValue(nextValue);
              }}
            >
              {button.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
