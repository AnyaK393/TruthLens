const claim = document.querySelector('#claim');
const counter = document.querySelector('#counter');
const analyse = document.querySelector('#analyse');
const result = document.querySelector('#result');
const reset = document.querySelector('#reset');

function count() {
  counter.textContent = `${claim.value.length} / 1000`;
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
}

claim.addEventListener('input', count);
count();

analyse.addEventListener('click', async () => {
  if (!claim.value.trim()) {
    claim.focus();
    return;
  }

  analyse.textContent = 'Analysing…';
  analyse.disabled = true;

  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: claim.value })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    showAnalysis(data);
  } catch (error) {
    alert(error.message || 'Something went wrong. Please try again.');
  } finally {
    analyse.disabled = false;
    analyse.innerHTML = 'Analyse claim <span>→</span>';
  }
});

reset.addEventListener('click', () => {
  claim.value = '';
  count();
  claim.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});