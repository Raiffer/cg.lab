import { useMultipleChoiceStore } from "@/store/multipleChoiceStore";

// Alternativas de uma questão fechada: o aluno escolhe uma única opção
export default function MultipleChoiceOptions() {
  const { options, selectedOptionId, selectOption } = useMultipleChoiceStore();

  if (!options.length) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Alternativas"
      className="mt-4 flex flex-wrap justify-center gap-3"
    >
      {options.map((option, index) => {
        const isSelected = option.id === selectedOptionId;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => selectOption(option.id)}
            className={`flex min-w-48 items-center gap-3 rounded-md border-2 px-4 py-2 text-left text-base transition-colors ${
              isSelected
                ? "border-blue-600 bg-blue-100"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {String.fromCharCode(65 + index)}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
