/* ===== تحديث الواجهة (skin): أيقونات خطية موحدة. لا يغيّر أي وظيفة أو بيانات ===== */
(function(){
var P={
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
 fileText:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
 book:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
 flag:'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
 fileUp:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/>',
 plusSq:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
 eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
 trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
 chevUp:'<path d="M18 15l-6-6-6 6"/>',
 chevDown:'<path d="M6 9l6 6 6-6"/>',
 chevsDown:'<path d="M7 7l5 5 5-5M7 13l5 5 5-5"/>',
 chevsUp:'<path d="M17 11l-5-5-5 5M17 17l-5-5-5 5"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 checkCircle:'<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 badge:'<path d="M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1-2.8-1.6 1.2-3-1.2-3 2.8-1.6.9-3.1 3.2.3z"/><path d="M9 12l2 2 4-4"/>',
 clip:'<path d="M21.4 11l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
 clipboard:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/>',
 inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
 users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
 network:'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5L6.5 17M12 11.5l5.5 5.5"/>',
 layers:'<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
 chart:'<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-8"/>',
 arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',arrowL:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
 copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
 save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
 upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
 building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
 folderTree:'<path d="M3 3v12a2 2 0 0 0 2 2h4M3 8h6"/><rect x="11" y="5" width="10" height="6" rx="1.5"/><rect x="11" y="14" width="10" height="6" rx="1.5"/>',
 folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
 calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 check:'<path d="M20 6L9 17l-5-5"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 alert:'<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
 dot:'<circle cx="12" cy="12" r="4"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',
 logIn:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
 home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
 star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'
};
function svg(n,c){return '<svg class="sk-i'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+P[n]+'</svg>'}
function addIcon(el,n,end){if(!el||el.dataset.skI||!P[n])return;if(el.querySelector('svg')){el.dataset.skI='1';return}
  el.dataset.skI='1';
  /* أزل رموز الإيموجي أو علامة + القديمة في أول النص */
  var t=el.firstChild;if(t&&t.nodeType===3)t.nodeValue=t.nodeValue.replace(/^\s*(?:\+|📎|⭐|★|👁️?|✓|✔)\s*/,'');
  el.insertAdjacentHTML(end?'beforeend':'afterbegin',svg(n,end?'sk-chev':''))}
var BYID={btnShare:'share',btnWord:'fileText',btnWordI:'fileText',btnWordF:'fileText',btnData:'db',btnGuide:'book',btnChk:'shield',btnEnd:'flag',
 btnPlan:'fileUp',btnNew:'plusSq',addMember:'userPlus',addObs:'userPlus',addView:'eye',ptAuto:'link',ptShare:'share',expAll:'chevsDown',colAll:'chevsUp',
 btnSimple:'list',btnIni:'checkCircle',btnFreeze:'lock',simPrev:'arrowR',simNext:'arrowL',reqAdd:'plus',reqWord:'fileText',reqPub:'send',pubTeam:'users',
 pubLead:'calendar',pubCopy:'copy',pubSave:'save',pubForget:'trash',vnSend:'send',dCopy:'copy',dJson:'save',dCsv:'chart',dReset:'trash',shCopyCode:'copy',
 shTest:'link',shCopyLead:'copy',shCopyLink:'copy',shCopyTok:'copy',shJoin:'logIn',plGo:'checkCircle',nvGo:'plusSq',whoOk:'check',chkAgain:'shield',
 keyGo:'logIn',mvGo:'copy',taGo:'plus',syImp:'db'};
var BYTEXT=[[/^حذف/,'trash'],[/^\+?\s*إضافة بند/,'plus'],[/^اعتماد نهائي/,'badge'],[/^اعتماد الرفع/,'checkCircle'],[/^اختر ملفات/,'upload'],[/^لصق رابط/,'link'],
 [/^فتح المجلد/,'folder'],[/^قبول$/,'check'],[/^طلب استكمال/,'alert'],[/^منظور المنشأة/,'building'],[/^منظور الفريق/,'users'],[/^شجرة المجلدات/,'folderTree'],
 [/^صفحة الرئيس/,'home'],[/^زيارة جديدة/,'plusSq']];
var TABS=[[/^نموذج تقويم/,'clipboard'],[/^طلب الشواهد/,'inbox'],[/^توزيع المعايير/,'users'],[/^مجموعات المعايير/,'network'],[/^دليل المستويات/,'layers'],[/^ملخص الزيارة/,'chart']];
var FT={pdf:'pdf',doc:'doc',docx:'doc',xls:'xls',xlsx:'xls',csv:'xls',ppt:'ppt',pptx:'ppt',png:'img',jpg:'img',jpeg:'img',heic:'img',gif:'img',webp:'img'};
function txt(el){return (el.textContent||'').replace(/\s+/g,' ').trim()}
function run(){
  for(var id in BYID)addIcon(document.getElementById(id),BYID[id]);
  document.querySelectorAll('button.btn:not([data-sk-i]),button:not([class]):not([data-sk-i])').forEach(function(b){var s=txt(b);for(var i=0;i<BYTEXT.length;i++)if(BYTEXT[i][0].test(s)){addIcon(b,BYTEXT[i][1]);break}});
  document.querySelectorAll('button.btn.sm:not([data-sk-i])').forEach(function(b){if(/^\+/.test(txt(b)))addIcon(b,'plus')});
  /* التبويبات لها أيقوناتها في النموذج أصلًا */
  document.querySelectorAll('.rqi-btn:not([data-sk-i])').forEach(function(b){addIcon(b,'clip')});
  document.querySelectorAll('summary.btn:not([data-sk-i])').forEach(function(b){var c=b.querySelector('svg');if(c){b.dataset.skI='1';return}addIcon(b,'grid');b.insertAdjacentHTML('beforeend',svg('chevDown','sk-chev'))});
  document.querySelectorAll('.lvls .col-t:not([data-sk-i])').forEach(function(t){addIcon(t,/المراجع/.test(txt(t))?'clipboard':'building')});

  /* الدرجات بنقرة: أزرار فوق القائمة المنسدلة الأصلية (تبقى القائمة هي المصدر، ونرسل لها change) */
  document.querySelectorAll('.lvls .lv .fld select[data-f$=".org"],.lvls .lv .fld select[data-f$=".rev"]').forEach(function(sel){
    var opts=[].slice.call(sel.options).filter(function(o){return o.value!==''});
    var sig=opts.map(function(o){return o.value}).join(',')+'|'+sel.disabled;
    var box=sel.nextElementSibling&&sel.nextElementSibling.classList.contains('sk-seg')?sel.nextElementSibling:null;
    if(!box||box.dataset.sig!==sig){
      if(box)box.remove();
      box=document.createElement('div');box.className='sk-seg';box.dataset.sig=sig;box.setAttribute('role','group');
      var lb=sel.id&&document.querySelector('label[for="'+sel.id+'"]');box.setAttribute('aria-label',lb?txt(lb):'الدرجة');
      opts.forEach(function(o){var b=document.createElement('button');b.type='button';b.textContent=o.value==='NA'?'لا ينطبق':o.value;b.title=o.text;b.dataset.v=o.value;b.disabled=sel.disabled;box.appendChild(b)});
      var c=document.createElement('button');c.type='button';c.className='sk-clr';c.title='مسح الدرجة';c.innerHTML=svg('x');c.dataset.v='';c.disabled=sel.disabled;box.appendChild(c);
      box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var v=b.dataset.v;if(sel.value===v)return;sel.value=v;
        sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));syncSeg(sel,box)});
      sel.insertAdjacentElement('afterend',box);sel.classList.add('sk-hidden');sel.tabIndex=-1;
    }
    syncSeg(sel,box);
  });
  /* القوائم المنسدلة: إبراز الحقل الذي له قيمة */
  document.querySelectorAll('.fld select,.na-row select').forEach(function(s){s.classList.toggle('sk-has',!!s.value)});
  /* البوابة */
  document.querySelectorAll('.slot .path:not([data-sk-i])').forEach(function(p){p.dataset.skI='1';p.insertAdjacentHTML('afterbegin',svg('folder'))});
  document.querySelectorAll('.slot .st:not([data-sk-i])').forEach(function(s){var n=s.classList.contains('up')||/تم|مقبول/.test(txt(s))?'check':/استكمال|مرفوض/.test(txt(s))?'alert':/ينتظر|بانتظار/.test(txt(s))?'clock':'upload';
    var f=s.firstChild;if(f&&f.nodeType===3)f.nodeValue=f.nodeValue.replace(/[▸►•●]\s*/g,'');addIcon(s,n)});
  document.querySelectorAll('.slot .files li:not([data-sk-i])').forEach(function(li){li.dataset.skI='1';var m=/\.([a-z0-9]{2,5})\b/i.exec(txt(li));var e=m?m[1].toLowerCase():'';var k=FT[e]||(/https?:|رابط/.test(txt(li))?'lnk':'');
    li.insertAdjacentHTML('afterbegin','<span class="sk-ft '+k+'">'+(k==='lnk'?'رابط':(e||'ملف').toUpperCase())+'</span>')});
  document.querySelectorAll('.slot .drop:not([data-sk-i])').forEach(function(d){d.dataset.skI='1';d.insertAdjacentHTML('afterbegin',svg('upload','sk-up'))});
}
function syncSeg(sel,box){[].forEach.call(box.children,function(b){var on=b.dataset.v!==''&&b.dataset.v===sel.value;b.setAttribute('aria-pressed',on?'true':'false')});box.classList.toggle('sk-empty',!sel.value)}
setInterval(function(){document.querySelectorAll('select.sk-hidden').forEach(function(sel){var b=sel.nextElementSibling;if(b&&b.classList.contains('sk-seg'))syncSeg(sel,b)})},800);
var q=false;function sched(){if(q)return;q=true;requestAnimationFrame(function(){q=false;try{run()}catch(e){}})}
document.addEventListener('change',function(e){if(e.target&&e.target.tagName==='SELECT')e.target.classList.toggle('sk-has',!!e.target.value)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sched);else sched();
new MutationObserver(sched).observe(document.documentElement,{childList:true,subtree:true});
})();
