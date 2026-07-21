const claim = document.querySelector('#claim');
const counter = document.querySelector('#counter');
const analyse = document.querySelector('#analyse');
const result = document.querySelector('#result');
const reset = document.querySelector('#reset');
function count(){counter.textContent = `${claim.value.length} / 1000`;}
claim.addEventListener('input', count); count();
analyse.addEventListener('click', () => {
  if (!claim.value.trim()) { claim.focus(); return; }
  analyse.textContent = 'Analysing…';
  setTimeout(() => { result.classList.remove('hidden'); analyse.innerHTML = 'Analyse claim <span>→</span>'; result.scrollIntoView({behavior:'smooth', block:'start'}); }, 650);
});
reset.addEventListener('click', () => { claim.value=''; count(); claim.focus(); window.scrollTo({top:0,behavior:'smooth'}); });
