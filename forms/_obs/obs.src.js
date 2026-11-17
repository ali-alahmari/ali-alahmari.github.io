(function(){
/* المعاينة الميدانية: بنود لا يُتحقق منها إلا بالمشاهدة في الموقع، لكل معيار فرعي. المفاتيح: <code>.ob<i>.r (النتيجة) و<code>.ob<i>.n (الملاحظة) و<code>.ob.x (بنود إضافية) */
var OB=__OBDATA__;
var RES=[['ok','متحقق'],['pa','جزئي'],['no','غير متحقق'],['na','لم يُتح']];
var LVN={'و':'الوجود','م':'الممارسة','ف':'الفاعلية'};
function D(){return window.V5D}
function SF(){try{return D().S().f}catch(e){return {}}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cnt(code){var f=SF(),it=OB[code]||[],o={ok:0,pa:0,no:0,na:0,n:it.length};it.forEach(function(_,i){var v=f[code+'.ob'+(i+1)+'.r'];if(o[v]!=null)o[v]++});return o}
function sumHTML(code){var c=cnt(code),d=c.ok+c.pa+c.no+c.na;
  return '<span class="obx-t">المعاينة الميدانية</span><span class="obx-n">'+d+' من '+c.n+'</span>'+
    (c.ok?'<span class="obx-b obx-ok">متحقق '+c.ok+'</span>':'')+(c.pa?'<span class="obx-b obx-pa">جزئي '+c.pa+'</span>':'')+(c.no?'<span class="obx-b obx-no">غير متحقق '+c.no+'</span>':'')+(c.na?'<span class="obx-b obx-na">لم يُتح '+c.na+'</span>':'')}
function blockHTML(code){var it=OB[code],f=SF(),h='<details class="obx" data-obx="'+code+'"><summary data-obxs="'+code+'">'+sumHTML(code)+'</summary><div class="obx-p"><p class="obx-h">بنود لا يُتحقق منها إلا بالمشاهدة في الموقع أو بالعرض الحي. سجّل النتيجة وما شاهدته، فهي سند لدرجة المرحلة الميدانية.</p>';
  it.forEach(function(x,i){var k=code+'.ob'+(i+1),v=f[k+'.r']||'';
    h+='<div class="obx-i" data-obi="'+k+'" data-v="'+esc(v)+'"><span class="obx-no">'+(i+1)+'</span><div class="obx-c"><p class="obx-tx">'+esc(x[0])+'</p><div class="obx-m"><span class="obx-tag">'+esc(x[1])+'</span>'+x[2].split(' / ').map(function(l){return '<span class="obx-tag obx-lv">'+(LVN[l]||esc(l))+'</span>'}).join('')+'</div>'+
      '<div class="obx-ch" role="group" aria-label="نتيجة البند '+(i+1)+' للمعيار الفرعي '+code+'">'+RES.map(function(r){return '<button type="button" class="obx-chip" data-obc="'+k+'" data-v="'+r[0]+'" aria-pressed="'+(v===r[0])+'">'+r[1]+'</button>'}).join('')+'</div>'+
      '<select id="f-'+code+'-ob'+(i+1)+'-r" data-f="'+k+'.r" hidden aria-hidden="true" tabindex="-1"><option value=""></option>'+RES.map(function(r){return '<option value="'+r[0]+'">'+r[1]+'</option>'}).join('')+'</select>'+
      '<textarea id="f-'+code+'-ob'+(i+1)+'-n" data-f="'+k+'.n" rows="1" placeholder="ما شاهدته، ورقم الصورة إن وُجدت">'+esc(f[k+'.n']||'')+'</textarea></div></div>'});
  h+='<label class="obx-xl" for="f-'+code+'-ob-x">بنود أخرى عاينها الفريق في الموقع</label><textarea id="f-'+code+'-ob-x" data-f="'+code+'.ob.x" rows="2" placeholder="اكتب البند ونتيجته…">'+esc(f[code+'.ob.x']||'')+'</textarea></div></details>';
  return h}
function inject(){var n=0;Object.keys(OB).forEach(function(code){var a=document.getElementById('sub-'+code);if(!a||a.querySelector('[data-obx]'))return;var lv=a.querySelector('.lvls');var w=document.createElement('div');w.innerHTML=blockHTML(code);var el=w.firstChild;if(lv&&lv.nextSibling)a.insertBefore(el,lv.nextSibling);else a.appendChild(el);
    var sel=el.querySelectorAll('select[data-f]');for(var i=0;i<sel.length;i++)sel[i].value=SF()[sel[i].getAttribute('data-f')]||'';n++});
  if(n)try{D().S()&&window.dispatchEvent(new Event('obs:ready'))}catch(e){}return n}
function refresh(){Object.keys(OB).forEach(function(code){var el=document.querySelector('[data-obx="'+code+'"]');if(!el)return;var f=SF();
  var ref=document.getElementById('f-'+code+'-e-rev'),ro=!!(ref&&ref.disabled),fs=el.querySelectorAll('[data-f]');for(var q=0;q<fs.length;q++)if(fs[q].disabled!==ro)fs[q].disabled=ro;
  var s=el.querySelector('[data-obxs]');if(s){var nh=sumHTML(code);if(s.innerHTML!==nh)s.innerHTML=nh}
  (OB[code]||[]).forEach(function(_,i){var k=code+'.ob'+(i+1),v=f[k+'.r']||'',row=el.querySelector('[data-obi="'+k+'"]');if(!row)return;var sel=row.querySelector('select');
    if(sel&&sel.value!==v&&document.activeElement!==sel)sel.value=v;var dis=!!(sel&&sel.disabled);row.setAttribute('data-v',v);
    var bs=row.querySelectorAll('.obx-chip');for(var j=0;j<bs.length;j++){bs[j].setAttribute('aria-pressed',String(bs[j].getAttribute('data-v')===v));bs[j].disabled=dis}})})}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.obx-chip');if(!b||b.disabled)return;var k=b.getAttribute('data-obc'),sel=document.querySelector('select[data-f="'+k+'.r"]');if(!sel||sel.disabled)return;
  var v=b.getAttribute('data-v');sel.value=sel.value===v?'':v;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));refresh()});

/* تصدير Word: نموذج المعاينة الميدانية معبّأً */
function stdOf(code){try{return D().SUB[code].std}catch(e){return +code.split('-')[0]}}
function buildDoc(){var X=window.docx;if(!X)throw new Error('docx');var f=SF(),S=D().S(),FONT={ascii:'Sakkal Majalla',hAnsi:'Sakkal Majalla',cs:'Sakkal Majalla',eastAsia:'Sakkal Majalla'},AL=X.AlignmentType,DX=X.WidthType.DXA;
  var LAB={};RES.forEach(function(r){LAB[r[0]]=r[1]});
  function run(t,o){o=o||{};return new X.TextRun({text:String(t),font:FONT,size:o.size||24,bold:!!o.bold,color:o.color,rightToLeft:true})}
  function P(t,o){o=o||{};return new X.Paragraph({bidirectional:true,alignment:o.al||AL.START,spacing:{before:o.sb||0,after:o.sa==null?60:o.sa},keepNext:!!o.keep,children:[run(t,o)]})}
  var bd={style:X.BorderStyle.SINGLE,size:4,color:'B9C7C5'},B={top:bd,bottom:bd,left:bd,right:bd};
  function C(t,w,o){o=o||{};var ps=String(t==null?'':t).split(/\r?\n/).map(function(x){return P(x||' ',{size:o.size||21,bold:o.bold,color:o.color,al:o.al,sa:0})});return new X.TableCell({children:ps,width:{size:w,type:DX},shading:o.fill?{type:X.ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,borders:B,margins:{top:60,bottom:60,left:100,right:100}})}
  function T(cw,rows){return new X.Table({visuallyRightToLeft:true,width:{size:cw.reduce(function(a,b){return a+b},0),type:DX},columnWidths:cw,rows:rows.map(function(r,i){return new X.TableRow({children:r,cantSplit:true,tableHeader:i===0})})})}
  var W=[500,5600,1700,1100,1400,4400],H=['م','ما يُعاين في الموقع','مكان المعاينة','المستوى','النتيجة','ما شوهد'];
  var ch=[P('نموذج المعاينة الميدانية',{size:34,bold:true,color:'1F3A5F',al:AL.CENTER,sa:40}),
    P('المنشأة: '+(S.setup.facility||'—')+'    تاريخ الزيارة: '+(S.setup.date||'—'),{size:22,al:AL.CENTER,sa:160})];
  var bySt={};Object.keys(OB).forEach(function(c){(bySt[stdOf(c)]=bySt[stdOf(c)]||[]).push(c)});
  D().STDS.forEach(function(st){var cs=bySt[st.n];if(!cs)return;
    ch.push(P('المعيار '+st.ord+' ('+st.n+'): '+st.title,{size:28,bold:true,color:'B0702F',sb:200,sa:80,keep:true}));
    cs.forEach(function(code){var sb=D().SUB[code];ch.push(P('('+code+') '+(sb?sb.text:''),{size:23,bold:true,color:'1F3A5F',sb:100,sa:60,keep:true}));
      var rows=[H.map(function(h,i){return C(h,W[i],{bold:true,color:'FFFFFF',fill:'1F3A5F',al:AL.CENTER})})];
      OB[code].forEach(function(x,i){var k=code+'.ob'+(i+1);rows.push([C(i+1,W[0],{al:AL.CENTER}),C(x[0],W[1]),C(x[1],W[2]),C(x[2].split(' / ').map(function(l){return LVN[l]||l}).join('، '),W[3],{al:AL.CENTER}),C(LAB[f[k+'.r']]||'—',W[4],{al:AL.CENTER,bold:true}),C(f[k+'.n']||'',W[5])])});
      ch.push(T(W,rows));if((f[code+'.ob.x']||'').trim())ch.push(P('بنود أخرى: '+f[code+'.ob.x'],{size:21,sb:60}))})});
  ch.push(P('عضو الفريق: ............................    رئيس الفريق: ............................',{size:22,sb:300}));
  return new X.Document({sections:[{properties:{page:{size:{orientation:X.PageOrientation.LANDSCAPE,width:11906,height:16838},margin:{top:900,bottom:900,left:900,right:900}}},
    footers:{default:new X.Footer({children:[P('نموذج المعاينة الميدانية · إعداد المهندس/ علي الأحمري',{size:16,color:'777777',al:AL.CENTER})]})},children:ch}]})}
async function exportDoc(){try{var blob=await window.docx.Packer.toBlob(buildDoc());var fac=(D().S().setup.facility||'').replace(/[\\/:*?"<>|]/g,'').trim();var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='نموذج المعاينة الميدانية'+(fac?' - '+fac:'')+'.docx';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){alert('تعذّر إنشاء ملف Word: '+(e&&e.message||e))}}
function addBtn(){if(document.getElementById('btnObsW'))return;var ref=document.getElementById('btnWordF');if(!ref)return;var b=document.createElement('button');b.className='btn';b.id='btnObsW';b.type='button';b.textContent='نموذج المعاينة الميدانية (Word)';b.title='بنود المعاينة الميدانية ونتائجها وملاحظاتها لكل المعايير';ref.parentNode.insertBefore(b,ref.nextSibling);b.addEventListener('click',exportDoc)}
function boot(){if(!D()){setTimeout(boot,300);return}inject();addBtn();refresh();setInterval(function(){inject();refresh()},1500)}
document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('.obx'))setTimeout(refresh,50)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.OBX={buildDoc:buildDoc,refresh:refresh,data:OB};
})();
