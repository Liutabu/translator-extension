import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type VocabEntry = {
  text: string;
  translation: string;
  languages: string;
  savedAt: number;
};

function VocabPage() {
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");

  useEffect(() => {
    chrome.storage.sync.get("vocab", (result) => {
      setVocab(result.vocab || []);
    });
  }, []);

  const saveVocab = (updated: VocabEntry[]) => {
    chrome.storage.sync.set({ vocab: updated }, () => setVocab(updated));
  };

  const addEntry = () => {
    if (!newWord || !newTranslation) return;
    const updated = [
      ...vocab,
      {
        text: newWord,
        translation: newTranslation,
        languages: "manual",
        savedAt: Date.now(),
      },
    ];
    saveVocab(updated);
    setNewWord("");
    setNewTranslation("");
  };

  const deleteEntry = (index: number) => {
    const updated = vocab.filter((_, i) => i !== index);
    saveVocab(updated);
  };

  const editEntry = (index: number, text: string, translation: string) => {
    const updated = [...vocab];
    updated[index].text = text;
    updated[index].translation = translation;
    saveVocab(updated);
  };

  return (
    <div className="p-6 font-sans">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        My Vocabulary
      </h1>

      {/* Add New Entry */}
      <div
        className="flex gap-2 mb-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <input
          type="text"
          placeholder="Word"
          className="border p-2 rounded"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
        />
        <input
          type="text"
          placeholder="Translation"
          className="border p-2 rounded"
          value={newTranslation}
          onChange={(e) => setNewTranslation(e.target.value)}
        />
        <button
          onClick={addEntry}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Table of Vocab */}
      <table
        className="w-full border-collapse border"
        style={{ margin: "0px auto" }}
      >
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Word</th>
            <th className="border px-2 py-1">Translation</th>
            <th className="border px-2 py-1">Languages</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vocab.map((entry, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">
                <input
                  className="border p-1 w-full"
                  value={entry.text}
                  onChange={(e) =>
                    editEntry(i, e.target.value, entry.translation)
                  }
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  className="border p-1 w-full"
                  value={entry.translation}
                  onChange={(e) => editEntry(i, entry.text, e.target.value)}
                />
              </td>
              <td className="border px-2 py-1">{entry.languages}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => deleteEntry(i)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {vocab.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-3">
                No saved words yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<VocabPage />);
}
