const prompt = "Reasoning\nContext: The AI should act as a multidis";
const afterText = "Reasoning Context: The AI should act as a multidis";

const normalizeWhitespace = (str) => (str || '').replace(/\s+/g, ' ').trim();
const expectedPrefix = normalizeWhitespace(prompt.slice(0, 50));
const actualText = normalizeWhitespace(afterText);

console.log("expectedPrefix:", expectedPrefix);
console.log("actualText:", actualText);
console.log("includes:", actualText.includes(expectedPrefix));
