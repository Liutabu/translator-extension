export default function Popup() {
  const openVocabPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/vocab.html") });
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Translator</h1>
      <button
        onClick={openVocabPage}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Manage Vocabulary
      </button>
    </div>
  );
}
