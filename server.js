import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const DEMO_MODE = true;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

function categoryFor(claim) {
  const text = claim.toLowerCase();

  if (text.includes('unesco') || text.includes('smartphone') || text.includes('school') || text.includes('education') || text.includes('छात्र')) {
    return 'education';
  }

  if (/health|cure|vaccine|disease|medicine|doctor|remedy|dengue|lemon|water|नींबू|स्वास्थ्य/.test(text)) {
    return 'health';
  }

  if (/scam|bank|otp|password|prize|winner|urgent|account|payment|लॉटरी/.test(text)) {
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
        reason: 'Verify official country-specific policies versus sweeping global interpretations.'
      },
      {
        title: 'Technology in Education Report',
        organisation: 'UNESCO',
        url: 'https://www.unesco.org/en/articles/global-education-monitoring-report-2023-technology-education-tool-whose-terms',
        reason: 'Read structural guidance on technology integration.'
      }
    ],
    health: [
      {
        title: 'Infodemic and health misinformation',
        organisation: 'World Health Organization',
        url: 'https://www.who.int/health-topics/infodemic',
        reason: 'Evaluate viral health claims against certified public-health consensus.'
      },
      {
        title: 'WHO Health Topics Index',
        organisation: 'World Health Organization',
        url: 'https://www.who.int/health-topics',
        reason: 'Cross-reference clinical advice before adopting remedies.'
      }
    ],
    scam: [
      {
        title: 'National Cyber Crime Reporting Portal',
        organisation: 'Government of India',
        url: 'https://www.cybercrime.gov.in/',
        reason: 'Report phishing links, fraudulent WhatsApp messages, and fake prize handles.'
      },
      {
        title: 'Indian Cyber Crime Coordination Centre',
        organisation: 'Government of India',
        url: 'https://www.cybercrime.gov.in/',
        reason: 'Never share OTPs, credentials, or bank verification tokens.'
      }
    ],
    general: [
      {
        title: 'Media and Information Literacy Curriculum',
        organisation: 'UNESCO',
        url: 'https://www.unesco.org/en/media-information-literacy',
        reason: 'Apply critical analysis tools: check provenance, context, and intent.'
      },
      {
        title: 'International Fact-Checking Network',
        organisation: 'Poynter Institute',
        url: 'https://ifcncodeofprinciples.poynter.org/',
        reason: 'Explore verified global fact-check databases.'
      }
    ]
  };

  return sources[category];
}

function demoAnalysis(claim) {
  const category = categoryFor(claim);

  const analyses = {
    education: {
      category: 'education',
      assessment: 'Potentially misleading',
      confidence: 42,
      summary: 'This claim overstates formal global mandates and requires primary documentation.',
      finding: 'Advisory guidance and pedagogical frameworks differ fundamentally from blanket prohibitions. Check official publication stamps.',
      redFlags: [
        'Absolute phrasing: Terms like "worldwide" imply universal rules that may not exist.',
        'Absent attribution: The claim does not cite a specific official resolution document.',
        'Context gap: Pedagogical recommendations are frequently misconstrued as legal bans.'
      ]
    },
    health: {
      category: 'health',
      assessment: 'Needs clinical verification',
      confidence: 31,
      summary: 'Health claims circulating online require backing from peer-reviewed institutions or public health authorities.',
      finding: 'Viral home remedy posts lack controlled clinical testing data. Anecdotal accounts do not constitute scientific proof.',
      redFlags: [
        'False authority: Misusing organization names (e.g., WHO) to validate unverified cures.',
        'Missing citation: No primary study author, journal name, or publication date provided.',
        'Emotional framing: Uses urgent wording intended to trigger immediate forwarding.'
      ]
    },
    scam: {
      category: 'scam',
      assessment: 'High fraud probability',
      confidence: 89,
      summary: 'This message contains structural markers typical of phishing attempts and social engineering.',
      finding: 'Official authorities and banking networks never request sensitive authentication tokens, PINs, or direct fees via messaging apps.',
      redFlags: [
        'Artificial urgency: Pressures users to act within a restricted timeframe.',
        'Credential harvesting: Demands secure information (OTPs/passwords).',
        'Unverified vector: Sent via unofficial channels instead of secured domains.'
      ]
    },
    general: {
      category: 'general',
      assessment: 'Needs context verification',
      confidence: 48,
      summary: 'This claim lacks source provenance, date validation, and independent corroboration.',
      finding: 'Always identify the original publisher and check if trusted independent outlets report identical facts.',
      redFlags: [
        'Provenance gap: Author or publishing institution is unstated.',
        'Temporal drift: Archived or outdated material reposted as current events.',
        'Headline bias: Sensational phrasing detached from body text.'
      ]
    }
  };

  return {
    ...analyses[category],
    sources: sourcesFor(category),
    mode: 'offline-demo'
  };
}

app.post('/api/analyse', async (req, res) => {
  const claimText = req.body?.claim?.trim();

  if (!claimText) {
    return res.status(400).json({ error: 'Please enter a claim or upload an image to analyse.' });
  }

  setTimeout(() => {
    res.json(demoAnalysis(claimText));
  }, 300);
});

app.listen(3000, () => {
  console.log('TruthLens running at http://localhost:3000');
});