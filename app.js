const claim = document.querySelector('#claim');
const counter = document.querySelector('#counter');
const analyse = document.querySelector('#analyse');
const result = document.querySelector('#result');
const reset = document.querySelector('#reset');
const shareMil = document.querySelector('#share-mil'); 

const tabText = document.querySelector('#tab-text');
const tabImage = document.querySelector('#tab-image');
const textInputContainer = document.querySelector('#text-input-container');
const imageInputContainer = document.querySelector('#image-input-container');
const imageFile = document.querySelector('#image-file');
const dropZone = document.querySelector('#drop-zone');
const imagePreview = document.querySelector('#image-preview');
const uploadLabel = document.querySelector('#upload-label');

const telemetryLogs = document.querySelector('#telemetry-logs');
const telemetryStatus = document.querySelector('#telemetry-status');

let currentMode = 'text';
let extractedOCRText = '';

function logTelemetry(stepText, statusColor = '#c9f04e') {
  if (!telemetryStatus || !telemetryLogs) return;
  telemetryStatus.style.color = statusColor;
  telemetryLogs.innerHTML += `<br>> ${stepText}`;
  telemetryLogs.scrollTop = telemetryLogs.scrollHeight;
}

// Tab switching logic
tabText.addEventListener('click', () => {
  currentMode = 'text';
  tabText.classList.add('active');
  tabImage.classList.remove('active');
  textInputContainer.classList.remove('hidden');
  imageInputContainer.classList.add('hidden');
  count();
  logTelemetry('Switched mode to Manual Text Input.');
});

tabImage.addEventListener('click', () => {
  currentMode = 'image';
  tabImage.classList.add('active');
  tabText.classList.remove('active');
  imageInputContainer.classList.remove('hidden');
  textInputContainer.classList.add('hidden');
  counter.textContent = extractedOCRText ? 'OCR Ready' : 'Upload image';
  logTelemetry('Switched mode to Screenshot OCR Parser.');
});

// Drop zone handlers for image OCR
dropZone.addEventListener('click', () => imageFile.click());
imageFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  imagePreview.src = imageUrl;
  imagePreview.classList.remove('hidden');
  uploadLabel.textContent = `Processing OCR: ${file.name}...`;
  analyse.disabled = true;
  logTelemetry(`Loaded image file: ${file.name}. Initializing Tesseract OCR worker...`, '#f9b46a');

  try {
    const worker = await Tesseract.createWorker('eng+hin');
    const ret = await worker.recognize(file);
    await worker.terminate();

    extractedOCRText = ret.data.text.trim();
    uploadLabel.textContent = `Extracted: "${extractedOCRText.substring(0, 40)}..."`;
    counter.textContent = `${extractedOCRText.length} chars (OCR)`;
    logTelemetry(`OCR Extraction successful! Extracted ${extractedOCRText.length} characters.`, '#c9f04e');
  } catch (err) {
    console.error(err);
    uploadLabel.textContent = 'OCR Extraction failed. Try a clearer image.';
    logTelemetry('OCR Extraction failed. Please try a clearer image file.', '#ff6b6b');
  } finally {
    analyse.disabled = false;
  }
});

function count() {
  if (currentMode === 'text') {
    counter.textContent = `${claim.value.length} / 1000`;
  }
}

function renderSources(sources) {
  const sourceList = document.querySelector('#source-list');
  sourceList.innerHTML = '';

  sources.forEach((source) => {
    const card = document.createElement('a');
    card.className = 'source-card';
    card.href = source.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const title = document.createElement('strong');
    title.textContent = source.title;

    const organisation = document.createElement('span');
    organisation.textContent = source.organisation;

    const reason = document.createElement('p');
    reason.textContent = source.reason;

    card.append(title, organisation, reason);
    sourceList.appendChild(card);
  });
}

function showAnalysis(data) {
  document.querySelector('#verdict-title').textContent = data.assessment;
  document.querySelector('#score').textContent = data.confidence;
  document.querySelector('#verdict-summary').textContent = data.summary;
  document.querySelector('#finding').textContent = data.finding;

  // Update dynamic flowchart nodes
  document.querySelector('#node-type').textContent = data.category.toUpperCase();
  document.querySelector('#node-source').textContent = `${data.sources.length} Ref(s)`;
  document.querySelector('#node-outcome').textContent = data.assessment.split(' ')[0];

  const flags = document.querySelector('#flags');
  flags.innerHTML = '';

  data.redFlags.forEach((flag) => {
    const item = document.createElement('li');
    item.textContent = flag;
    flags.appendChild(item);
  });

  renderSources(data.sources);
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  logTelemetry(`Analysis complete. Assigned Category: [${data.category.toUpperCase()}] | Confidence: ${data.confidence}%`, '#c9f04e');
}

claim.addEventListener('input', count);
count();

// Keyboard shortcut support (Ctrl/Cmd + Enter)
claim.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    analyse.click();
  }
});

analyse.addEventListener('click', async () => {
  const textPayload = currentMode === 'text' ? claim.value.trim() : extractedOCRText;

  if (!textPayload) {
    if (currentMode === 'text') claim.focus();
    else alert('Please upload an image with text first.');
    logTelemetry('Analysis aborted: Empty payload detected.', '#ff6b6b');
    return;
  }

  analyse.textContent = 'Analysing…';
  analyse.disabled = true;

  logTelemetry('Parsing text payload & checking structural constraints...', '#f9b46a');

  setTimeout(() => {
    logTelemetry('Routing through category classifier (EDU/HEALTH/SCAM/GEN)...', '#f9b46a');
  }, 200);

  setTimeout(() => {
    logTelemetry('Cross-referencing verified institutional registries...', '#f9b46a');
  }, 400);

  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: textPayload })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    showAnalysis(data);
  } catch (error) {
    alert(error.message || 'Something went wrong. Please try again.');
    logTelemetry(`Error encountered: ${error.message || 'Unknown error'}`, '#ff6b6b');
  } finally {
    analyse.disabled = false;
    analyse.innerHTML = 'Analyse claim <span>→</span>';
  }
});

reset.addEventListener('click', () => {
  claim.value = '';
  extractedOCRText = '';
  imagePreview.classList.add('hidden');
  uploadLabel.textContent = 'Click to upload screenshot or drag & drop here';
  count();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  logTelemetry('System reset. Awaiting next evaluation input...');
});

shareMil.addEventListener('click', () => {
  const verdict = document.querySelector('#verdict-title').textContent;
  const finding = document.querySelector('#finding').textContent;
  
  const summaryText = `🛡️ TruthLens Verification Report\nAssessment: ${verdict}\nFinding: ${finding}\n\nPause, check sources, and think critically before sharing!`;
  
  navigator.clipboard.writeText(summaryText)
    .then(() => {
      const originalText = shareMil.innerHTML;
      shareMil.innerHTML = 'Copied to Clipboard! ✓';
      logTelemetry('Exported MIL Summary to clipboard.', '#c9f04e');
      
      setTimeout(() => {
        shareMil.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      logTelemetry('Failed to export MIL Summary.', '#ff6b6b');
    });
});