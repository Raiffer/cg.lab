import { create } from "zustand";

export type TMultipleChoiceOption = {
  id: string;
  label: string;
  correct: boolean;
};

interface MultipleChoiceStore {
  options: TMultipleChoiceOption[];
  selectedOptionId: string | null;
  setOptions: (options: TMultipleChoiceOption[]) => void;
  selectOption: (id: string) => void;
  getSelectedOption: () => TMultipleChoiceOption | undefined;
  reset: () => void;
}

const initialState = {
  options: [],
  selectedOptionId: null,
};

export const useMultipleChoiceStore = create<MultipleChoiceStore>(
  (set, get) => ({
    ...initialState,
    setOptions: options => set({ options, selectedOptionId: null }),
    selectOption: id => set({ selectedOptionId: id }),
    getSelectedOption: () => {
      const { options, selectedOptionId } = get();
      return options.find(option => option.id === selectedOptionId);
    },
    reset: () => set({ ...initialState }),
  })
);
