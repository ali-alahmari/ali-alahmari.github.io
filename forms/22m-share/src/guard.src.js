(function(){
  var K=__KEYS__;           // [hashA, hashB, count]
  var CR='إعداد المهندس/ علي الأحمري';
  var RT='جميع حقوق الملكية الفكرية محفوظة للمهندس/ علي الأحمري — لا يجوز التعديل أو إعادة النشر دون إذن كتابي';
  function h2(s){var a=0xdeadbeef,b=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}
    a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return[(a>>>0).toString(36),(b>>>0).toString(36)]}
  function chk(){
    var ps=document.querySelectorAll('script[data-p]'),t='';
    if(ps.length!==K[2])return false;
    for(var i=0;i<ps.length;i++)t+=ps[i].textContent.replace(/\r\n?/g,'\n')+'\u0001';
    var h=h2(t);
    if(h[0]!==K[0]||h[1]!==K[1])return false;
    var m=document.querySelector('meta[name="author"]');
    if(!m||m.getAttribute('content')!=='علي الأحمري')return false;
    return true}
  function lock(){
    try{window.__cr=0}catch(e){}
    var d=document.documentElement;
    d.innerHTML='<head><meta charset="utf-8"><title>نسخة غير أصلية</title></head><body style="margin:0;font-family:Tahoma,Arial,sans-serif;background:#f6f4ee;color:#222;display:grid;place-items:center;min-height:100vh;text-align:center" dir="rtl"><div style="max-width:560px;padding:32px"><h1 style="font-size:1.5rem;margin:0 0 12px">هذه النسخة معدَّلة ولا يمكن تشغيلها</h1><p style="line-height:1.9;margin:0 0 8px">يعمل هذا النموذج بالنسخة الأصلية فقط، مع بقاء اسم المُعِدّ وحقوق الملكية ظاهرين في أعلى الصفحة.</p><p style="line-height:1.9;margin:0;color:#555">'+RT+'</p></div></body>';
    try{window.stop()}catch(e){}
  }
  var host=null,sh=null,bad=0;
  var CSS='display:block!important;position:relative!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important;margin:0!important;padding:0!important;transform:none!important;z-index:2147483000!important;clip-path:none!important;filter:none!important';
  function mount(){
    if(host&&host.isConnected&&document.body.firstChild===host){if(host.getAttribute('style')!==CSS||host.hasAttribute('hidden')||host.className){host.removeAttribute('hidden');host.removeAttribute('class');host.setAttribute('style',CSS)}return}
    if(host&&host.isConnected)host.remove();
    host=document.createElement('div');host.setAttribute('data-cr','1');
    host.setAttribute('style',CSS);
    sh=host.attachShadow({mode:'closed'});
    var st=document.createElement('style');
    st.textContent='.b{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:center;justify-content:center;background:#0d3b36;color:#fff;font:600 14px/1.6 Tahoma,Arial,sans-serif;padding:8px 14px;text-align:center;border-bottom:3px solid #c9a24a;direction:rtl}.b b{color:#f2d88a;font-weight:700}.b span{color:#e6efec;font-weight:400;font-size:12.5px}';
    var b=document.createElement('div');b.className='b';b.setAttribute('role','note');
    var a=document.createElement('b');a.textContent=CR;
    var c=document.createElement('span');c.textContent='© '+RT;
    b.appendChild(a);b.appendChild(c);sh.appendChild(st);sh.appendChild(b);
    document.body.insertBefore(host,document.body.firstChild);
    host.__b=b;
  }
  function visible(){
    if(!host||!host.isConnected)return false;
    var r=host.getBoundingClientRect(),cs=getComputedStyle(host);
    if(r.height<20||r.width<120)return false;
    if(cs.display==='none'||cs.visibility!=='visible'||parseFloat(cs.opacity)<0.95)return false;
    var b=host.__b;if(!b||b.textContent.indexOf(CR)<0||b.textContent.indexOf('حقوق الملكية')<0)return false;
    var bg=getComputedStyle(b);if(bg.display==='none'||parseFloat(bg.opacity)<0.95)return false;
    return true}
  function tick(){
    if(!chk()){lock();return}
    mount();
    if(!visible()){bad++;mount();if(bad>=3){lock();return}}else bad=0;
    window.__cr=1}
  function start(){
    if(!chk()){lock();return}
    mount();
    try{new MutationObserver(function(){mount()}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','hidden']})}catch(e){}
    setInterval(tick,1500);
    window.__cr=1;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
