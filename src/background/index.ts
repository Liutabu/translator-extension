chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (message.type === "TRANSLATE") {
    const text = message.text;

    chrome.storage.sync.get(["sourceLang", "targetLang"], async (result) => {
      const sourceLang = result.sourceLang || "sv";
      const targetLang = result.targetLang || "lt";

      try {
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=${sourceLang}|${targetLang}`;

        console.log("Calling API:", apiUrl);

        const res = await fetch(apiUrl);
        const data = await res.json();
        const translation = data.responseData.translatedText;

        console.log("Translation received:", translation);

        sendResponse({
          type: "SHOW_TRANSLATION",
          translation,
          languages: { sourceLang, targetLang },
        });
      } catch (err) {
        console.error("Translation error:", err);
        sendResponse({ type: "SHOW_TRANSLATION", translation: "[error]" });
      }
    });

    return true; // keep channel open for async
  }

  if (message.type === "SAVE_TRANSLATION") {
    const { selection, translation, languages } = message;
    const langPair = languages
      ? `${languages.sourceLang}-${languages.targetLang}`
      : "unknown";
    chrome.storage.sync.get("vocab", (result) => {
      let vocab: {
        text: string;
        translation: string;
        languages: string;
        savedAt: number;
      }[] = result.vocab || [];

      // Check if text already exists (case-insensitive)
      const exists = vocab.some(
        (entry) =>
          entry.text.toLowerCase() === selection.toLowerCase() &&
          entry.translation.toLowerCase() === translation.toLowerCase()
      );

      if (!exists) {
        vocab.push({
          text: selection,
          translation,
          languages: langPair,
          savedAt: Date.now(),
        });

        chrome.storage.sync.set({ vocab }, () => {
          console.log("✅ Saved:", selection, "→", translation);
          sendResponse({ type: "SAVE_RESPONSE", success: true, info: "✅ Saved", icon: "✅" });
        });
      } else {
        console.log("⚠️ Already saved:", selection, "→", translation);
        sendResponse({ type: "SAVE_RESPONSE", success: false, info: "⚠️ Already saved", icon: "⚠️" });
      }
    });

    return true; // keep channel open for async
  }
});
