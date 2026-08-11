
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
document.querySelectorAll('.leadForm').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    form.style.display='none';
    form.nextElementSibling.classList.add('show');
  });
});
