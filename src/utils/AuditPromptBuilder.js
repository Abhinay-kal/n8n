/**
 * AuditPromptBuilder
 * 
 * Constructs the SEO audit prompt for Claude based on site settings and post content.
 */
class AuditPromptBuilder {
    /**
     * Builds the final prompt for the SEO audit.
     * 
     * @param {Object} options - Input data for the prompt
     * @param {string} options.title - Post title
     * @param {string} options.content - Full post content (HTML or Text)
     * @param {Object} options.siteSettings - Site-specific SEO settings
     * @param {string} options.template - Audit prompt template from settings
     * @returns {string} The complete prompt
     */
    static build({ title, content, siteSettings, template }) {
        const context = `
Site Context:
- Language: ${siteSettings.language || 'English'}
- Target Location: ${siteSettings.target_location || 'Global'}
- Country: ${siteSettings.country || 'N/A'}

Post to Audit:
Title: ${title}
Content:
${content}
`;

        const instructions = `
Instructions:
${template || 'Perform a comprehensive SEO audit of the post above. Provide a structured response including an overall score, specific issues, recommendations, and a summary.'}

Return your response in a structured format that I can parse. Include:
1. Overall SEO Score (0-100)
2. Intent Score (0-100)
3. EEAT Score (0-100)
4. Readability Score (0-100)
5. List of Issues
6. List of Recommendations
7. A concise Summary
`;

        return `${context}\n\n${instructions}`;
    }
}

module.exports = AuditPromptBuilder;
