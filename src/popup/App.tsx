import React, { useEffect, useState } from "react";

const LANGUAGES = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "sv", name: "Swedish" },
    { code: "lt", name: "Lithuanian" },
];

export default function App() {
    const [sourceLang, setSourceLang] = useState("sv");
    const [targetLang, setTargetLang] = useState("lt");

    // Load saved language on mount
    useEffect(() => {
        if (chrome?.storage?.sync) {
            chrome.storage.sync.get(["sourceLang"], (result) => {
                if (result.sourceLang) setSourceLang(result.sourceLang);
            });
            chrome.storage.sync.get(["targetLang"], (result) => {
                if (result.targetLang) setTargetLang(result.targetLang);
            });
        }
    }, []);

    // Save language when changed
    const handleSourceLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setSourceLang(newLang);
        chrome.storage.sync.set({ sourceLang: newLang });
    };

    const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setTargetLang(newLang);
        chrome.storage.sync.set({ targetLang: newLang });
    };

    return (
        <div style={{ padding: "12px", width: "250px" }}>
            <h2>Translator Extension</h2>
            <label style={{ display: "block", marginBottom: "8px" }}>
                Source language:
            </label>
            <select
                value={sourceLang}
                onChange={handleSourceLangChange}
                style={{ width: "100%", padding: "6px" }}
            >
                {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                        {l.name}
                    </option>
                ))}
            </select>
            <label style={{ display: "block", marginBottom: "8px" }}>
                Target language:
            </label>
            <select
                value={targetLang}
                onChange={handleTargetLangChange}
                style={{ width: "100%", padding: "6px" }}
            >
                {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                        {l.name}
                    </option>
                ))}
            </select>
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#555" }}>
                Select text on any page → click the icon → translation in chosen
                language.
            </p>
        </div>
    );
}
