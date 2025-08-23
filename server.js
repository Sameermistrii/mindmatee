import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS for better compatibility
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add body parsers so req.body is available
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Optimize static file serving for Render
app.use(express.static(__dirname, {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        } else if (path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        } else if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300');
        }
    }
}));

// Health check endpoint with enhanced status
app.get('/api/health', (req, res) => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const uptime = process.uptime();
    const isFreshStart = uptime < 120; // Less than 2 minutes
    
    res.json({
        ok: true,
        status: isFreshStart ? 'waking_up' : 'fully_awake',
        hasOpenAI,
        hasGemini,
        uptime: uptime,
        isFreshStart: isFreshStart,
        message: isFreshStart ? 'Server just woke up from sleep mode' : 'Server is fully operational',
        timestamp: new Date().toISOString()
    });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        let { provider, model, messages, max_tokens, temperature } = req.body;
        provider = provider || 'gemini';
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid request parameters: messages array required' });
        }

        if (provider === 'gemini') {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('Gemini API key not configured');
            }
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });
            const result = await geminiModel.generateContent(messages[messages.length - 1].content);
            const geminiResponse = await result.response;
            return res.json({ response: geminiResponse.text() });
        } else {
            return res.status(400).json({ error: 'Invalid provider. Use "gemini"' });
        }
    } catch (error) {
        console.error('AI API Error:', error);
        const userMessage = Array.isArray(req.body?.messages) && req.body.messages.length > 0
            ? req.body.messages[req.body.messages.length - 1].content
            : '';
        const fallbackResponse = [
            `Here’s a quick career plan${userMessage ? ` for: "${userMessage}"` : ''}:`,
            `• Clarify your 1 goal this month`,
            `• Pick 1 skill to learn this week`,
            `• Start 1 free course (NPTEL/SWAYAM/YouTube) today`,
            `• Build 1 small project to practice`,
            `• Network with 2 people in your field`,
            `• Review progress every Sunday`
        ].join('\n');
        return res.json({ response: fallbackResponse, fallback: true });
    }
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced error handling
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again.',
        details: error && error.message ? error.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`MindMate server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Port: ${PORT}`);
});


