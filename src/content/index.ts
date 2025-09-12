// Floating button + popup references
let btn: HTMLImageElement | null = null;
let popup: HTMLDivElement | null = null;

// Selection handler
document.addEventListener("selectionchange", logSelection);

function logSelection(event: any) {
  const selection = document.getSelection();
  const text = selection?.toString().trim();

  if (text) {
    const rect = selection!.getRangeAt(0).getBoundingClientRect();
    showTranslateButton(rect, text);
  } else {
    removeElements();
  }
}

// Show floating button
function showTranslateButton(rect: DOMRect, text: string) {
  removeElements(); // ✅ always clear old button/popup

  btn = document.createElement("img");
  btn.src = chrome.runtime.getURL("icon.png");
  btn.style.position = "absolute";
  btn.style.top = `${window.scrollY + rect.bottom + 3}px`;
  btn.style.left = `${window.scrollX + rect.left}px`;
  btn.style.width = "24px";
  btn.style.height = "24px";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "9999";

  btn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "TRANSLATE", text }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        return;
      }
      if (response?.type === "SHOW_TRANSLATION") {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        showPopup(rect, response.translation);
      }
    });
  });

  document.body.appendChild(btn);
}

// Listen for translation result
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_TRANSLATION") {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    showPopup(rect, message.translation);
  }
});

// Show popup under selection
function showPopup(rect: DOMRect, translation: string) {
  removeElements(); // ✅ ensure old popup is gone

  popup = document.createElement("div");
  popup.style.position = "absolute";
  popup.style.top = `${window.scrollY + rect.bottom + 5}px`;
  popup.style.left = `${window.scrollX + rect.left}px`;
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "8px 10px";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.2)";
  popup.style.fontSize = "14px";
  popup.style.maxWidth = "250px";
  popup.style.zIndex = "10000";
  popup.style.display = "flex";
  popup.style.alignItems = "flex-start";
  popup.style.gap = "8px";

  // Text content
  const textEl = document.createElement("div");
  textEl.innerText = translation;
  textEl.style.flex = "1";
  textEl.style.color = "#333";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "×";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "16px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.lineHeight = "1";
  closeBtn.style.padding = "0 4px";
  closeBtn.style.color = "#888";

  closeBtn.addEventListener("mouseover", () => {
    closeBtn.style.color = "#000";
  });
  closeBtn.addEventListener("mouseout", () => {
    closeBtn.style.color = "#888";
  });
  closeBtn.addEventListener("click", () => hidePopup());

  popup.appendChild(textEl);
  popup.appendChild(closeBtn);

  document.body.appendChild(popup);

  // Auto-hide on outside click
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick, {
      capture: true,
    });
  }, 0);
}

// Hide + cleanup
function hidePopup() {
  removePopup();
}

function handleOutsideClick(e: MouseEvent) {
  if (popup && !popup.contains(e.target as Node) && btn !== e.target) {
    hidePopup();
  }
}

// Utility cleanup
function removeElements() {
  if (btn) {
    btn.remove();
    btn = null;
  }
  removePopup();
}

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
    document.removeEventListener("click", handleOutsideClick, {
      capture: true,
    } as any);
  }
}
