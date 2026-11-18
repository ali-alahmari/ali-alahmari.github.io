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
var SESS={'5-1.ob1':1,'5-1.ob2':1,'5-1.ob3':1,'6-2.ob1':1,'6-3.ob1':1,'7-1.ob1':1,'7-1.ob2':1};
var STY=[['th','نظرية'],['pr','عملية']],STYL={th:'نظرية',pr:'عملية'};
var FLD=['t','r','n','tr','cr','ty','ns','at','by'],BVIEW='std';
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
  it.forEach(function(_,x){var i=x+1,any=false,n=nEnt(code,i);for(var j=1;j<=n;j++){var v=f[EK(code,i,j)+'.r'];if(o[v]!=null){o[v]++;any=true}}if(any)o.d++;if(n>1)o.e+=n});return o}
function sumHTML(code){var c=cnt(code);
  return '<span class="obx-t">المعاينة الميدانية</span><span class="obx-n">'+c.d+' من '+c.n+'</span>'+
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
function blockHTML(code){var it=OB[code],f=SF(),h='<details class="obx" data-obx="'+code+'"><summary data-obxs="'+code+'">'+sumHTML(code)+'</summary><div class="obx-p"><p class="obx-h">بنود لا يُتحقق منها إلا بالمشاهدة في الموقع أو بالعرض الحي. اكتب اسم القاعة أو الورشة أو الدرس، ثم النتيجة وما شاهدته. إذا عاينت البند في أكثر من مكان فاضغط «إضافة معاينة أخرى».</p><p class="obx-warn" data-obw="'+code+'"'+(warnTxt(code)?'':' hidden')+'>'+esc(warnTxt(code))+'</p>';
  it.forEach(function(x,n){h+=itemHTML(code,x,n+1,'in')});
  h+='<label class="obx-xl" for="f-'+code+'-ob-x">بنود أخرى عاينها الفريق في الموقع</label><textarea id="f-'+code+'-ob-x" data-f="'+code+'.ob.x" rows="2" placeholder="اكتب البند ونتيجته…">'+esc(f[code+'.ob.x']||'')+'</textarea></div></details>';
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

/* تصدير Word: نموذج المعاينة الميدانية معبّأً */
function stdOf(code){try{return D().SUB[code].std}catch(e){return +code.split('-')[0]}}
function buildDoc(){var X=window.docx;if(!X)throw new Error('docx');var f=SF(),S=D().S(),FONT={ascii:'Sakkal Majalla',hAnsi:'Sakkal Majalla',cs:'Sakkal Majalla',eastAsia:'Sakkal Majalla'},AL=X.AlignmentType,DX=X.WidthType.DXA;
  var LAB={};RES.forEach(function(r){LAB[r[0]]=r[1]});
  function run(t,o){o=o||{};return new X.TextRun({text:String(t),font:FONT,size:o.size||24,bold:!!o.bold,color:o.color,rightToLeft:true})}
  function P(t,o){o=o||{};return new X.Paragraph({bidirectional:true,alignment:o.al||AL.START,spacing:{before:o.sb||0,after:o.sa==null?60:o.sa},keepNext:!!o.keep,children:[run(t,o)]})}
  var bd={style:X.BorderStyle.SINGLE,size:4,color:'B9C7C5'},B={top:bd,bottom:bd,left:bd,right:bd};
  function C(t,w,o){o=o||{};var ps=String(t==null?'':t).split(/\r?\n/).map(function(x){return P(x||' ',{size:o.size||21,bold:o.bold,color:o.color,al:o.al,sa:0})});return new X.TableCell({children:ps,width:{size:w,type:DX},rowSpan:o.rs>1?o.rs:undefined,verticalAlign:o.rs>1?X.VerticalAlign.CENTER:undefined,shading:o.fill?{type:X.ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,borders:B,margins:{top:60,bottom:60,left:100,right:100}})}
  function T(cw,rows){return new X.Table({visuallyRightToLeft:true,width:{size:cw.reduce(function(a,b){return a+b},0),type:DX},columnWidths:cw,rows:rows.map(function(r,i){return new X.TableRow({children:r,cantSplit:true,tableHeader:i===0})})})}
  var W=[450,4500,1450,1000,2300,1250,3900],H=['م','ما يُعاين في الموقع','مكان المعاينة','المستوى','القاعة / الورشة / الدرس','النتيجة','ما شوهد'];
  var ch=[P('نموذج المعاينة الميدانية',{size:34,bold:true,color:'1F3A5F',al:AL.CENTER,sa:40}),
    P('المنشأة: '+(S.setup.facility||'—')+'    تاريخ الزيارة: '+(S.setup.date||'—'),{size:22,al:AL.CENTER,sa:160})];
  var bySt={};Object.keys(OB).forEach(function(c){(bySt[stdOf(c)]=bySt[stdOf(c)]||[]).push(c)});
  var W2=[4200,1000,1500,1100,1100,1300,1100,1200,1600],H2=['المعيار','البنود','المعاينات المسجلة','متحقق','جزئي','غير متحقق','لم يُتح','لا ينطبق','بنود لم تُعاين'];
  var sr=[H2.map(function(h,i){return C(h,W2[i],{bold:true,color:'FFFFFF',fill:'1F3A5F',al:AL.CENTER})})],TT={n:0,e:0,ok:0,pa:0,no:0,na:0,ni:0,left:0};
  D().STDS.forEach(function(st){var cs=bySt[st.n];if(!cs)return;var o={n:0,e:0,ok:0,pa:0,no:0,na:0,ni:0,left:0};
    cs.forEach(function(code){var c=cnt(code);o.n+=c.n;o.left+=c.n-c.d;['ok','pa','no','na','ni'].forEach(function(z){o[z]+=c[z];o.e+=c[z]})});
    Object.keys(TT).forEach(function(z){TT[z]+=o[z]});
    sr.push([C('المعيار '+st.ord+' ('+st.n+'): '+st.title,W2[0])].concat(['n','e','ok','pa','no','na','ni','left'].map(function(z,i){return C(o[z]||'0',W2[i+1],{al:AL.CENTER,color:z==='no'&&o[z]?'B42318':undefined,bold:z==='no'&&o[z]})})))});
  sr.push([C('المجموع',W2[0],{bold:true,fill:'EEF2F6'})].concat(['n','e','ok','pa','no','na','ni','left'].map(function(z,i){return C(TT[z]||'0',W2[i+1],{al:AL.CENTER,bold:true,fill:'EEF2F6'})})));
  ch.push(P('ملخص المعاينة',{size:28,bold:true,color:'B0702F',sa:80,keep:true}),T(W2,sr));
  var wl=Object.keys(OB).filter(function(c){return warnTxt(c)});if(wl.length)ch.push(P('تنبيهات: '+wl.map(function(c){return '('+c+') '+warnTxt(c).replace(/^تنبيه: في هذا المعيار الفرعي /,'')}).join(' — '),{size:21,color:'B42318',sb:80}));
  D().STDS.forEach(function(st){var cs=bySt[st.n];if(!cs)return;
    ch.push(P('المعيار '+st.ord+' ('+st.n+'): '+st.title,{size:28,bold:true,color:'B0702F',sb:200,sa:80,keep:true}));
    cs.forEach(function(code){var sb=D().SUB[code];ch.push(P('('+code+') '+(sb?sb.text:''),{size:23,bold:true,color:'1F3A5F',sb:100,sa:60,keep:true}));
      var rows=[H.map(function(h,i){return C(h,W[i],{bold:true,color:'FFFFFF',fill:'1F3A5F',al:AL.CENTER})})];
      OB[code].forEach(function(x,n){var i=n+1,ne=nEnt(code,i);
        for(var j=1;j<=ne;j++){var k=EK(code,i,j),cells=[];
          if(j===1)cells.push(C(i,W[0],{al:AL.CENTER,rs:ne}),C(x[0],W[1],{rs:ne}),C(x[1],W[2],{rs:ne}),C(x[2].split(' / ').map(function(l){return LVN[l]||l}).join('، '),W[3],{al:AL.CENTER,rs:ne}));
          var sx=sessTxt(f,k),sp=stamp(f,k);cells.push(C((ne>1?j+') ':'')+(f[k+'.t']||'')+(sx?'\n'+sx:''),W[4]),C(LAB[f[k+'.r']]||'—',W[5],{al:AL.CENTER,bold:true}),C((f[k+'.r']==='ni'?'السبب: ':'')+(f[k+'.n']||'')+(sp?'\n'+sp:''),W[6]));rows.push(cells)}});
      ch.push(T(W,rows));if((f[code+'.ob.x']||'').trim())ch.push(P('بنود أخرى: '+f[code+'.ob.x'],{size:21,sb:60}))})});
  ch.push(P('عضو الفريق: ............................    رئيس الفريق: ............................',{size:22,sb:300}));
  return new X.Document({sections:[{properties:{page:{size:{orientation:X.PageOrientation.LANDSCAPE,width:11906,height:16838},margin:{top:900,bottom:900,left:900,right:900}}},
    footers:{default:new X.Footer({children:[P('نموذج المعاينة الميدانية · إعداد المهندس/ علي الأحمري',{size:16,color:'777777',al:AL.CENTER})]})},children:ch}]})}
async function exportDoc(){try{var blob=await window.docx.Packer.toBlob(buildDoc());var fac=(D().S().setup.facility||'').replace(/[\\/:*?"<>|]/g,'').trim();var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='نموذج المعاينة الميدانية'+(fac?' - '+fac:'')+'.docx';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){alert('تعذّر إنشاء ملف Word: '+(e&&e.message||e))}}
function addBtn(){if(document.getElementById('btnObsW'))return;var ref=document.getElementById('btnWordF');if(!ref)return;var b=document.createElement('button');b.className='btn';b.id='btnObsW';b.type='button';b.textContent='نموذج المعاينة الميدانية (Word)';b.title='بنود المعاينة الميدانية ونتائجها وملاحظاتها لكل المعايير';ref.parentNode.insertBefore(b,ref.nextSibling);b.addEventListener('click',exportDoc)}

/* ---------- شريط مستقل «المعاينة الميدانية» يجمع البنود كلها (نسخة مرآة للخانات تحت كل معيار فرعي) ---------- */
var SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
function allCnt(){var o={d:0,n:0};Object.keys(OB).forEach(function(c){var x=cnt(c);o.n+=x.n;o.d+=x.d});return o}
var ZORD=['القاعات والورش والمعامل','جولة المرافق والممرات والمستودعات','عرض الأنظمة الإلكترونية','وحدة الاختبارات'];
function zone(pl){if(/عرض النظام|مكتب النظام/.test(pl))return ZORD[2];if(/وحدة الاختبارات/.test(pl))return ZORD[3];if(/القاعات|الورش|المعامل|المعارض|معامل/.test(pl))return ZORD[0];return ZORD[1]}
function nItems(n){return n===1?'بند واحد':n===2?'بندان':n<=10?n+' بنود':n+' بنداً'}
function placeRows(){var g={},ord=[],h='';Object.keys(OB).forEach(function(code){OB[code].forEach(function(x,n){var pl=zone(x[1]);if(!g[pl]){g[pl]=[];ord.push(pl)}g[pl].push([code,x,n+1])})});
  ord.sort(function(a,b){return ZORD.indexOf(a)-ZORD.indexOf(b)});
  ord.forEach(function(pl){h+='<section class="obx-st obx-pl"><h3>'+esc(pl)+' <small>'+nItems(g[pl].length)+'</small></h3><div class="obx">';
    g[pl].forEach(function(r){var code=r[0],sb=D().SUB[code];h+=itemHTML(code,r[1],r[2],'bar','<div class="obx-ref"><span class="obx-code">'+code+'</span><span class="obx-stx">'+esc(sb?sb.text:'')+'</span><button type="button" class="obx-go" data-obgo="'+code+'">فتح في النموذج</button></div>')});
    h+='</div></section>'});return h}
function barRows(){var f=SF(),h='<div class="obx-bar-in"><div class="obx-vw" role="group" aria-label="ترتيب البنود"><span>ترتيب البنود:</span><button type="button" data-obvw="std" aria-pressed="'+(BVIEW==='std')+'">حسب المعيار</button><button type="button" data-obvw="place" aria-pressed="'+(BVIEW==='place')+'">حسب مكان المعاينة (لجولة واحدة)</button></div><p class="obx-h">'+(BVIEW==='place'?'البنود مجمّعة حسب المكان، فيمر الفريق على كل مكان مرة واحدة ويسجل كل ما فيه.':'كل بنود المعاينة الميدانية في مكان واحد، مرتبة حسب المعايير.')+' ما تسجله هنا يظهر تحت المعيار الفرعي نفسه في النموذج، والعكس. إذا عاينت البند في أكثر من قاعة أو ورشة أو درس فاضغط «إضافة معاينة أخرى».</p>',bySt={};
  if(BVIEW==='place')return h+placeRows()+'</div>';
  Object.keys(OB).forEach(function(c){(bySt[stdOf(c)]=bySt[stdOf(c)]||[]).push(c)});
  D().STDS.forEach(function(st){var cs=bySt[st.n];if(!cs)return;h+='<section class="obx-st"><h3>المعيار '+esc(st.ord)+' ('+st.n+'): '+esc(st.title)+'</h3>';
    cs.forEach(function(code){var sb=D().SUB[code];h+='<div class="obx" data-obb="'+code+'"><div class="obx-sh"><span class="obx-code">'+code+'</span><span class="obx-stx">'+esc(sb?sb.text:'')+'</span><span class="obx-sum" data-obxs2="'+code+'">'+sumHTML(code)+'</span><button type="button" class="obx-go" data-obgo="'+code+'">فتح في النموذج</button></div><p class="obx-warn" data-obw2="'+code+'"'+(warnTxt(code)?'':' hidden')+'>'+esc(warnTxt(code))+'</p>';
      OB[code].forEach(function(x,n){h+=itemHTML(code,x,n+1,'bar')});
      h+='<textarea class="obx-x2" data-obn="'+code+'.ob.x" rows="1" aria-label="بنود أخرى للمعيار الفرعي '+code+'" placeholder="بنود أخرى عاينها الفريق في الموقع…">'+esc(f[code+'.ob.x']||'')+'</textarea></div>'});
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
function refreshBar(){var bd=document.getElementById('obxBd');if(bd){var a=allCnt(),t=a.d+' من '+a.n;if(bd.textContent!==t)bd.textContent=t}
  if(!BOPEN)return;var f=SF(),act=document.activeElement,body=document.getElementById('v5b-obs');if(!body)return;
  Object.keys(OB).forEach(function(code){var s=body.querySelector('[data-obxs2="'+code+'"]');if(s){var nh=sumHTML(code);if(s.innerHTML!==nh)s.innerHTML=nh}setWarn(body.querySelector('[data-obw2="'+code+'"]'),code);
    var dis=ro(code);
    (OB[code]||[]).forEach(function(_,n){var i=n+1;syncEntries(body.querySelector('[data-obes2="'+code+'.ob'+i+'"]'),code,i,'bar');var ad=body.querySelector('[data-obadd="'+code+'|'+i+'"]');if(ad&&ad.disabled!==dis)ad.disabled=dis});
    var x=body.querySelector('[data-obb="'+code+'"] textarea.obx-x2');if(x){x.disabled=dis;if(x!==act){var nv=f[code+'.ob.x']||'';if(x.value!==nv)x.value=nv}}})}
function prox(e){var t=e.target;if(!t||!t.getAttribute||!t.hasAttribute('data-obn'))return;setVal(t.getAttribute('data-obn'),t.value);setTimeout(refresh,50)}
document.addEventListener('input',prox);document.addEventListener('change',prox);
document.addEventListener('click',function(e){var h=e.target.closest&&e.target.closest('[data-v5bar]');if(h){var k=h.getAttribute('data-v5bar');if(k==='obs')setBar(!BOPEN);else if(BOPEN)setBar(false);return}
  var vw=e.target.closest&&e.target.closest('[data-obvw]');if(vw){var nv=vw.getAttribute('data-obvw');if(nv!==BVIEW){BVIEW=nv;try{localStorage.setItem('obx.view',nv)}catch(x){}var bd=document.getElementById('v5b-obs');if(bd){bd.innerHTML=barRows();refreshBar()}}return}
  var g=e.target.closest&&e.target.closest('[data-obgo]');if(g){var c=g.getAttribute('data-obgo');var fh=document.querySelector('[data-v5bar="form"]');if(fh&&fh.getAttribute('aria-expanded')!=='true')fh.click();setTimeout(function(){try{D().simGo(c)}catch(x){}var d=document.querySelector('[data-obx="'+c+'"]');if(d){d.open=true;setTimeout(function(){d.scrollIntoView({block:'center',behavior:'smooth'})},120)}},250)}});
function boot(){if(!D()){setTimeout(boot,300);return}try{var sv=localStorage.getItem('obx.view');if(sv==='place'||sv==='std')BVIEW=sv}catch(e){}inject();addBtn();addBar();refresh();setInterval(function(){inject();addBar();refresh()},1500)}
document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('.obx'))setTimeout(refresh,50)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.OBX={buildDoc:buildDoc,refresh:refresh,data:OB,addEntry:addEntry,delEntry:delEntry};
})();
