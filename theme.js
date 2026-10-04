(function(){
  'use strict';
  const key='schoolstore-theme-v1';
  let theme='light';
  try { theme=localStorage.getItem(key)==='dark'?'dark':'light'; } catch (_) {}
  const buttons=document.querySelectorAll('.theme-toggle');
  function apply(next){
    theme=next;
    document.documentElement.dataset.theme=theme;
    buttons.forEach(function(button){
      const toLight=theme==='dark';
      button.setAttribute('aria-label',toLight?'Light-Modus aktivieren':'Dark-Modus aktivieren');
      button.title=toLight?'Zum hellen Modus wechseln':'Zum dunklen Modus wechseln';
      button.innerHTML=toLight
        ?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
        :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.6 8.6 0 1 0 20.5 15.5Z"/></svg>';
    });
  }
  apply(theme);
  buttons.forEach(function(button){button.addEventListener('click',function(){
    const next=theme==='dark'?'light':'dark';
    try { localStorage.setItem(key,next); } catch (_) {}
    apply(next);
  });});
})();
