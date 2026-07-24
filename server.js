import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const app = express();
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

const client = DEMO_MODE
  ? null
  : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

function categoryFor(claim) {
  const text = claim.toLowerCase();

  if (text.includes('unesco') || text.includes('smartphone') || text.includes('school')) {
    return 'education';
  }

  if (/health|cure|vaccine|disease|medicine|doctor|remedy|dengue/.test(text)) {
    return 'health';
  }

  if (/scam|bank|otp|password|prize|winner|urgent|account|payment/.test(text)) {
    return 'scam';
  }

  return 'general';
}

function sourcesFor(category) {
  const sources = {
    education: [
      {
        title: 'UNESCO: Smartphones in schools',
        organisation: 'UNESCO Global Education Monitoring Report',
        url: 'https://www.unesco.org/en/articles/smartphones-school-only-when-they-clearly-support-learning',
        reason: 'Check the difference between country policies and a global UNESCO rule.'
      },
      {
        title: 'Technology in Education Report',
        organisation: 'UNESCO',
        url: 'https://www.unesco.org/en/articles/global-education-monitoring-report-2023-technology-education-tool-whose-terms',
        reason: 'Read UNESCO guidance on technology and learning.'
      }
    ],
    health: [
      {
        title: 'Infodemic and health misinformation',
        organisation: 'World Health Organization',
        url: 'https://www.who.int/health-topics/infodemic',
        reason: 'Use public-health sources to evaluate health claims.'
      },
      {
        title: 'WHO Health Topics',
        organisation: 'World Health Organization',
        url: 'https://www.who.int/health-topics',
        reason: 'Look for official, current guidance on the health topic.'
      }
    ],
    scam: [
      {
        title: 'National Cyber Crime Reporting Portal',
        organisation: 'Government of India',
        url: 'https://www.cybercrime.gov.in/',
        reason: 'Check or report suspicious websites, numbers, emails, and social-media accounts.'
      },
      {
        title: 'Report and Check Suspect',
        organisation: 'Indian Cyber Crime Coordination Centre',
        url: 'https://www.cybercrime.gov.in/',
        reason: 'Never share OTPs, passwords, or banking details through an unexpected message.'
      }
    ],
    general: [
      {
        title: 'Media and Information Literacy',
        organisation: 'UNESCO',
        url: 'https://www.unesco.org/en/media-information-literacy',
        reason: 'Use MIL skills to identify the author, purpose, evidence, and missing context.'
      },
      {
        title: 'International Fact-Checking Network',
        organisation: 'Poynter Institute',
        url: 'https://ifcncodeofprinciples.poynter.org/',
        reason: 'Find fact-checking organisations that follow professional standards.'
      }
    ]
  };

  return sources[category];
}

function demoAnalysis(claim) {
  const category = categoryFor(claim);

  const analyses = {
    education: {
      assessment: 'Potentially misleading',
      confidence: 42,
      summary: 'This claim may overstate UNESCO’s position and needs an original official source.',
      finding: 'A recommendation or educational guideline is different from a worldwide legal ban. Check the official publication and date.',
      redFlags: [
        'Absolute wording: “Worldwide” suggests a sweeping rule.',
        'Missing source: No official announcement is named.',
        'Missing context: Guidance and a legal ban are different.'
      ]
    },
    health: {
      assessment: 'Needs more evidence',
      confidence: 35,
      summary: 'Health claims should be verified with qualified medical and public-health sources.',
      finding: 'The claim needs a current, credible medical source or study. Viral posts and personal stories are not enough evidence for health decisions.',
      redFlags: [
        'Health claim: Verify it with a public-health authority.',
        'Missing evidence: Look for the named study, author, and date.',
        'Urgency language: Avoid posts that pressure people to share immediately.'
      ]
    },
    scam: {
      assessment: 'Potentially misleading',
      confidence: 61,
      summary: 'This message has signals commonly associated with online scams or phishing.',
      finding: 'Legitimate organisations generally do not ask for passwords, OTPs, or urgent payment through unexpected messages.',
      redFlags: [
        'Urgency: Scams often pressure you to act immediately.',
        'Sensitive data: Never share passwords, OTPs, or bank details.',
        'Independent check: Contact the organisation through its official website.'
      ]
    },
    general: {
      assessment: 'Needs more context',
      confidence: 48,
      summary: 'This claim needs an original source, date, and independent context before it is shared.',
      finding: 'Check who first made the claim, when it was published, and whether credible independent sources report the same information.',
      redFlags: [
        'Source check: Find the original author or organisation.',
        'Date check: Old content is often reshared as new.',
        'Context check: Read beyond the headline or screenshot.'
      ]
    }
  };

  return {
    ...analyses[category],
    sources: sourcesFor(category),
    mode: 'demo'
  };
}

app.post('/api/analyse', async (req, res) => {
  const claim = req.body?.claim?.trim();

  if (!claim) {
    return res.status(400).json({ error: 'Please enter a claim to analyse.' });
  }

  if (DEMO_MODE) {
    return res.json(demoAnalysis(claim));
  }

  try {
    const response = await client.responses.create({
      model: 'gpt-5',
      store: false,
      input: `Analyse this claim as a media-literacy educator. Do not invent evidence or sources. Return JSON with: assessment, confidence, summary, finding, redFlags. Claim: ${claim}`
    });

    res.json({
      ...JSON.parse(response.output_text),
      sources: sourcesFor(categoryFor(claim)),
      mode: 'ai'
    });
  } catch (error) {
    console.error(error);
    res.json({ ...demoAnalysis(claim), mode: 'demo-fallback' });
  }
});

app.listen(3000, () => {
  console.log('TruthLens is running at http://localhost:3000');
  console.log(`Mode: ${DEMO_MODE ? 'offline demo' : 'OpenAI API'}`);
});