
document.querySelectorAll('.burger').forEach(b=>{
  b.addEventListener('click', ()=>{ document.getElementById('mobileNav').classList.toggle('open'); });
});
document.querySelectorAll('.mobilenav a').forEach(a=>a.addEventListener('click',()=>{
  document.getElementById('mobileNav').classList.remove('open');
}));
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});
const CALC_RATE = { flat:95000, house:70000, commerce:80000, land:9000 };
function formatRub(n){ return Math.round(n/1000)*1000 <= 0 ? '0 ₽' : new Intl.NumberFormat('ru-RU').format(Math.round(n/1000)*1000) + ' ₽'; }
document.querySelectorAll('.calc-card').forEach(card=>{
  const type = card.querySelector('.calcType');
  const city = card.querySelector('.calcCity');
  const area = card.querySelector('.calcArea');
  const urgency = card.querySelector('.calcUrgency');
  const out = card.querySelector('.calc-result-value');
  function compute(){
    const rate = CALC_RATE[type.value] || 90000;
    const mult = parseFloat(city.value) || 1;
    const a = Math.max(parseFloat(area.value) || 0, 0);
    const market = rate * mult * a;
    const fast = urgency.value === 'fast';
    const low = market * (fast ? 0.70 : 0.82);
    const high = market * (fast ? 0.80 : 0.90);
    out.textContent = a > 0 ? `${formatRub(low)} – ${formatRub(high)}` : '—';
  }
  [type, city, area, urgency].forEach(el=>el && el.addEventListener('input', compute));
  compute();
});
document.querySelectorAll('.leadForm').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    form.style.display='none';
    form.nextElementSibling.classList.add('show');
  });
});
