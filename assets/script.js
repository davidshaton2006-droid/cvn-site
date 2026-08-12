
(function(){
  const revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window){
    const revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el=>revealObserver.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }
  // Safety net: never let content stay hidden if something above misfires.
  setTimeout(()=>revealEls.forEach(el=>el.classList.add('in')), 4000);
})();

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
const DIAG_ROUTES = {
  sell:{ page:'vykup.html', title:'Срочный выкуп недвижимости', text:'Покупаем объект напрямую, без показов и ожидания «своего» покупателя. Оценка — за 24 часа.' },
  cash:{ page:'zaymy.html', title:'Займ под залог недвижимости', text:'Получаете деньги, объект остаётся в вашей собственности — только залог на срок займа.' },
  invest:{ page:'investoram.html', title:'Инвестиции в недвижимость', text:'Капитал работает на конкретный объект — покупку, подготовку и продажу ведёт компания.' }
};
const DIAG_TIME = {
  sell:{ urgent:'2–3 дня после осмотра объекта', month:'7–14 дней от заявки до расчёта', flex:'по вашему графику, от 7 дней' },
  cash:{ urgent:'1–3 дня на решение и договор', month:'до 7 дней от заявки до денег', flex:'по договорённости, без спешки' },
  invest:{ urgent:'подбор объекта — от нескольких дней', month:'подбор объекта — 2–4 недели', flex:'без ограничения по срокам' }
};
const DIAG_ISSUE_TEXT = {
  mortgage:'учтём остаток по ипотеке при расчёте суммы',
  owners:'проверим доли всех собственников и распределим сумму',
  lien:'потребуется юридическая проверка обременения перед сделкой',
  none:'дополнительная юридическая проверка не потребуется'
};
document.querySelectorAll('.diag-card').forEach(card=>{
  const state = { goal:null, speed:null, issues:[] };
  let step = 1;
  const steps = card.querySelectorAll('.diag-step');
  const dots = card.querySelectorAll('.diag-dot');
  const result = card.querySelector('.diag-result');
  const progress = card.querySelector('.diag-progress');

  function showStep(n){
    step = n;
    steps.forEach(s=>s.classList.toggle('active', Number(s.dataset.step) === n));
    result.classList.remove('active');
    dots.forEach(d=>{
      const ds = Number(d.dataset.step);
      d.classList.toggle('active', ds === n);
      d.classList.toggle('done', ds < n);
    });
  }

  card.querySelectorAll('.diag-step[data-step="1"] .diag-opt, .diag-step[data-step="2"] .diag-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.key, value = btn.dataset.value;
      state[key] = value;
      btn.parentElement.querySelectorAll('.diag-opt').forEach(o=>o.classList.remove('sel'));
      btn.classList.add('sel');
      setTimeout(()=> showStep(step + 1), 220);
    });
  });

  const issueOpts = card.querySelectorAll('.diag-step[data-step="3"] .diag-opt');
  const nextBtn = card.querySelector('.diag-next');
  issueOpts.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const value = btn.dataset.value;
      if(value === 'none'){
        issueOpts.forEach(o=>o.classList.remove('sel'));
        btn.classList.add('sel');
        state.issues = ['none'];
      } else {
        btn.classList.toggle('sel');
        card.querySelector('.diag-opt[data-value="none"]').classList.remove('sel');
        state.issues = Array.from(issueOpts).filter(o=>o.classList.contains('sel')).map(o=>o.dataset.value);
      }
      nextBtn.classList.toggle('ready', state.issues.length > 0);
    });
  });

  card.querySelectorAll('.diag-back').forEach(btn=>{
    btn.addEventListener('click', ()=> showStep(Math.max(1, step - 1)));
  });

  if(nextBtn){
    nextBtn.addEventListener('click', ()=>{
      if(!state.goal || state.issues.length === 0) return;
      const route = DIAG_ROUTES[state.goal];
      const time = (DIAG_TIME[state.goal] || {})[state.speed] || 'уточним после заявки';
      const notes = state.issues.map(i => DIAG_ISSUE_TEXT[i]).filter(Boolean);
      const noteText = notes.length ? notes.join('; ') : 'дополнительная юридическая проверка не потребуется';

      result.querySelector('.diag-result-title').textContent = route.title;
      result.querySelector('.diag-result-text').textContent = route.text;
      result.querySelector('.diag-result-time').textContent = time;
      result.querySelector('.diag-result-note').textContent = noteText.charAt(0).toUpperCase() + noteText.slice(1);
      result.querySelector('.diag-result-link').href = route.page;

      steps.forEach(s=>s.classList.remove('active'));
      dots.forEach(d=>d.classList.add('done'));
      if(progress) progress.style.display = 'none';
      result.classList.add('active');
    });
  }

  card.querySelectorAll('.diag-restart').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.goal = null; state.speed = null; state.issues = [];
      card.querySelectorAll('.diag-opt').forEach(o=>o.classList.remove('sel'));
      if(nextBtn) nextBtn.classList.remove('ready');
      if(progress) progress.style.display = '';
      showStep(1);
    });
  });
});
document.querySelectorAll('.leadForm').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    form.style.display='none';
    form.nextElementSibling.classList.add('show');
  });
});

(function(){
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine || reduce) return;

  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('cursor-ready');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
  const place = (el, x, y) => { el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; };
  place(dot, mx, my); place(ring, mx, my);

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    place(dot, mx, my);
  });

  function loop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    place(ring, rx, ry);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const hoverSelector = 'a, button, input, select, textarea, .geo-pin, .faq-q';
  document.addEventListener('mouseover', e => { if(e.target.closest(hoverSelector)) ring.classList.add('hover'); });
  document.addEventListener('mouseout', e => { if(e.target.closest(hoverSelector)) ring.classList.remove('hover'); });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup', () => ring.classList.remove('click'));
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });
})();
