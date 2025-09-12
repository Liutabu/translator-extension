chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (message.type === "TRANSLATE") {
    const text = message.text;
    console.log("Fetching translation for:", text);

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

        sendResponse({ type: "SHOW_TRANSLATION", translation });
      } catch (err) {
        console.error("Translation error:", err);
        sendResponse({ type: "SHOW_TRANSLATION", translation: "[error]" });
      }
    });

    return true; // keep channel open for async
  }
});
