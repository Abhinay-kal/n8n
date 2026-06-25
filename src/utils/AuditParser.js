/**
 * AuditParser
 * 
 * Parses Claude's text response into a structured Audit Record.
 */
class AuditParser {
    /**
     * Parses the raw text from Claude.
     * 
     * @param {string} text - Raw response text
     * @returns {Object} Structured audit data
     */
    static parse(text) {
        const result = {
            score: 0,
            metadata: {
                intentScore: 0,
                eeatScore: 0,
                readabilityScore: 0,
                seoScore: 0,
                issues: [],
                recommendations: [],
                summary: ''
            }
        };

        try {
            // Extract Scores (Looking for patterns like "Overall SEO Score: 85" or "85/100")
            result.score = this._extractScore(text, /(?:overall|seo)\s+score[:\s]+(\d+)/i) || 0;
            result.metadata.seoScore = result.score;
            result.metadata.intentScore = this._extractScore(text, /intent\s+score[:\s]+(\d+)/i) || 0;
            result.metadata.eeatScore = this._extractScore(text, /eeat\s+score[:\s]+(\d+)/i) || 0;
            result.metadata.readabilityScore = this._extractScore(text, /readability\s+score[:\s]+(\d+)/i) || 0;

            // Extract Issues
            result.metadata.issues = this._extractList(text, /issues[:\s]+([\s\S]+?)(?:\n\n|\d\.|\n[A-Z]|$)/i);
            
            // Extract Recommendations
            result.metadata.recommendations = this._extractList(text, /recommendations[:\s]+([\s\S]+?)(?:\n\n|\d\.|\n[A-Z]|$)/i);

            // Extract Summary
            const summaryMatch = text.match(/summary[:\s]+([\s\S]+)$/i);
            if (summaryMatch) {
                result.metadata.summary = summaryMatch[1].trim();
            }

        } catch (error) {
            console.error('Audit parsing failed:', error.message);
            // Return partial or empty result if parsing fails
        }

        return result;
    }

    static _extractScore(text, regex) {
        const match = text.match(regex);
        return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : null;
    }

    static _extractList(text, regex) {
        const match = text.match(regex);
        if (!match) return [];

        return match[1]
            .split(/\n/)
            .map(line => line.replace(/^[-•*\d.]+\s*/, '').trim())
            .filter(line => line.length > 5);
    }
}

module.exports = AuditParser;
