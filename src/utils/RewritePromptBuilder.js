/**
 * RewritePromptBuilder
 * 
 * Constructs the SEO rewrite prompt for Claude based on original content, 
 * audit results, and site settings.
 */
class RewritePromptBuilder {
    /**
     * Builds the final prompt for the SEO rewrite.
     * 
     * @param {Object} options - Input data for the prompt
     * @param {string} options.originalContent - The original post content
     * @param {Object} options.audit - The audit result object (result, metadata)
     * @param {string} options.template - Rewrite prompt template from site settings
     * @returns {string} The complete prompt
     */
    static build({ originalContent, audit, template }) {
        const instructions = `
Instructions:
${template || 'Rewrite the content below to optimize for search engines.'}

Audit Findings to Address:
---
${audit?.result || 'No specific audit findings provided.'}
---

Original Content:
---
${originalContent}
---

Return ONLY the optimized content. Do not include any preambles, explanations, or metadata.
`;

        return instructions.trim();
    }
}

module.exports = RewritePromptBuilder;
