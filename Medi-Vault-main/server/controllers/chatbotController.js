const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Translate } = require('@google-cloud/translate').v2;
const i18next = require('i18next');

// Initialize Gemini with error handling
let genAI;
try {
  console.log('Checking for GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL ERROR: Gemini API key is not configured. Set GEMINI_API_KEY in your environment variables.');
  } else {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini API initialized successfully');
  }
} catch (error) {
  console.error('Gemini initialization error:', error);
}

// Initialize Google Translate with error handling
let translate;
try {
  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_TRANSLATE_API_KEY) {
    console.error('CRITICAL ERROR: Google Translate API configuration is missing or incomplete. Set GOOGLE_PROJECT_ID and GOOGLE_TRANSLATE_API_KEY in your environment variables.');
  } else {
    translate = new Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
      key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
    console.log('Google Translate API initialized successfully');
  }
} catch (error) {
  console.error('Google Translate initialization error:', error);
}

// Initialize i18next
i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: require('../locales/en.json')
    },
    hi: {
      translation: require('../locales/hi.json')
    }
  }
});

// Detect language
const detectLanguage = async (text) => {
  try {
    if (!translate) {
      throw new Error('Translation service not initialized');
    }
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on errors
  }
};

// Translate text
const translateText = async (text, targetLang) => {
  try {
    if (!translate) {
      throw new Error('Translation service not initialized');
    }
    const [translation] = await translate.translate(text, targetLang);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on errors
  }
};

// Process chat message with improved error handling
exports.processMessage = async (req, res) => {
  try {
    console.log('Processing chat message:', req.body);
    console.log('Gemini API status:', genAI ? 'Initialized' : 'Not initialized');
    const { message, language = 'en' } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid message',
        error: 'INVALID_INPUT'
      });
    }
    
    if (!genAI) {
      console.error('Gemini client is not initialized');
      return res.status(503).json({
        message: "The medical assistant service is currently unavailable. Please try again later.",
        error: 'SERVICE_UNAVAILABLE'
      });
    }

    // Translate message to English if needed
    let translatedMessage = message;
    if (language !== 'en' && translate) {
      try {
        const [translation] = await translate.translate(message, 'en');
        translatedMessage = translation;
        console.log('Translated message:', translatedMessage);
      } catch (translationError) {
        console.error('Translation error:', translationError);
        // Continue with original message if translation fails
      }
    }

    try {
      // Create a simple prompt that works reliably with Gemini
      const prompt = `You are a helpful healthcare assistant. Answer this health-related question concisely: ${translatedMessage}`;
      console.log('Sending prompt to Gemini:', prompt);
      
      // Use the correct API version and model name
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        apiVersion: "v1" 
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Extract text in a way that works with Gemini's response format
      let responseText = '';
      try {
        responseText = response.text();
        console.log('Response from Gemini:', responseText);
      } catch (textError) {
        console.error('Error extracting text from response:', textError);
        // Fallback for text extraction
        try {
          responseText = JSON.stringify(response);
          console.log('Fallback response:', responseText);
        } catch (jsonError) {
          console.error('JSON stringify error:', jsonError);
          responseText = 'I apologize, but I encountered an issue processing your request.';
        }
      }

      // Translate response back to original language if needed
      if (language !== 'en' && translate) {
        try {
          const [translation] = await translate.translate(responseText, language);
          responseText = translation;
          console.log('Translated response:', responseText);
        } catch (translationError) {
          console.error('Response translation error:', translationError);
          // Continue with English response if translation fails
        }
      }

      res.json({ message: responseText });
    } catch (error) {
      console.error('Specific error details:', error);
      
      // Handle Gemini specific errors
      if (error.status === 429) {
        console.error('Gemini API rate limit exceeded:', error);
        res.status(503).json({
          message: "I'm currently experiencing high traffic. Please try again in a few moments.",
          error: 'RATE_LIMIT_EXCEEDED'
        });
      } else if (error.status === 403) {
        console.error('Gemini API quota exceeded:', error);
        res.status(503).json({
          message: "Service temporarily unavailable. Please try again later.",
          error: 'QUOTA_EXCEEDED'
        });
      } else {
        console.error('Gemini API error:', error);
        res.status(500).json({
          message: "I encountered an error processing your request. Please try again.",
          error: 'API_ERROR'
        });
      }
    }
  } catch (error) {
    console.error('General chatbot error:', error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
      error: 'GENERAL_ERROR'
    });
  }
};

// Get supported languages with improved error handling
exports.getSupportedLanguages = async (req, res) => {
  try {
    if (!translate) {
      throw new Error('Translation service not initialized');
    }
    const [languages] = await translate.getLanguages();
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ 
      message: 'Error fetching supported languages', 
      error: error.message 
    });
  }
};