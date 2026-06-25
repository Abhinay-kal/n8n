const crypto = require('crypto');

/**
 * AES-256-GCM Encryption Utility
 * Used for securing WordPress Application Passwords and other secrets.
 */
class Encryption {
    /**
     * @param {string} secret - 32-character (256-bit) encryption key
     */
    constructor(secret) {
        if (!secret || secret.length < 32) {
            this.enabled = false;
        } else {
            this.key = Buffer.from(secret.slice(0, 32));
            this.algorithm = 'aes-256-gcm';
            this.enabled = true;
        }
    }

    /**
     * @param {string} text 
     * @returns {string} iv:tag:encrypted
     */
    encrypt(text) {
        if (!this.enabled) {
            throw new Error('Encryption secret not configured correctly (min 32 chars required)');
        }

        if (!text) return '';

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag().toString('hex');
        
        return `${iv.toString('hex')}:${tag}:${encrypted}`;
    }

    /**
     * @param {string} encryptedText 
     * @returns {string} original text
     */
    decrypt(encryptedText) {
        if (!this.enabled) {
            throw new Error('Encryption secret not configured correctly (min 32 chars required)');
        }

        if (!encryptedText) return '';

        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format');
        }

        const [ivHex, tagHex, encryptedData] = parts;
        
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

module.exports = Encryption;
