import React, { useState } from "react";
import { Button } from "@/components/ui/button";

// Botão "i" no canto inferior direito das páginas de questão
export default function AssignmentInfoButton() {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isInfoVisible && (
        <div
          role="status"
          className="w-64 rounded-md border bg-white p-4 text-sm shadow-lg"
        />
      )}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white"
        aria-label="Abrir informações da questão"
        aria-expanded={isInfoVisible}
        onClick={() => setIsInfoVisible(visible => !visible)}
      >
        <span className="text-lg font-bold">i</span>
      </Button>
    </div>
  );
}
