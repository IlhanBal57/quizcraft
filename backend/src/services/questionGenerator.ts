import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface GeneratedQuestion {
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  imageUrl?: string;
  isVisualQuestion?: boolean;
}

const questionService = new OpenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

interface GenerateQuestionsParams {
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}

const difficultyDescriptions = {
  easy: 'straightforward questions suitable for beginners, focusing on well-known facts',
  medium: 'moderately challenging questions requiring some specific knowledge',
  hard: 'difficult questions requiring deep expertise and knowledge of obscure details',
};

// Country code mapping for flag images
const countryCodeMap: { [key: string]: string } = {
  'turkey': 'tr', 'türkiye': 'tr', 'france': 'fr', 'germany': 'de', 'italy': 'it',
  'spain': 'es', 'united kingdom': 'gb', 'uk': 'gb', 'england': 'gb', 'usa': 'us',
  'united states': 'us', 'america': 'us', 'japan': 'jp', 'china': 'cn', 'russia': 'ru',
  'brazil': 'br', 'argentina': 'ar', 'mexico': 'mx', 'canada': 'ca', 'australia': 'au',
  'india': 'in', 'south korea': 'kr', 'korea': 'kr', 'netherlands': 'nl', 'belgium': 'be',
  'sweden': 'se', 'norway': 'no', 'denmark': 'dk', 'finland': 'fi', 'poland': 'pl',
  'portugal': 'pt', 'greece': 'gr', 'switzerland': 'ch', 'austria': 'at', 'ireland': 'ie',
  'egypt': 'eg', 'south africa': 'za', 'nigeria': 'ng', 'morocco': 'ma', 'kenya': 'ke',
  'saudi arabia': 'sa', 'uae': 'ae', 'israel': 'il', 'thailand': 'th', 'vietnam': 'vn',
  'indonesia': 'id', 'philippines': 'ph', 'malaysia': 'my', 'singapore': 'sg', 'new zealand': 'nz',
  'colombia': 'co', 'chile': 'cl', 'peru': 'pe', 'venezuela': 've', 'ukraine': 'ua',
  'czech republic': 'cz', 'czechia': 'cz', 'hungary': 'hu', 'romania': 'ro', 'croatia': 'hr',
};

// Get flag image URL from country name
function getFlagImageUrl(countryName: string): string | null {
  const normalized = countryName.toLowerCase().trim();
  const code = countryCodeMap[normalized];
  if (code) {
    return `https://flagcdn.com/w320/${code}.png`;
  }
  return null;
}

export async function generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
  const { category, subcategory, difficulty, count } = params;
  const randomSeed = Math.random().toString(36).substring(7);
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Check if this is a geography/flags category for visual questions
  const isGeographyCategory = category.toLowerCase().includes('geography') || 
                              subcategory.toLowerCase().includes('flag') ||
                              subcategory.toLowerCase().includes('countr');

  // Only include visual questions for geography/flags
  const visualQuestionCount = isGeographyCategory ? Math.max(1, Math.floor(count * 0.3)) : 0;

  let visualInstructions = '';
  if (visualQuestionCount > 0) {
    visualInstructions = `
VISUAL FLAG QUESTIONS (IMPORTANT):
- Include exactly ${visualQuestionCount} flag identification questions
- For these questions, the format should be: "Which country's flag is shown above?"
- The correct answer MUST be a country name from this list: Turkey, France, Germany, Italy, Spain, United Kingdom, USA, Japan, China, Russia, Brazil, Argentina, Mexico, Canada, Australia, India, South Korea, Netherlands, Belgium, Sweden, Norway, Denmark, Finland, Poland, Portugal, Greece, Switzerland, Austria, Ireland, Egypt, South Africa, Nigeria, Morocco, Saudi Arabia, UAE, Israel, Thailand, Vietnam, Indonesia, Philippines, Malaysia, Singapore, New Zealand, Colombia, Chile, Peru, Ukraine, Czech Republic, Hungary, Romania, Croatia
- Set "isVisualQuestion": true and "flagCountry": "<country name>" (the correct answer country)
- The wrong options should be other country names
`;
  }

  const prompt = `You are a quiz question generator. Generate exactly ${count} unique multiple-choice questions about ${subcategory} in the ${category} category.

CRITICAL REQUIREMENTS:
- Difficulty level: ${difficulty} (${difficultyDescriptions[difficulty]})
- Current date: ${currentDate} - include up-to-date facts when relevant
- Each question must have exactly 4 options (A, B, C, D)
- Exactly ONE option must be correct
- Questions should be COMPLETELY VARIED and UNIQUE - never repeat topics
- Random seed for maximum variety: ${randomSeed}
- Avoid controversial, offensive, or inappropriate content
${visualInstructions}
Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "prompt": "Regular question text here?",
    "optionA": "First option",
    "optionB": "Second option", 
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctKey": "A",
    "explanation": "Brief explanation of why this is correct",
    "isVisualQuestion": false
  }${visualQuestionCount > 0 ? `,
  {
    "prompt": "Which country's flag is shown above?",
    "optionA": "France",
    "optionB": "Germany",
    "optionC": "Italy",
    "optionD": "Spain",
    "correctKey": "A",
    "explanation": "The French flag has blue, white, and red vertical stripes",
    "isVisualQuestion": true,
    "flagCountry": "France"
  }` : ''}
]`;

  console.log(`Generating ${count} questions for ${subcategory} (${category})...`);
  if (visualQuestionCount > 0) {
    console.log(`   Flag questions: ${visualQuestionCount}`);
  }

  const response = await questionService.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a quiz question generator that outputs only valid JSON arrays. Never include markdown formatting or code blocks. Generate creative, educational, and varied questions.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 1.0,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in response');
  }

  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const questions: (GeneratedQuestion & { flagCountry?: string })[] = JSON.parse(cleanContent);

  if (!Array.isArray(questions) || questions.length !== count) {
    throw new Error(`Expected ${count} questions, got ${questions?.length || 0}`);
  }

  console.log(`✅ Successfully generated ${questions.length} questions`);

  // Process questions - add flag images for visual questions
  const processedQuestions = questions.map((q) => {
    const result: GeneratedQuestion = {
      prompt: q.prompt,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctKey: q.correctKey as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation || undefined,
      isVisualQuestion: q.isVisualQuestion || false,
    };

    // Add flag image for visual questions
    if (q.isVisualQuestion && q.flagCountry) {
      const flagUrl = getFlagImageUrl(q.flagCountry);
      if (flagUrl) {
        result.imageUrl = flagUrl;
        console.log(`   🏳️ Flag question: ${q.flagCountry} -> ${flagUrl}`);
      }
    }

    return result;
  });

  const visualCount = processedQuestions.filter(q => q.imageUrl).length;
  console.log(`   Total flag questions with images: ${visualCount}`);

  return processedQuestions;
}
