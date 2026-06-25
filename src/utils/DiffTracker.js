/**
 * DiffTracker
 * 
 * Simple utility to calculate word counts and change metrics between two strings.
 */
class DiffTracker {
    /**
     * Calculates metrics between original and new content.
     * 
     * @param {string} original - The original text
     * @param {string} revised - The revised/optimized text
     * @returns {Object} Change metrics
     */
    static calculate(original, revised) {
        const originalWords = this._getWords(original);
        const revisedWords = this._getWords(revised);
        
        const countBefore = originalWords.length;
        const countAfter = revisedWords.length;
        
        // Simple set-based diff for added/removed
        const originalSet = new Set(originalWords);
        const revisedSet = new Set(revisedWords);
        
        let added = 0;
        for (const word of revisedWords) {
            if (!originalSet.has(word)) added++;
        }
        
        let removed = 0;
        for (const word of originalWords) {
            if (!revisedSet.has(word)) removed++;
        }
        
        const changePercent = countBefore > 0 
            ? Math.round(((added + removed) / (countBefore * 2)) * 100) 
            : 100;

        return {
            wordCountBefore: countBefore,
            wordCountAfter: countAfter,
            addedWords: added,
            removedWords: removed,
            changePercent: Math.min(100, changePercent)
        };
    }

    static _getWords(text) {
        if (!text) return [];
        // Strip HTML if present for word counting
        const plain = text.replace(/<[^>]*>?/gm, ' ');
        return plain.toLowerCase().match(/\b(\w+)\b/g) || [];
    }
}

module.exports = DiffTracker;
