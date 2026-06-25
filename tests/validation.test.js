const { ClaudeManager } = require('../src/services/ClaudeManager');
const { ValidationError } = require('../src/errors/ClaudeErrors');

describe('ClaudeManager Response Validation', () => {
    let claudeManager;
    let mockLogger;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        claudeManager = new ClaudeManager({
            browserManager: {},
            logger: mockLogger,
            config: {},
            workerState: {}
        });
    });

    test('Test A: Structured response object succeeds', () => {
        const response = {
            text: 'This is a long enough response with more than twenty words to ensure that the meaningful content check passes correctly as expected by the system logic.',
            html: '<p>Some content</p>'
        };
        const prompt = 'Some prompt';
        
        expect(claudeManager.validateResponse(response, prompt)).toBe(true);
        expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({
            event: 'VALIDATION_INPUT',
            responseType: 'object'
        }));
    });

    test('Test B: Legacy string response succeeds', () => {
        const response = 'This is a long enough response with more than twenty words to ensure that the meaningful content check passes correctly as expected by the system logic.';
        const prompt = 'Some prompt';
        
        expect(claudeManager.validateResponse(response, prompt)).toBe(true);
        expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({
            event: 'VALIDATION_INPUT',
            responseType: 'string'
        }));
    });

    test('Test C: Empty object response fails with EMPTY_RESPONSE', () => {
        const response = { text: '' };
        const prompt = 'Some prompt';
        
        try {
            claudeManager.validateResponse(response, prompt);
            fail('Should have thrown ValidationError');
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.type).toBe('EMPTY_RESPONSE');
            expect(error.retryable).toBe(true);
        }
    });

    test('Test D: Short response fails with SHORT_RESPONSE', () => {
        const response = { text: 'Too short' };
        const prompt = 'Some prompt';
        
        try {
            claudeManager.validateResponse(response, prompt);
            fail('Should have thrown ValidationError');
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.type).toBe('SHORT_RESPONSE');
            expect(error.retryable).toBe(false);
        }
    });
});
