
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

/*
|--------------------------------------------------------------------------
| Simple In-Memory Cache
|--------------------------------------------------------------------------
*/

const questionCache = new Map();
const MAX_CACHE_SIZE = 100;

/*
|--------------------------------------------------------------------------
| OpenRouter Client
|--------------------------------------------------------------------------
*/

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer':
      process.env.SITE_URL || 'http://localhost:3000',
    'X-Title':
      process.env.SITE_NAME || 'Samvidhan Sarthi'
  }
});

/*
|--------------------------------------------------------------------------
| Constitutional Assistant Route
|--------------------------------------------------------------------------
*/

router.post('/', async (req, res) => {
  try {

    const { question } = req.body || {};

    if (
      !question ||
      typeof question !== 'string' ||
      question.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const cleanQuestion = question.trim();

    /*
    |--------------------------------------------------------------------------
    | Return Cached Response
    |--------------------------------------------------------------------------
    */

    if (questionCache.has(cleanQuestion)) {
      return res.json(questionCache.get(cleanQuestion));
    }

    /*
    |--------------------------------------------------------------------------
    | Constitutional System Prompt
    |--------------------------------------------------------------------------
    */

    const systemPrompt = `
You are Samvidhan AI, an educational constitutional assistant for India.

Your role is to help students and citizens understand:

- Constitution of India
- Fundamental Rights
- Fundamental Duties
- Directive Principles of State Policy
- Parliament
- Judiciary
- Constitutional Bodies
- Elections
- Constitutional Amendments
- Landmark Supreme Court Cases
- Governance and Democracy

Rules:

1. Explain in simple language.
2. Assume the user is a beginner.
3. Keep answers SHORT.
4. Prefer 3-8 lines.
5. Use bullet points when useful.
6. Mention article numbers only if relevant.
7. Avoid large tables unless specifically requested.
8. Avoid lengthy legal explanations.
9. Never provide legal advice.
10. If user asks for details, then give a longer answer.
11. Focus only on constitutional and civic learning.
12. Be conversational and friendly.

Answer Format:

For normal questions:
- Short explanation
- Key Article (if applicable)
- One simple example

Keep responses under 150 words unless the user asks for a detailed explanation.
`;

    /*
    |--------------------------------------------------------------------------
    | Models
    |--------------------------------------------------------------------------
    */

    const PRIMARY_MODEL =
      process.env.OPENROUTER_MODEL ||
      'meta-llama/llama-3.3-70b-instruct:free';

    const FALLBACK_MODEL =
      process.env.OPENROUTER_FALLBACK_MODEL ||
      'mistralai/mistral-7b-instruct:free';

    const triedModels = [];

    async function askModel(modelName) {
      triedModels.push(modelName);

      const completion =
        await openai.chat.completions.create({
          model: modelName,
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: cleanQuestion
            }
          ]
        });

      return (
        completion?.choices?.[0]?.message?.content ||
        'Sorry, I could not generate a response.'
      );
    }

    let answer = '';

    try {
      answer = await askModel(PRIMARY_MODEL);
    } catch (primaryError) {

      console.warn(
        'Primary model failed:',
        primaryError.message
      );

      try {
        answer = await askModel(FALLBACK_MODEL);
      } catch (fallbackError) {

        console.warn(
          'Fallback model failed:',
          fallbackError.message
        );
      }
    }

    if (!answer) {
      return res.status(502).json({
        success: false,
        message: 'AI service unavailable',
        triedModels
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    const result = {
      success: true,
      answer,
      modelUsed: triedModels[triedModels.length - 1]
    };

    /*
    |--------------------------------------------------------------------------
    | Cache Result
    |--------------------------------------------------------------------------
    */

    questionCache.set(cleanQuestion, result);

    if (questionCache.size > MAX_CACHE_SIZE) {
      const oldestKey =
        questionCache.keys().next().value;

      questionCache.delete(oldestKey);
    }

    return res.json(result);

  } catch (error) {

    console.error(
      'Constitutional Assistant Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
