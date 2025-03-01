require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { YoutubeTranscript } = require('youtube-transcript');
const { Groq } = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const urlParser = require('url');

const router = express.Router();

// Initialize Groq client
const client = new Groq(process.env.GROQ_API_KEY);

const summarizePrompt = "Summarize the following content in bullet points: ";
const combineSummaryPrompt = "Combine these summaries of different parts of content into a single coherent summary with the most important points: ";

// Determine URL type and extract content
async function extractContent(url) {
    try {
        const parsedUrl = urlParser.parse(url);
        const hostname = parsedUrl.hostname;

        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return await extractYoutubeTranscript(url);
        } else {
            return await extractWebsiteContent(url);
        }
    } catch (error) {
        throw new Error(`Content extraction failed: ${error.message}`);
    }
}

// Extract YouTube video transcript
async function extractYoutubeTranscript(youtubeVideoUrl) {
    try {
        let videoId;
        if (youtubeVideoUrl.includes('youtu.be')) {
            videoId = youtubeVideoUrl.split('/').pop();
        } else if (youtubeVideoUrl.includes('v=')) {
            videoId = youtubeVideoUrl.split('v=')[1].split('&')[0];
        } else {
            throw new Error('Invalid YouTube URL format');
        }

        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        let transcript = transcriptItems.map(item => item.text).join(' ');

        return { content: transcript, type: 'youtube', videoId: videoId };
    } catch (error) {
        throw new Error(`YouTube transcript extraction failed: ${error.message}`);
    }
}

// Extract website content
async function extractWebsiteContent(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        $('script, style, nav, footer, header, iframe, [role="banner"], [role="navigation"]').remove();

        const title = $('title').text().trim();
        let mainContent = '';

        const contentSelectors = [
            'article', 'main', '.content', '#content', '.post', '.article', 
            '[role="main"]', '.main-content', '.post-content', '.entry-content'
        ];

        for (const selector of contentSelectors) {
            if ($(selector).length) {
                mainContent += $(selector).text().trim() + ' ';
            }
        }

        if (!mainContent.trim()) {
            mainContent = $('body').text().trim();
        }

        mainContent = mainContent.replace(/\s+/g, ' ').trim();

        return { content: mainContent, type: 'website', title: title, url: url };
    } catch (error) {
        throw new Error(`Website content extraction failed: ${error.message}`);
    }
}

// Split text into manageable chunks
function chunkText(text, maxChunkSize = 3000) {
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = [];

    for (const word of words) {
        currentChunk.push(word);
        if (currentChunk.length >= maxChunkSize) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}

// Generate summary using Groq API
async function generateGroqContent(text, prompt, model = "llama3-70b-8192", maxTokens = 80000) {
    try {
        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt + text }
            ],
            temperature: 0.5,
            max_tokens: maxTokens
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("API Error:", error);
        return `Error generating content: ${error.message}`;
    }
}

// Process content in chunks and generate final summary
async function processContentInChunks(content, initialPrompt, combinePrompt, maxChunkTokens = 3000) {
    const chunks = chunkText(content, maxChunkTokens);
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
        const result = await generateGroqContent(chunks[i], initialPrompt);
        results.push(result);
    }

    if (results.length === 1) {
        return results[0];
    }

    const combinedResults = results.join("\n\n");
    return await generateGroqContent(combinedResults, combinePrompt);
}

// Get preview image
function getPreviewImage(contentData) {
    if (contentData.type === 'youtube') {
        return `http://img.youtube.com/vi/${contentData.videoId}/0.jpg`;
    } else {
        return `/img/website-placeholder.png`;
    }
}

// Routes
router.get('/', (req, res) => {
    res.json({
        message: "Welcome to the content summarization API",
        instructions: "Send a POST request to /process with a 'url' in the body."
    });
});

router.post('/process', async (req, res) => {
    const inputUrl = req.body.url;

    if (!inputUrl) {
        return res.status(400).json({ error: "URL is required in the request body." });
    }

    try {
        const contentData = await extractContent(inputUrl);

        if (contentData && contentData.content) {
            const summary = await processContentInChunks(
                contentData.content,
                summarizePrompt,
                combineSummaryPrompt
            );

            const previewImage = getPreviewImage(contentData);

            const contentTitle = contentData.type === 'youtube' ? 
                'YouTube Video Summary' : 
                (contentData.title || 'Website Content Summary');

            res.json({
                preview: previewImage,
                summary: summary,
                contentTitle: contentTitle,
                url: inputUrl
            });
        } else {
            res.status(400).json({ error: "Could not extract meaningful content from URL." });
        }
    } catch (error) {
        res.status(500).json({ error: `Error: ${error.message}` });
    }
});

module.exports = router;
