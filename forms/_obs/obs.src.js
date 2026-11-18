(function(){
/* المعاينة الميدانية: بنود لا يُتحقق منها إلا بالمشاهدة في الموقع، لكل معيار فرعي.
   كل بند يقبل أكثر من معاينة (قاعة أو ورشة أو درس). المعاينة الأولى: <code>.ob<i>.t/.r/.n
   والمعاينات التالية: <code>.ob<i>e<j>.t/.r/.n ، والبنود الإضافية: <code>.ob.x
   (t = اسم القاعة أو الورشة أو الدرس، r = النتيجة، n = ما شوهد) */
var OB=__OBDATA__;
var RES=[['ok','متحقق'],['pa','جزئي'],['no','غير متحقق'],['na','لم يُتح'],['ni','لا ينطبق']];
var PH='ما شاهدته، ورقم الصورة إن وُجدت',PHNI='سبب عدم الانطباق (مطلوب)';
var LVN={'و':'الوجود','م':'الممارسة','ف':'الفاعلية'};
var MAXE=12,LOCAL={};
/* بنود حضور الجلسات: لها بطاقة جلسة (المدرب، المقرر، نوع الجلسة، عدد المتدربين) */
var SESS={};/* بطاقة الجلسة صارت في «بطاقات المعاينة» */
var STY=[['th','نظرية'],['pr','عملية']],STYL={th:'نظرية',pr:'عملية'};
var FLD=['t','r','n','tr','cr','ty','ns','at','by'],BVIEW='cards';
function isS(code,i){return !!SESS[code+'.ob'+i]}
function me(){try{var n=D().myScope().name;return n&&n!=='لم تختر اسمك بعد'?n:''}catch(e){return ''}}
function stamp(f,k){var at=f[k+'.at'],by=f[k+'.by'];if(!at&&!by)return '';var t='';if(at){var d=new Date(at);if(!isNaN(d))t=d.toLocaleString('ar-SA-u-ca-gregory-nu-latn',{day:'numeric',month:'long',hour:'numeric',minute:'2-digit'})}return 'سجّلها'+(by?' '+by:'')+(t?' · '+t:'')}
function sessTxt(f,k){var a=[];if((f[k+'.tr']||'').trim())a.push('المدرب: '+f[k+'.tr'].trim());if((f[k+'.cr']||'').trim())a.push('المقرر: '+f[k+'.cr'].trim());if(f[k+'.ty'])a.push('جلسة '+(STYL[f[k+'.ty']]||f[k+'.ty']));if(f[k+'.ns'])a.push('عدد المتدربين: '+f[k+'.ns']);return a.join('، ')}
function warnTxt(code){var c=cnt(code);if(!c.no)return '';var a=null;try{a=D().subStats(D().SUB[code]).avg}catch(e){}if(a==null||a<3)return '';var st='';try{st=D().status(a)[0]}catch(e){}
  return 'تنبيه: في هذا المعيار الفرعي '+c.no+' معاينة «غير متحقق»، بينما درجته الحالية '+(Math.round(a*100)/100)+(st?' ('+st+')':'')+'. راجع الدرجة أو وضّح سببها في ملاحظات المعيار الفرعي.'}
function D(){return window.V5D}
function SF(){try{return D().S().f}catch(e){return {}}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lvOf(i,j){return 'ob'+i+(j>1?'e'+j:'')}
function EK(code,i,j){return code+'.'+lvOf(i,j)}
function hasE(f,code,i,j){var k=EK(code,i,j);return ['t','r','n','tr','cr','ty','ns'].some(function(p){return !!String(f[k+'.'+p]||'').trim()})}
function nEnt(code,i){var f=SF(),n=1;for(var j=2;j<=MAXE;j++)if(hasE(f,code,i,j))n=j;return Math.max(n,LOCAL[code+'.'+i]||1)}
function cnt(code){var f=SF(),it=OB[code]||[],o={ok:0,pa:0,no:0,na:0,ni:0,n:it.length,d:0,e:0};
  it.forEach(function(_,x){var i=x+1,any=false,n=nEnt(code,i);for(var j=1;j<=n;j++){var v=f[EK(code,i,j)+'.r'];if(o[v]!=null){o[v]++;any=true}}if(any)o.d++;if(n>1)o.e+=n});
  var rl=rollOf(code);o.cr=rl.length;rl.forEach(function(x){if(o[x.r]!=null)o[x.r]++});return o}
function sumHTML(code){var c=cnt(code);
  return '<span class="obx-t">المعاينة الميدانية</span><span class="obx-n">'+((c.ok+c.pa+c.no+c.na+c.ni)?(c.ok+c.pa+c.no+c.na+c.ni)+' نتيجة':'لا نتائج بعد')+'</span>'+
    (c.ok?'<span class="obx-b obx-ok">متحقق '+c.ok+'</span>':'')+(c.pa?'<span class="obx-b obx-pa">جزئي '+c.pa+'</span>':'')+(c.no?'<span class="obx-b obx-no">غير متحقق '+c.no+'</span>':'')+(c.na?'<span class="obx-b obx-na">لم يُتح '+c.na+'</span>':'')+(c.ni?'<span class="obx-b obx-ni">لا ينطبق '+c.ni+'</span>':'')+(warnTxt(code)?'<span class="obx-b obx-w">تنبيه</span>':'')}
function ro(code){var ref=document.getElementById('f-'+code+'-e-rev');return !!(ref&&ref.disabled)}

/* معاينة واحدة داخل البند. mode 'in' = الخانات الأصلية تحت المعيار الفرعي، 'bar' = نسخة مرآة في الشريط المستقل */
function entryHTML(code,i,j,n,mode){var f=SF(),k=EK(code,i,j),v=f[k+'.r']||'',id='f-'+code+'-'+lvOf(i,j)+'-',dis=ro(code)?' disabled':'',inn=mode==='in';
  var lab='اسم القاعة أو الورشة أو الدرس للمعاينة '+j+'، البند '+i+'، المعيار الفرعي '+code;
  function A(p){return inn?'id="'+id+p+'" data-f="'+k+'.'+p+'"':'data-obn="'+k+'.'+p+'"'}
  var ss=isS(code,i)?'<div class="obx-ss"><label>المدرب<input type="text" '+A('tr')+' value="'+esc(f[k+'.tr']||'')+'"'+dis+'></label><label>المقرر<input type="text" '+A('cr')+' value="'+esc(f[k+'.cr']||'')+'"'+dis+'></label>'+
    '<label>نوع الجلسة<select '+A('ty')+dis+'><option value=""></option>'+STY.map(function(o){return '<option value="'+o[0]+'"'+(f[k+'.ty']===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label>'+
    '<label>عدد المتدربين<input type="number" min="0" inputmode="numeric" '+A('ns')+' value="'+esc(f[k+'.ns']||'')+'"'+dis+'></label></div>':'';
  var stp='<small class="obx-stp" data-obst="'+k+'">'+esc(stamp(f,k))+'</small>'+(inn?'<input type="hidden" '+A('at')+' value="'+esc(f[k+'.at']||'')+'"><input type="hidden" '+A('by')+' value="'+esc(f[k+'.by']||'')+'">':'');
  var h='<div class="obx-e'+(v==='ni'&&!(f[k+'.n']||'').trim()?' obx-miss':'')+'" '+(inn?'data-obe':'data-obe2')+'="'+k+'" data-v="'+esc(v)+'"><div class="obx-eh"><span class="obx-en">معاينة '+j+'</span>'+
    '<input type="text" '+(inn?'id="'+id+'t" data-f="'+k+'.t"':'data-obn="'+k+'.t"')+' value="'+esc(f[k+'.t']||'')+'" aria-label="'+lab+'" placeholder="'+(isS(code,i)?'القاعة أو الورشة (مثال: ورشة المحركات)':'القاعة أو الورشة أو الدرس (مثال: ورشة المحركات، مقرر كهرباء السيارات)')+'"'+dis+'>'+
    (n>1?'<button type="button" class="obx-del" data-obdel="'+code+'|'+i+'|'+j+'" aria-label="حذف المعاينة '+j+' من البند '+i+'" title="حذف هذه المعاينة"'+dis+'>حذف</button>':'')+'</div>'+ss+
    '<div class="obx-ch" role="group" aria-label="نتيجة المعاينة '+j+' للبند '+i+' للمعيار الفرعي '+code+'">'+RES.map(function(r){return '<button type="button" class="obx-chip" data-obc="'+k+'" data-v="'+r[0]+'" aria-pressed="'+(v===r[0])+'"'+dis+'>'+r[1]+'</button>'}).join('')+'</div>'+
    (inn?'<select id="'+id+'r" data-f="'+k+'.r" hidden aria-hidden="true" tabindex="-1"'+dis+'><option value=""></option>'+RES.map(function(r){return '<option value="'+r[0]+'"'+(v===r[0]?' selected':'')+'>'+r[1]+'</option>'}).join('')+'</select>':'')+
    '<textarea '+(inn?'id="'+id+'n" data-f="'+k+'.n"':'data-obn="'+k+'.n"')+' rows="1" aria-label="ما شوهد في المعاينة '+j+' للبند '+i+'" placeholder="'+(v==='ni'?PHNI:PH)+'"'+dis+'>'+esc(f[k+'.n']||'')+'</textarea>'+stp+'</div>';
  return h}
function entriesHTML(code,i,mode){var n=nEnt(code,i),h='';for(var j=1;j<=n;j++)h+=entryHTML(code,i,j,n,mode);return h}
function itemHTML(code,x,i,mode,pre){var k=code+'.ob'+i;
  return '<div class="obx-i" '+(mode==='in'?'data-obi':'data-obi2')+'="'+k+'"><span class="obx-no">'+i+'</span><div class="obx-c">'+(pre||'')+'<p class="obx-tx">'+esc(x[0])+'</p><div class="obx-m"><span class="obx-tag">'+esc(x[1])+'</span>'+x[2].split(' / ').map(function(l){return '<span class="obx-tag obx-lv">'+(LVN[l]||esc(l))+'</span>'}).join('')+'</div>'+
    '<div class="obx-es" '+(mode==='in'?'data-obes':'data-obes2')+'="'+k+'">'+entriesHTML(code,i,mode)+'</div>'+
    '<button type="button" class="obx-add" data-obadd="'+code+'|'+i+'"'+(ro(code)?' disabled':'')+'>+ إضافة معاينة أخرى (قاعة أو ورشة أو درس آخر)</button></div></div>'}
function blockHTML(code){var it=OB[code],f=SF(),h='<details class="obx" data-obx="'+code+'"><summary data-obxs="'+code+'">'+sumHTML(code)+'</summary><div class="obx-p"><p class="obx-h">نتائج هذا المعيار الفرعي من بطاقات المعاينة (الجلسات والجولات). تُضاف البطاقات من شريط «المعاينة الميدانية».</p><p class="obx-warn" data-obw="'+code+'"'+(warnTxt(code)?'':' hidden')+'>'+esc(warnTxt(code))+'</p><div class="obx-rollw" data-obroll="'+code+'">'+rollHTML(code)+'</div><details class="obx-old"><summary>بنود منفردة بدون بطاقة</summary>';
  it.forEach(function(x,n){h+=itemHTML(code,x,n+1,'in')});
  h+='<label class="obx-xl" for="f-'+code+'-ob-x">بنود أخرى عاينها الفريق في الموقع</label><textarea id="f-'+code+'-ob-x" data-f="'+code+'.ob.x" rows="2" placeholder="اكتب البند ونتيجته…">'+esc(f[code+'.ob.x']||'')+'</textarea></details></div></details>';
  return h}
function inject(){var n=0;Object.keys(OB).forEach(function(code){var a=document.getElementById('sub-'+code);if(!a||a.querySelector('[data-obx]'))return;var lv=a.querySelector('.lvls');var w=document.createElement('div');w.innerHTML=blockHTML(code);var el=w.firstChild;if(lv&&lv.nextSibling)a.insertBefore(el,lv.nextSibling);else a.appendChild(el);n++});
  if(n)try{D().S()&&window.dispatchEvent(new Event('obs:ready'))}catch(e){}return n}

/* مزامنة العرض مع البيانات (بعد أي تغيير محلي أو قادم من المزامنة) */
function syncEntries(box,code,i,mode){if(!box)return;var n=nEnt(code,i),act=document.activeElement;
  if(box.children.length!==n&&!(act&&box.contains(act)&&act.tagName!=='BUTTON')){box.innerHTML=entriesHTML(code,i,mode);return}
  var f=SF(),dis=ro(code);
  for(var j=1;j<=box.children.length;j++){var row=box.children[j-1],k=EK(code,i,j),v=f[k+'.r']||'';row.setAttribute('data-v',v);row.classList.toggle('obx-miss',v==='ni'&&!(f[k+'.n']||'').trim());var ta=row.querySelector('textarea');if(ta){var ph=v==='ni'?PHNI:PH;if(ta.placeholder!==ph)ta.placeholder=ph}
    var sel=row.querySelector('select[data-f$=".r"]');if(sel&&sel.value!==v&&act!==sel)sel.value=v;var sp=row.querySelector('[data-obst]');if(sp){var st=stamp(f,k);if(sp.textContent!==st)sp.textContent=st}
    var bs=row.querySelectorAll('button');for(var q=0;q<bs.length;q++){if(bs[q].classList.contains('obx-chip'))bs[q].setAttribute('aria-pressed',String(bs[q].getAttribute('data-v')===v));if(bs[q].disabled!==dis)bs[q].disabled=dis}
    var ts=row.querySelectorAll('input,textarea,select');for(var t=0;t<ts.length;t++){var e=ts[t];if(e.disabled!==dis)e.disabled=dis;var key=e.getAttribute('data-f')||e.getAttribute('data-obn');if(key&&e!==act&&!/\.r$/.test(key)){var nv=f[key]||'';if(e.value!==String(nv))e.value=nv}}}}
function refresh(){Object.keys(OB).forEach(function(code){var el=document.querySelector('[data-obx="'+code+'"]');if(!el)return;var dis=ro(code);
  var s=el.querySelector('[data-obxs]');if(s){var nh=sumHTML(code);if(s.innerHTML!==nh)s.innerHTML=nh}
  setWarn(el.querySelector('[data-obw]'),code);
  var rlw=el.querySelector('[data-obroll]');if(rlw&&!rlw.contains(document.activeElement)){var rh=rollHTML(code);if(rlw.innerHTML!==rh)rlw.innerHTML=rh}
  var x=document.getElementById('f-'+code+'-ob-x');if(x&&x.disabled!==dis)x.disabled=dis;
  (OB[code]||[]).forEach(function(_,n){var i=n+1;syncEntries(el.querySelector('[data-obes="'+code+'.ob'+i+'"]'),code,i,'in');var ad=el.querySelector('[data-obadd="'+code+'|'+i+'"]');if(ad&&ad.disabled!==dis)ad.disabled=dis})});
  try{refreshBar()}catch(e){}}

function setWarn(w,code){if(!w)return;var t=warnTxt(code);if(w.textContent!==t)w.textContent=t;w.hidden=!t}
/* الكتابة في الخانة الأصلية (data-f) حتى تمر عبر الحفظ والمزامنة المعتادة في النموذج */
function setVal(key,val){var src=document.querySelector('[data-f="'+key+'"]');if(!src){return false}if(src.disabled)return false;if((src.value||'')===(val||''))return true;src.value=val||'';src.dispatchEvent(new Event('input',{bubbles:true}));src.dispatchEvent(new Event('change',{bubbles:true}));return true}
function addEntry(code,i){if(ro(code))return;var n=nEnt(code,i);if(n>=MAXE){alert('الحد الأعلى '+MAXE+' معاينة للبند الواحد');return}LOCAL[code+'.'+i]=n+1;refresh();
  setTimeout(function(){var sel='[data-obe="'+EK(code,i,n+1)+'"] input,[data-obe2="'+EK(code,i,n+1)+'"] input';var inBar=BOPEN&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#v5b-obs');
    var ins=document.querySelectorAll(sel),t=null;for(var q=0;q<ins.length;q++){var isBar=!!ins[q].closest('#v5b-obs');if(isBar===!!inBar){t=ins[q];break}}if(!t)t=ins[0];if(t)t.focus()},60)}
function delEntry(code,i,j){if(ro(code))return;var n=nEnt(code,i),f=SF(),k=EK(code,i,j);
  if(hasE(f,code,i,j)&&!confirm('حذف المعاينة '+j+' من البند '+i+' ('+code+')؟'))return;
  for(var q=j;q<n;q++){var a=EK(code,i,q),b=EK(code,i,q+1);FLD.forEach(function(p){setVal(a+'.'+p,SF()[b+'.'+p]||'')})}
  var last=EK(code,i,n);FLD.forEach(function(p){setVal(last+'.'+p,'')});
  LOCAL[code+'.'+i]=Math.max(1,n-1);refresh()}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
  var b=t.closest('.obx-chip');if(b){if(b.disabled)return;var k=b.getAttribute('data-obc'),sel=document.querySelector('select[data-f="'+k+'.r"]');if(!sel||sel.disabled)return;var v=b.getAttribute('data-v'),nv=sel.value===v?'':v;setVal(k+'.r',nv);setVal(k+'.at',nv?new Date().toISOString():'');setVal(k+'.by',nv?me():'');refresh();return}
  var ad=t.closest('[data-obadd]');if(ad){if(ad.disabled)return;var p=ad.getAttribute('data-obadd').split('|');addEntry(p[0],+p[1]);return}
  var dl=t.closest('[data-obdel]');if(dl){if(dl.disabled)return;var r=dl.getAttribute('data-obdel').split('|');delEntry(r[0],+r[1],+r[2]);return}});

/* ---------- بطاقات المعاينة: كل بطاقة جلسة حضرها الفريق أو مكان زاره، تجمع بنود كل المعايير التي تُقيَّم فيه ----------
   رأس البطاقة: <home>.cv<id>.<ty|tl|rm|kd|tr|ns|dt|tf|tt|es|x>   (home = 5-1 للجلسات، 2-6 للجولات)
   نتيجة كل بند: <sub>.c<id>x<item>.<r|n|at|by>   (sub = المعيار الفرعي الذي يتبعه البند) */
var CAT={
 ses:{home:'5-1',name:'حضور جلسة',ph:'القاعة أو الورشة',items:[
  ['s1','5-1','الاستراتيجيات المستخدمة فعلاً في الجلسة (شرح، تطبيق عملي، تعلم تعاوني، حل مشكلات، محاكاة).','م'],
  ['s2','5-1','مطابقة ما يُنفذ في الجلسة مع خطة التدريب وتوصيف المقرر لنفس الأسبوع.','م'],
  ['s3','5-1','مراعاة الفروق الفردية: دعم المتعثرين، ومهام إثرائية للمتميزين.','م'],
  ['s4','5-1','تهيئة القاعة والمواد لذوي الإعاقة.','م'],
  ['s5','4-3','توفر الموارد المساعدة في القاعة: الحقائب التدريبية، المراجع، النماذج والمجسمات، الملصقات الفنية.','م'],
  ['s6','5-3','توظيف التقنية في الجلسة: أجهزة عرض تعمل، برمجيات تخصصية، محاكيات.','م'],
  ['s7','6-2','مطابقة الحضور الفعلي مع المسجل في نظام الحضور.','م'],
  ['s8','6-3','سلوك المتدربين: الانضباط، الالتزام بالزي، العمل الجماعي، احترام الوقت وأخلاقيات العمل.','م'],
  ['s9','7-1','مطابقة المدرب الذي يدرّس فعلاً مع المسجل في الجدول.','م'],
  ['s10','7-1','تمكن المدرب: إتقان المحتوى أو الجانب العملي، إدارة الجلسة، الإجابة عن أسئلة المتدربين.','م'],
  ['s11','2-6','حالة القاعة أو الورشة: النظافة، الإضاءة، التهوية، التكييف، الأثاث.','م'],
  ['p1','5-4','كفاية المعدات لعدد المتدربين (نسبة المتدرب إلى الجهاز أو محطة العمل).','م',1],
  ['p2','5-4','صلاحية المعدات وتشغيلها، ووجود بطاقة تشغيل وسجل صيانة على الأجهزة الرئيسة.','م',1],
  ['p3','5-4','ملاءمة المعدات لنواتج التعلم وحداثتها مقارنة بما يستخدمه سوق العمل.','ف',1],
  ['p4','5-4','توفر المواد الاستهلاكية اللازمة للتدريب العملي.','م',1],
  ['p5','5-4','مطابقة جدول إشغال الورشة مع الاستخدام الفعلي.','م',1],
  ['p6','2-7','التزام المتدربين والمدرب بأدوات الوقاية الشخصية، ووجود اللوحات الإرشادية على الأجهزة.','م',1],
  ['p7','2-7','حقيبة الإسعافات الأولية في الورشة وصلاحية محتواها.','م',1],
  ['p8','2-7','طفاية الحريق ومخرج الطوارئ في الورشة: الوجود، سهولة الوصول، تاريخ الفحص.','م',1],
  ['p9','4-4','إن تزامن تقييم عملي: ارتباط المهمة بنواتج التعلم، وتطبيق بطاقة الملاحظة.','م',1],
  ['p10','6-1','أعمال المتدربين ومنتجاتهم في الورشة ومستوى المهارة الظاهر.','ف',1]]},
 fc:{home:'2-6',name:'المرافق العامة والممرات',ph:'مثال: المبنى الرئيس، الدور الأول',items:[
  ['f1','2-6','المرافق العامة: دورات المياه، المصلى، أماكن الاستراحة، المواقف، وحالتها.','م'],
  ['f2','2-6','تهيئة المرافق لذوي الإعاقة: المداخل والمنحدرات، المصاعد، دورات المياه المهيأة، المواقف المخصصة.','م'],
  ['f3','2-6','آثار الصيانة الظاهرة: أعطال قائمة، تسربات، أجهزة معطلة متروكة.','ف'],
  ['f4','2-7','مخارج الطوارئ: وضوح اللوحات، الإضاءة، خلو الممرات والأبواب من العوائق.','م'],
  ['f5','2-7','طفايات الحريق وأنظمة الإنذار: وجودها، سهولة الوصول إليها، تاريخ الفحص على البطاقة.','م'],
  ['f6','2-7','مخططات الإخلاء ونقاط التجمع معلّقة وواضحة.','و'],
  ['f7','2-4','لوحات وشاشات التواصل في أماكن مرئية وحداثة محتواها.','م'],
  ['f8','2-4','صناديق أو رموز للشكاوى والمقترحات في متناول المتدربين.','و']]},
 hs:{home:'2-6',name:'سكن المتدربين',ph:'مثال: سكن المتدربين، المبنى 2',items:[
  ['h1','3-3','توفر السكن وتجهيزه: الغرف، الأسرّة، الخزائن، الإنترنت، أماكن المذاكرة.','و / م'],
  ['h2','2-6','النظافة والصيانة والتكييف ودورات المياه في السكن.','م'],
  ['h3','2-7','وسائل السلامة في السكن: طفايات، إنذار حريق، مخارج طوارئ، مخطط إخلاء.','م'],
  ['h4','3-3','الإشراف والمتابعة: مشرف متواجد، ولوائح السكن معلنة.','م'],
  ['h5','3-3','رضا المتدربين الساكنين وملاحظاتهم (حديث عابر أثناء الجولة).','ف']]},
 cf:{home:'2-6',name:'الكافتيريا أو المطعم',ph:'مثال: الكافتيريا الرئيسة',items:[
  ['c1','3-3','توفر الخدمة ومواعيدها وتنوع الوجبات.','م'],
  ['c2','2-6','النظافة العامة وأماكن الجلوس والتهوية.','م'],
  ['c3','2-7','الشهادات الصحية للعاملين، والتزامهم بالزي والقفازات وغطاء الرأس.','م'],
  ['c4','2-7','تخزين الأغذية وحفظها وتواريخ الصلاحية.','م'],
  ['c5','3-3','إعلان الأسعار ومناسبتها للمتدربين.','ف']]},
 cl:{home:'2-6',name:'العيادة أو غرفة الإسعاف',ph:'مثال: العيادة',items:[
  ['k1','3-3','وجود العيادة أو غرفة الإسعاف وتجهيزها وتوفر مختص وقت الدوام.','و / م'],
  ['k2','2-7','الإسعافات الأولية وصلاحية الأدوية، وسجل الحالات.','م']]},
 lb:{home:'2-6',name:'المكتبة ومصادر التعلم',ph:'مثال: المكتبة المركزية',items:[
  ['l1','3-3','المكتبة مفعّلة ومفتوحة وقت الجولة.','م'],
  ['l2','4-3','مراجع وكتب حديثة مرتبطة بالتخصصات، وأجهزة للبحث.','م'],
  ['l3','3-3','إقبال المتدربين الفعلي على المكتبة.','ف']]},
 ac:{home:'2-6',name:'الأنشطة والأندية والملاعب',ph:'مثال: الصالة الرياضية',items:[
  ['a1','3-3','أماكن الأنشطة والملاعب قائمة ومجهزة.','م'],
  ['a2','5-2','لوحات الإنجاز والأندية والمسابقات وحداثة تواريخها.','م'],
  ['a3','5-2','نماذج حية من مشاريع المتدربين أو منتجاتهم (معرض، نادٍ) وارتباطها بنواتج التعلم.','م'],
  ['a4','3-3','إقبال المتدربين الفعلي على الأنشطة.','ف']]},
 sv:{home:'2-6',name:'الإرشاد وخدمات المتدربين',ph:'مثال: مكتب الإرشاد',items:[
  ['v1','3-3','مكتب الإرشاد قائم ومرشد متواجد وقت الجولة.','م'],
  ['v2','2-4','صناديق الشكاوى والمقترحات ولوحات الإعلانات.','م']]},
 it:{home:'2-6',name:'معامل الحاسب والبنية التقنية',ph:'مثال: معمل الحاسب 2',items:[
  ['t1','5-3','جاهزية الشبكة ومعامل الحاسب وأجهزة المتدربين.','و / م'],
  ['t2','2-6','حالة المعمل: النظافة، التكييف، الأثاث، الأجهزة المعطلة.','م']]},
 sy:{home:'2-6',name:'عرض الأنظمة الإلكترونية',ph:'مثال: مكتب الشؤون الأكاديمية',items:[
  ['y1','2-5','عرض حي لنظام إدارة المعلومات واستخراج تقرير مباشر، ومطابقة أرقامه مع الدراسة الذاتية.','م'],
  ['y2','5-3','عرض حي لنظام إدارة التعلم: مقررات مفعّلة، محتوى، واجبات وتقييمات، تفاعل المتدربين (مقرران عشوائياً).','م'],
  ['y3','6-2','عرض حي لنظام الحضور والغياب والإنذارات.','م']]},
 ex:{home:'2-6',name:'وحدة الاختبارات',ph:'مثال: وحدة الاختبارات',items:[
  ['e1','4-5','مكان حفظ الاختبارات وأوراق الإجابة: خزائن مغلقة، صلاحيات الوصول، سرية الحفظ.','م']]},
 st:{home:'2-6',name:'المستودعات',ph:'مثال: مستودع الورش',items:[
  ['w1','2-7','تخزين المواد الخطرة أو القابلة للاشتعال بطريقة آمنة ومعزولة.','م'],
  ['w2','5-4','توفر المواد الاستهلاكية والمخزون اللازم للتدريب.','م']]},
 pt:{home:'2-6',name:'معامل وورش الشراكة',ph:'مثال: معمل مقدم من جهة عمل',items:[
  ['r1','1-1','معدات أو أجهزة أو معامل مقدمة من جهات العمل، ومدى استخدامها فعلاً في التدريب.','ف']]},
 ot:{home:'2-6',name:'مكان آخر',ph:'اسم المكان',items:[
  ['o1','2-6','حالة المكان: النظافة، الصيانة، التهيئة.','م'],
  ['o2','2-7','وسائل السلامة في المكان.','م']]}
};
var TOURS=['fc','hs','cf','cl','lb','ac','sv','it','sy','ex','st','pt','ot'];
var KD=[['th','نظرية'],['pr','عملية']],KDL={th:'نظرية',pr:'عملية'};
var HF={ses:[['tl','عنوان الجلسة أو المقرر','text'],['rm','القاعة أو الورشة','text'],['kd','نوع الجلسة','kd'],['tr','المدرب','text'],['ns','عدد المتدربين','number'],['dt','التاريخ','date'],['tf','من الساعة','time'],['tt','إلى الساعة','time'],['es','المرافق من المنشأة','text']],
  tour:[['rm','اسم المكان','text'],['es','المرافق من المنشأة','text'],['dt','التاريخ','date'],['tf','من الساعة','time'],['tt','إلى الساعة','time']]};
var CFLD=['tl','rm','kd','tr','ns','dt','tf','tt','es','x'],NEWC={};
function hf(ty){return ty==='ses'?HF.ses:HF.tour}
function ck(c,p){return c.home+'.cv'+c.id+'.'+p}
function ik(c,it){return it[1]+'.c'+c.id+'x'+it[0]}
function cards(){var f=SF(),o=[],seen={};Object.keys(f).forEach(function(k){var m=/^(\d+-\d+)\.cv([a-z0-9]+)\.ty$/.exec(k);if(m&&CAT[f[k]]&&!seen[m[2]]){seen[m[2]]=1;o.push({id:m[2],home:m[1],ty:f[k]})}});
  Object.keys(NEWC).forEach(function(id){if(!seen[id])o.push(NEWC[id])});o.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0});return o}
function cItems(c){var f=SF(),kd=f[ck(c,'kd')]||'';return CAT[c.ty].items.filter(function(it){return !(it[4]&&kd==='th')})}
function cTitle(c){var f=SF(),g=function(p){return (f[ck(c,p)]||'').trim()};
  if(c.ty==='ses'){var kd=KDL[g('kd')];return 'جلسة'+(kd?' '+kd:'')+': '+(g('tl')||'بدون عنوان')+(g('rm')?' · '+g('rm'):'')+(g('tf')?' · '+g('tf'):'')}
  return CAT[c.ty].name+(g('rm')?': '+g('rm'):'')+(g('tf')?' · '+g('tf'):'')}
function canEdit(){return !!document.querySelector('[id$="-e-rev"]:not([disabled])')}
function cCnt(c){var f=SF(),o={t:0,no:0,n:0};cItems(c).forEach(function(it){o.n++;var v=f[ik(c,it)+'.r'];if(v){o.t++;if(v==='no')o.no++}});return o}
function cSum(c){var o=cCnt(c);return o.t+' من '+o.n+(o.no?' · غير متحقق '+o.no:'')}
function rowHTML(c,it,dis){var f=SF(),k=ik(c,it),v=f[k+'.r']||'',lv=it[1].replace('-','_');var id='f-'+it[1]+'-c'+c.id+'x'+it[0]+'-';
  return '<div class="obx-e obc-i'+(v==='ni'&&!(f[k+'.n']||'').trim()?' obx-miss':'')+'" data-obci="'+k+'" data-v="'+esc(v)+'"'+(it[4]?' data-prac="1"':'')+'><div class="obc-it"><span class="obx-code">'+it[1]+'</span><span class="obc-tx">'+esc(it[2])+'</span>'+it[3].split(' / ').map(function(l){return '<span class="obx-tag obx-lv">'+(LVN[l]||esc(l))+'</span>'}).join('')+(it[4]?'<span class="obx-tag">عملي</span>':'')+'</div>'+
    '<div class="obx-ch" role="group" aria-label="النتيجة: '+esc(it[2])+'">'+RES.map(function(r){return '<button type="button" class="obx-chip" data-obc="'+k+'" data-v="'+r[0]+'" aria-pressed="'+(v===r[0])+'"'+dis+'>'+r[1]+'</button>'}).join('')+'</div>'+
    '<select id="'+id+'r" data-f="'+k+'.r" hidden aria-hidden="true" tabindex="-1"'+dis+'><option value=""></option>'+RES.map(function(r){return '<option value="'+r[0]+'"'+(v===r[0]?' selected':'')+'>'+r[1]+'</option>'}).join('')+'</select>'+
    '<textarea id="'+id+'n" data-f="'+k+'.n" rows="1" aria-label="ما شوهد: '+esc(it[2])+'" placeholder="'+(v==='ni'?PHNI:PH)+'"'+dis+'>'+esc(f[k+'.n']||'')+'</textarea>'+
    '<small class="obx-stp" data-obst="'+k+'">'+esc(stamp(f,k))+'</small><input type="hidden" id="'+id+'at" data-f="'+k+'.at" value="'+esc(f[k+'.at']||'')+'"><input type="hidden" id="'+id+'by" data-f="'+k+'.by" value="'+esc(f[k+'.by']||'')+'"></div>'}
function cardHTML(c,open){var f=SF(),dis=canEdit()?'':' disabled',cat=CAT[c.ty],fid=function(p){return 'f-'+c.home+'-cv'+c.id+'-'+p};
  var h='<details class="obc" data-obcard="'+c.id+'" data-ty="'+c.ty+'" data-kd="'+esc(f[ck(c,'kd')]||'')+'"'+(open?' open':'')+'><summary><span class="obc-k">'+(c.ty==='ses'?'جلسة':'جولة')+'</span><b class="obc-t" data-obct="'+c.id+'">'+esc(cTitle(c))+'</b><span class="obc-s" data-obcs="'+c.id+'">'+esc(cSum(c))+'</span></summary><div class="obx obc-w">'+
    '<input type="hidden" id="'+fid('ty')+'" data-f="'+ck(c,'ty')+'" value="'+esc(f[ck(c,'ty')]||'')+'"><div class="obc-h">';
  hf(c.ty).forEach(function(x){var k=ck(c,x[0]),v=f[k]||'';
    if(x[2]==='kd')h+='<label>'+x[1]+'<select id="'+fid(x[0])+'" data-f="'+k+'"'+dis+'><option value=""></option>'+KD.map(function(o){return '<option value="'+o[0]+'"'+(v===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label>';
    else h+='<label>'+x[1]+'<input type="'+x[2]+'"'+(x[2]==='number'?' min="0" inputmode="numeric"':'')+' id="'+fid(x[0])+'" data-f="'+k+'" value="'+esc(v)+'"'+(x[0]==='rm'?' placeholder="'+esc(cat.ph)+'"':'')+dis+'></label>'});
  h+='</div><p class="obx-h">'+(c.ty==='ses'?'سجّل ما شاهدته في هذه الجلسة. بنود الجلسة العملية (المعدات والسلامة والتقييم العملي) تختفي إذا اخترت «نظرية».':'سجّل ما شاهدته في هذا المكان.')+' كل نتيجة تُحسب تلقائياً للمعيار الفرعي المكتوب بجانب البند.</p><div class="obc-items">';
  CAT[c.ty].items.forEach(function(it){h+=rowHTML(c,it,dis)});
  h+='</div><label class="obx-xl" for="'+fid('x')+'">ملاحظات أخرى في هذه '+(c.ty==='ses'?'الجلسة':'الجولة')+'</label><textarea id="'+fid('x')+'" data-f="'+ck(c,'x')+'" rows="2"'+dis+'>'+esc(f[ck(c,'x')]||'')+'</textarea>'+
    '<div class="obc-ft"><button type="button" class="obx-del" data-obcdel="'+c.id+'"'+dis+'>حذف البطاقة</button></div></div></details>';
  return h}
function newCard(ty){if(!canEdit()||!CAT[ty])return;var id=Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);var c={id:id,home:CAT[ty].home,ty:ty};NEWC[id]=c;
  var list=document.getElementById('obcList');if(!list)return;var w=document.createElement('div');w.innerHTML=cardHTML(c,true);var el=w.firstChild;list.appendChild(el);
  var e=document.getElementById('obcEmpty');if(e)e.hidden=true;setVal(ck(c,'ty'),ty);delete NEWC[id];
  setTimeout(function(){el.scrollIntoView({block:'start',behavior:'smooth'});var i=el.querySelector('.obc-h input,.obc-h select');if(i)i.focus({preventScroll:true})},60)}
function delCard(id){var c=cards().filter(function(x){return x.id===id})[0];if(!c||!canEdit())return;if(!confirm('حذف بطاقة «'+cTitle(c)+'» وكل ما سُجل فيها؟'))return;
  CFLD.forEach(function(p){setVal(ck(c,p),'')});CAT[c.ty].items.forEach(function(it){['r','n','at','by'].forEach(function(p){setVal(ik(c,it)+'.'+p,'')})});setVal(ck(c,'ty'),'');
  var el=document.querySelector('[data-obcard="'+id+'"]');if(el)el.remove();refresh()}
function syncCards(){var list=document.getElementById('obcList');if(!list)return;var cs=cards(),ids={},act=document.activeElement,f=SF(),dis=!canEdit();
  cs.forEach(function(c){ids[c.id]=1;if(!list.querySelector('[data-obcard="'+c.id+'"]')){var w=document.createElement('div');w.innerHTML=cardHTML(c,false);list.appendChild(w.firstChild)}});
  Array.prototype.slice.call(list.querySelectorAll('[data-obcard]')).forEach(function(el){if(!ids[el.getAttribute('data-obcard')]&&!(act&&el.contains(act)))el.remove()});
  var e=document.getElementById('obcEmpty');if(e)e.hidden=!!cs.length;
  cs.forEach(function(c){var el=list.querySelector('[data-obcard="'+c.id+'"]');if(!el)return;var kd=f[ck(c,'kd')]||'';if(el.getAttribute('data-kd')!==kd)el.setAttribute('data-kd',kd);
    var t=el.querySelector('[data-obct]'),tt=cTitle(c);if(t&&t.textContent!==tt)t.textContent=tt;var s=el.querySelector('[data-obcs]'),ss=cSum(c);if(s&&s.textContent!==ss)s.textContent=ss;
    var fs=el.querySelectorAll('[data-f]');for(var q=0;q<fs.length;q++){var x=fs[q],key=x.getAttribute('data-f');if(x.disabled!==dis&&x.type!=='hidden')x.disabled=dis;if(x!==act){var nv=f[key]||'';if(x.value!==String(nv))x.value=nv}}
    var bs=el.querySelectorAll('button');for(var b=0;b<bs.length;b++)if(bs[b].disabled!==dis)bs[b].disabled=dis;
    var rows=el.querySelectorAll('[data-obci]');for(var r=0;r<rows.length;r++){var row=rows[r],k=row.getAttribute('data-obci'),v=f[k+'.r']||'';row.setAttribute('data-v',v);row.classList.toggle('obx-miss',v==='ni'&&!(f[k+'.n']||'').trim());
      var ta=row.querySelector('textarea'),ph=v==='ni'?PHNI:PH;if(ta&&ta.placeholder!==ph)ta.placeholder=ph;var sp=row.querySelector('[data-obst]'),st=stamp(f,k);if(sp&&sp.textContent!==st)sp.textContent=st;
      var ch=row.querySelectorAll('.obx-chip');for(var z=0;z<ch.length;z++)ch[z].setAttribute('aria-pressed',String(ch[z].getAttribute('data-v')===v))}})}
/* نتائج البطاقات لكل معيار فرعي */
function rollOf(code){var f=SF(),o=[];cards().forEach(function(c){cItems(c).forEach(function(it){if(it[1]!==code)return;var k=ik(c,it),r=f[k+'.r']||'',n=(f[k+'.n']||'').trim();if(r||n)o.push({c:c,it:it,r:r,n:n,k:k})})});return o}
function rollHTML(code){var rs=rollOf(code),L={};RES.forEach(function(r){L[r[0]]=r[1]});
  if(!rs.length)return '<p class="obx-roll0">لا نتائج من بطاقات المعاينة لهذا المعيار الفرعي بعد. أضف بطاقة جلسة أو جولة من شريط «المعاينة الميدانية».</p>';
  return '<ul class="obx-roll">'+rs.map(function(x){return '<li data-v="'+x.r+'"><span class="obx-b obx-'+x.r+'">'+(L[x.r]||'بلا نتيجة')+'</span><span><b>'+esc(cTitle(x.c))+'</b> · '+esc(x.it[2])+(x.n?'<em> — '+esc(x.n)+'</em>':'')+'</span><button type="button" class="obx-go" data-obopen="'+x.c.id+'">فتح البطاقة</button></li>'}).join('')+'</ul>'}
function openCard(id){BVIEW='cards';if(!BOPEN)setBar(true);else{var bd=document.getElementById('v5b-obs');if(bd&&!document.getElementById('obcList')){bd.innerHTML=barRows();refreshBar()}}
  setTimeout(function(){var el=document.querySelector('[data-obcard="'+id+'"]');if(el){el.open=true;el.scrollIntoView({block:'start',behavior:'smooth'})}},120)}

/* تصدير Word: نموذج المعاينة الميدانية معبّأً */
function stdOf(code){try{return D().SUB[code].std}catch(e){return +code.split('-')[0]}}
function buildDoc(){var X=window.docx;if(!X)throw new Error('docx');var f=SF(),S=D().S(),FONT={ascii:'Sakkal Majalla',hAnsi:'Sakkal Majalla',cs:'Sakkal Majalla',eastAsia:'Sakkal Majalla'},AL=X.AlignmentType,DX=X.WidthType.DXA;
  var LAB={};RES.forEach(function(r){LAB[r[0]]=r[1]});
  function run(t,o){o=o||{};return new X.TextRun({text:String(t),font:FONT,size:o.size||24,bold:!!o.bold,color:o.color,rightToLeft:true})}
  function P(t,o){o=o||{};return new X.Paragraph({bidirectional:true,alignment:o.al||AL.START,spacing:{before:o.sb||0,after:o.sa==null?60:o.sa},keepNext:!!o.keep,pageBreakBefore:!!o.pb,children:[run(t,o)]})}
  var bd={style:X.BorderStyle.SINGLE,size:4,color:'B9C7C5'},B={top:bd,bottom:bd,left:bd,right:bd};
  function C(t,w,o){o=o||{};var ps=String(t==null?'':t).split(/\r?\n/).map(function(x){return P(x||' ',{size:o.size||21,bold:o.bold,color:o.color,al:o.al,sa:0})});return new X.TableCell({children:ps,width:{size:w,type:DX},rowSpan:o.rs>1?o.rs:undefined,verticalAlign:o.rs>1?X.VerticalAlign.CENTER:undefined,shading:o.fill?{type:X.ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,borders:B,margins:{top:60,bottom:60,left:100,right:100}})}
  function T(cw,rows,hd){return new X.Table({visuallyRightToLeft:true,width:{size:cw.reduce(function(a,b){return a+b},0),type:DX},columnWidths:cw,rows:rows.map(function(r,i){return new X.TableRow({children:r,cantSplit:true,tableHeader:hd!==false&&i===0})})})}
  function HD(hs,ws){return hs.map(function(h,i){return C(h,ws[i],{bold:true,color:'FFFFFF',fill:'1F3A5F',al:AL.CENTER})})}
  function lvs(x){return x.split(' / ').map(function(l){return LVN[l]||l}).join('، ')}
  var cs=cards(),ch=[P('نموذج المعاينة الميدانية',{size:34,bold:true,color:'1F3A5F',al:AL.CENTER,sa:40}),
    P('المنشأة: '+(S.setup.facility||'—')+'    تاريخ الزيارة: '+(S.setup.date||'—')+'    عدد بطاقات المعاينة: '+cs.length,{size:22,al:AL.CENTER,sa:160})];
  /* 1) الملخص حسب المعايير */
  var bySt={};Object.keys(OB).forEach(function(c){(bySt[stdOf(c)]=bySt[stdOf(c)]||[]).push(c)});
  var W2=[5600,1500,1250,1250,1400,1250,1400],H2=['المعيار','النتائج المسجلة','متحقق','جزئي','غير متحقق','لم يُتح','لا ينطبق'],Z=['t','ok','pa','no','na','ni'];
  var sr=[HD(H2,W2)],TT={t:0,ok:0,pa:0,no:0,na:0,ni:0};
  D().STDS.forEach(function(st){var cc=bySt[st.n];if(!cc)return;var o={t:0,ok:0,pa:0,no:0,na:0,ni:0};
    cc.forEach(function(code){var c=cnt(code);['ok','pa','no','na','ni'].forEach(function(z){o[z]+=c[z];o.t+=c[z]})});Z.forEach(function(z){TT[z]+=o[z]});
    sr.push([C('المعيار '+st.ord+' ('+st.n+'): '+st.title,W2[0])].concat(Z.map(function(z,i){return C(o[z]||'0',W2[i+1],{al:AL.CENTER,color:z==='no'&&o[z]?'B42318':undefined,bold:z==='no'&&o[z]})})))});
  sr.push([C('المجموع',W2[0],{bold:true,fill:'EEF2F6'})].concat(Z.map(function(z,i){return C(TT[z]||'0',W2[i+1],{al:AL.CENTER,bold:true,fill:'EEF2F6'})})));
  ch.push(P('ملخص المعاينة حسب المعايير',{size:28,bold:true,color:'B0702F',sa:80,keep:true}),T(W2,sr));
  var wl=Object.keys(OB).filter(function(c){return warnTxt(c)});if(wl.length)ch.push(P('تنبيهات: '+wl.map(function(c){return '('+c+') '+warnTxt(c).replace(/^تنبيه: في هذا المعيار الفرعي /,'')}).join(' — '),{size:21,color:'B42318',sb:80}));
  if(cs.length){var W3=[2000,5500,2000,5500];ch.push(P('قائمة بطاقات المعاينة',{size:26,bold:true,color:'1F3A5F',sb:200,sa:60,keep:true}));
    var lr=[HD(['م','البطاقة','النتائج','المرافق من المنشأة'],W3)];cs.forEach(function(c,i){lr.push([C(i+1,W3[0],{al:AL.CENTER}),C(cTitle(c),W3[1]),C(cSum(c),W3[2],{al:AL.CENTER}),C(f[ck(c,'es')]||'',W3[3])])});ch.push(T(W3,lr))}
  /* 2) صفحة لكل بطاقة */
  var WI=[450,900,6400,1150,1400,4700],HI=['م','المعيار الفرعي','ما يُعاين','المستوى','النتيجة','ما شوهد'],WH=[2300,5200,2300,5200];
  cs.forEach(function(c,ci){var g=function(p){return f[ck(c,p)]||''};
    ch.push(P('بطاقة معاينة '+(ci+1)+': '+cTitle(c),{size:28,bold:true,color:'B0702F',sa:80,keep:true,pb:true}));
    var hfs=hf(c.ty).map(function(x){var v=g(x[0]);if(x[0]==='kd')v=KDL[v]||'';return [x[1],v||'—']});if(c.ty!=='ses')hfs.unshift(['نوع المكان',CAT[c.ty].name]);
    var hr=[];for(var q=0;q<hfs.length;q+=2){var a=hfs[q],b=hfs[q+1]||['',''];hr.push([C(a[0],WH[0],{bold:true,fill:'EEF2F6'}),C(a[1],WH[1]),C(b[0],WH[2],{bold:true,fill:b[0]?'EEF2F6':undefined}),C(b[1],WH[3])])}
    ch.push(T(WH,hr,false),P(' ',{sa:60}));
    var rows=[HD(HI,WI)];cItems(c).forEach(function(it,n){var k=ik(c,it),sp=stamp(f,k);rows.push([C(n+1,WI[0],{al:AL.CENTER}),C(it[1],WI[1],{al:AL.CENTER}),C(it[2],WI[2]),C(lvs(it[3]),WI[3],{al:AL.CENTER}),C(LAB[f[k+'.r']]||'—',WI[4],{al:AL.CENTER,bold:true}),C((f[k+'.r']==='ni'?'السبب: ':'')+(f[k+'.n']||'')+(sp?'\n'+sp:''),WI[5])])});
    ch.push(T(WI,rows));if(g('x').trim())ch.push(P('ملاحظات أخرى: '+g('x'),{size:21,sb:60}));
    ch.push(P('عضو الفريق: ............................    المرافق من المنشأة: '+(g('es')||'............................')+'    التوقيع: ................',{size:22,sb:240}))});
  /* 3) النتائج حسب المعايير الفرعية (البطاقات والبنود المنفردة) */
  var WR=[4300,5300,1400,4000],HR=['المصدر','ما يُعاين','النتيجة','ما شوهد'],first=true;
  D().STDS.forEach(function(st){var cc=bySt[st.n];if(!cc)return;var stPushed=false;
    cc.forEach(function(code){var rows=[];
      rollOf(code).forEach(function(x){var sp=stamp(f,x.k);rows.push([C(cTitle(x.c),WR[0]),C(x.it[2],WR[1]),C(LAB[x.r]||'—',WR[2],{al:AL.CENTER,bold:true}),C((x.r==='ni'?'السبب: ':'')+x.n+(sp?'\n'+sp:''),WR[3])])});
      OB[code].forEach(function(x,n){var i=n+1,ne=nEnt(code,i);for(var j=1;j<=ne;j++){var k=EK(code,i,j);if(!hasE(f,code,i,j))continue;var sp=stamp(f,k);
        rows.push([C('بند منفرد'+((f[k+'.t']||'').trim()?': '+f[k+'.t']:''),WR[0]),C(x[0],WR[1]),C(LAB[f[k+'.r']]||'—',WR[2],{al:AL.CENTER,bold:true}),C((f[k+'.r']==='ni'?'السبب: ':'')+(f[k+'.n']||'')+(sp?'\n'+sp:''),WR[3])])}});
      var xx=(f[code+'.ob.x']||'').trim();if(!rows.length&&!xx)return;
      if(first){ch.push(P('النتائج حسب المعايير الفرعية',{size:30,bold:true,color:'1F3A5F',pb:!!cs.length,sb:cs.length?0:240,sa:80,keep:true}));first=false}
      if(!stPushed){ch.push(P('المعيار '+st.ord+' ('+st.n+'): '+st.title,{size:28,bold:true,color:'B0702F',sb:160,sa:60,keep:true}));stPushed=true}
      var sb=D().SUB[code];ch.push(P('('+code+') '+(sb?sb.text:''),{size:23,bold:true,color:'1F3A5F',sb:80,sa:60,keep:true}));if(warnTxt(code))ch.push(P(warnTxt(code),{size:20,color:'B42318',keep:true}));
      if(rows.length)ch.push(T(WR,[HD(HR,WR)].concat(rows)));if(xx)ch.push(P('بنود أخرى: '+xx,{size:21,sb:60}))})});
  if(first)ch.push(P('لا توجد نتائج معاينة مسجلة بعد.',{size:22,sb:200}));
  ch.push(P('عضو الفريق: ............................    رئيس الفريق: ............................',{size:22,sb:300}));
  return new X.Document({sections:[{properties:{page:{size:{orientation:X.PageOrientation.LANDSCAPE,width:11906,height:16838},margin:{top:900,bottom:900,left:900,right:900}}},
    footers:{default:new X.Footer({children:[P('نموذج المعاينة الميدانية · إعداد المهندس/ علي الأحمري',{size:16,color:'777777',al:AL.CENTER})]})},children:ch}]})}
async function exportDoc(){try{var blob=await window.docx.Packer.toBlob(buildDoc());var fac=(D().S().setup.facility||'').replace(/[\\/:*?"<>|]/g,'').trim();var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='نموذج المعاينة الميدانية'+(fac?' - '+fac:'')+'.docx';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){alert('تعذّر إنشاء ملف Word: '+(e&&e.message||e))}}
function addBtn(){if(document.getElementById('btnObsW'))return;var ref=document.getElementById('btnWordF');if(!ref)return;var b=document.createElement('button');b.className='btn';b.id='btnObsW';b.type='button';b.textContent='نموذج المعاينة الميدانية (Word)';b.title='بنود المعاينة الميدانية ونتائجها وملاحظاتها لكل المعايير';ref.parentNode.insertBefore(b,ref.nextSibling);b.addEventListener('click',exportDoc)}

/* ---------- شريط مستقل «المعاينة الميدانية» يجمع البنود كلها (نسخة مرآة للخانات تحت كل معيار فرعي) ---------- */
var SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
function allCnt(){var o={d:0,n:0};Object.keys(OB).forEach(function(c){var x=cnt(c);o.n+=x.n;o.d+=x.d});return o}
function barRows(){var f=SF(),bySt={},h='<div class="obx-bar-in"><div class="obx-vw" role="group" aria-label="طريقة العرض"><span>العرض:</span><button type="button" data-obvw="cards" aria-pressed="'+(BVIEW==='cards')+'">بطاقات المعاينة</button><button type="button" data-obvw="std" aria-pressed="'+(BVIEW==='std')+'">النتائج حسب المعيار</button></div>';
  if(BVIEW==='cards'){var dis=canEdit()?'':' disabled',cs=cards();
    h+='<p class="obx-h">أنشئ بطاقة لكل جلسة تحضرها أو مكان تزوره. البطاقة تجمع بنود كل المعايير التي تُقيَّم فيه، وكل نتيجة تُحسب تلقائياً للمعيار الفرعي الذي يتبعه البند.</p>'+
      '<div class="obc-add"><button type="button" class="obc-nb obc-pri" data-obnew="ses"'+dis+'>+ بطاقة حضور جلسة (نظرية أو عملية)</button><div class="obc-tours"><span>+ بطاقة جولة في:</span>'+TOURS.map(function(t){return '<button type="button" class="obc-nb" data-obnew="'+t+'"'+dis+'>'+CAT[t].name+'</button>'}).join('')+'</div></div>'+
      '<p id="obcEmpty" class="obx-roll0"'+(cs.length?' hidden':'')+'>لا توجد بطاقات بعد. ابدأ بإضافة بطاقة جلسة أو جولة.</p><div id="obcList">'+cs.map(function(c){return cardHTML(c,false)}).join('')+'</div></div>';
    return h}
  h+='<p class="obx-h">نتائج بطاقات المعاينة مجمّعة تحت كل معيار فرعي، ومعها البنود المنفردة المسجلة بدون بطاقة.</p>';
  Object.keys(OB).forEach(function(c){(bySt[stdOf(c)]=bySt[stdOf(c)]||[]).push(c)});
  D().STDS.forEach(function(st){var cs=bySt[st.n];if(!cs)return;h+='<section class="obx-st"><h3>المعيار '+esc(st.ord)+' ('+st.n+'): '+esc(st.title)+'</h3>';
    cs.forEach(function(code){var sb=D().SUB[code];h+='<div class="obx" data-obb="'+code+'"><div class="obx-sh"><span class="obx-code">'+code+'</span><span class="obx-stx">'+esc(sb?sb.text:'')+'</span><span class="obx-sum" data-obxs2="'+code+'">'+sumHTML(code)+'</span><button type="button" class="obx-go" data-obgo="'+code+'">فتح في النموذج</button></div><p class="obx-warn" data-obw2="'+code+'"'+(warnTxt(code)?'':' hidden')+'>'+esc(warnTxt(code))+'</p>'+
      '<div class="obx-rollw" data-obroll2="'+code+'">'+rollHTML(code)+'</div><details class="obx-old"><summary>بنود منفردة بدون بطاقة</summary>';
      OB[code].forEach(function(x,n){h+=itemHTML(code,x,n+1,'bar')});
      h+='<textarea class="obx-x2" data-obn="'+code+'.ob.x" rows="1" aria-label="بنود أخرى للمعيار الفرعي '+code+'" placeholder="بنود أخرى عاينها الفريق في الموقع…">'+esc(f[code+'.ob.x']||'')+'</textarea></details></div>'});
    h+='</section>'});
  return h+'</div>'}
var BOPEN=false;
function addBar(){if(document.getElementById('v5-obs'))return true;var form=document.getElementById('v5-form');if(!form||!D())return false;
  var sec=document.createElement('section');sec.className='v5-bar';sec.id='v5-obs';
  sec.innerHTML='<button type="button" class="v5-h" data-v5bar="obs" aria-expanded="false" aria-controls="v5b-obs"><span class="v5-ic">'+SVG+'</span><span class="v5-tx"><b>المعاينة الميدانية</b><small>ما لا يُتحقق منه إلا بالمشاهدة في الموقع، لكل المعايير</small></span><span class="v5-bd" id="obxBd"></span><span class="v5-ch">'+CHEV+'</span></button><div class="v5-body v5-c" id="v5b-obs"></div>';
  form.parentNode.insertBefore(sec,form.nextSibling);return true}
function setBar(on){var sec=document.getElementById('v5-obs');if(!sec)return;BOPEN=on;var body=sec.querySelector('.v5-body');
  if(on&&!body.firstChild)body.innerHTML=barRows();sec.classList.toggle('open',on);sec.querySelector('.v5-h').setAttribute('aria-expanded',on?'true':'false');body.classList.toggle('v5-c',!on);
  if(on){refreshBar();setTimeout(function(){sec.scrollIntoView({block:'start',behavior:'smooth'})},30)}}
function nCards(n){return !n?'لا بطاقات بعد':n===1?'بطاقة واحدة':n===2?'بطاقتان':n<=10?n+' بطاقات':n+' بطاقة'}
function refreshBar(){var bd=document.getElementById('obxBd');if(bd){var t=nCards(cards().length);if(bd.textContent!==t)bd.textContent=t}
  if(!BOPEN)return;var f=SF(),act=document.activeElement,body=document.getElementById('v5b-obs');if(!body)return;syncCards();
  Object.keys(OB).forEach(function(code){var s=body.querySelector('[data-obxs2="'+code+'"]');if(s){var nh=sumHTML(code);if(s.innerHTML!==nh)s.innerHTML=nh}setWarn(body.querySelector('[data-obw2="'+code+'"]'),code);var r2=body.querySelector('[data-obroll2="'+code+'"]');if(r2&&!r2.contains(act)){var rh=rollHTML(code);if(r2.innerHTML!==rh)r2.innerHTML=rh}
    var dis=ro(code);
    (OB[code]||[]).forEach(function(_,n){var i=n+1;syncEntries(body.querySelector('[data-obes2="'+code+'.ob'+i+'"]'),code,i,'bar');var ad=body.querySelector('[data-obadd="'+code+'|'+i+'"]');if(ad&&ad.disabled!==dis)ad.disabled=dis});
    var x=body.querySelector('[data-obb="'+code+'"] textarea.obx-x2');if(x){x.disabled=dis;if(x!==act){var nv=f[code+'.ob.x']||'';if(x.value!==nv)x.value=nv}}})}
function prox(e){var t=e.target;if(!t||!t.getAttribute||!t.hasAttribute('data-obn'))return;setVal(t.getAttribute('data-obn'),t.value);setTimeout(refresh,50)}
document.addEventListener('input',prox);document.addEventListener('change',prox);
document.addEventListener('click',function(e){var h=e.target.closest&&e.target.closest('[data-v5bar]');if(h){var k=h.getAttribute('data-v5bar');if(k==='obs')setBar(!BOPEN);else if(BOPEN)setBar(false);return}
  var nb=e.target.closest&&e.target.closest('[data-obnew]');if(nb){if(!nb.disabled)newCard(nb.getAttribute('data-obnew'));return}
  var cd=e.target.closest&&e.target.closest('[data-obcdel]');if(cd){if(!cd.disabled)delCard(cd.getAttribute('data-obcdel'));return}
  var oc=e.target.closest&&e.target.closest('[data-obopen]');if(oc){openCard(oc.getAttribute('data-obopen'));return}
  var vw=e.target.closest&&e.target.closest('[data-obvw]');if(vw){var nv=vw.getAttribute('data-obvw');if(nv!==BVIEW){BVIEW=nv;try{localStorage.setItem('obx.view2',nv)}catch(x){}var bd=document.getElementById('v5b-obs');if(bd){bd.innerHTML=barRows();refreshBar()}}return}
  var g=e.target.closest&&e.target.closest('[data-obgo]');if(g){var c=g.getAttribute('data-obgo');var fh=document.querySelector('[data-v5bar="form"]');if(fh&&fh.getAttribute('aria-expanded')!=='true')fh.click();setTimeout(function(){try{D().simGo(c)}catch(x){}var d=document.querySelector('[data-obx="'+c+'"]');if(d){d.open=true;setTimeout(function(){d.scrollIntoView({block:'center',behavior:'smooth'})},120)}},250)}});
function boot(){if(!D()){setTimeout(boot,300);return}try{var sv=localStorage.getItem('obx.view2');if(sv==='cards'||sv==='std')BVIEW=sv}catch(e){}inject();addBtn();addBar();refresh();setInterval(function(){inject();addBar();refresh()},1500)}
document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('.obx'))setTimeout(refresh,50)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.OBX={buildDoc:buildDoc,refresh:refresh,data:OB,addEntry:addEntry,delEntry:delEntry,newCard:newCard,delCard:delCard,cards:cards,CAT:CAT};
})();
