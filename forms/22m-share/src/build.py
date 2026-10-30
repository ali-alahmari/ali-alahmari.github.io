import re, json, subprocess, sys, os
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'..','..','22m-v2','index.html')
OBF=os.path.join('/home/claude/work/tools/node_modules/.bin/javascript-obfuscator')
s=open(SRC,encoding='utf8').read()
assert '\r' not in s

# 1) meta + title
s=s.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta name="author" content="علي الأحمري">\n<meta name="copyright" content="جميع حقوق الملكية الفكرية محفوظة للمهندس/ علي الأحمري">',1)

# 2) footer
old='<footer class="foot">إعداد المهندس/ <b>علي الأحمري</b></footer>'
assert old in s
s=s.replace(old,'<footer class="foot">إعداد المهندس/ <b>علي الأحمري</b><br><span style="font-size:.85rem">جميع حقوق الملكية الفكرية محفوظة — لا يجوز التعديل أو إعادة النشر دون إذن كتابي</span></footer>',1)

# 3) GS_TPL (sync script, self-creating sheet)
gs=open(os.path.join(HERE,'Code.sync.gs'),encoding='utf8').read()
m=re.search(r'^var GS_TPL=".*?";$',s,re.M); assert m
s=s[:m.start()]+'var GS_TPL='+json.dumps(gs,ensure_ascii=False).replace('\u2028','\\u2028').replace('\u2029','\\u2029').replace('</','<\\/')+';'+s[m.end():]

# 4) share dialog steps
a=s.index('<b>أولاً: رئيس الفريق (مرة واحدة، نحو ٣ دقائق)</b>')
b=s.index('</ol>',a)
steps='''<b>أولاً: رئيس الفريق (مرة واحدة، نحو ٥ دقائق، كل شيء في حسابك أنت)</b>
      <ol>
        <li>افتح محرر Apps Script جديداً من الرابط script.new بحسابك في Google.</li>
        <li>احذف الكود الموجود، والصق الكود أدناه، ثم احفظ.</li>
        <li>اختر الدالة setup من أعلى المحرر واضغط «تشغيل» ووافق على الصلاحيات. تنشئ الدالة جدول Google Sheet في حسابك يحفظ تعبئة الفريق.</li>
        <li>اضغط «نشر» ثم «عملية نشر جديدة»، اختر النوع «تطبيق ويب»، «تنفيذ باسم: أنا»، «من لديه صلاحية الوصول: أي شخص». انسخ «عنوان URL لتطبيق الويب» والصقه في الخانة الثالثة، ثم اضغط «اختبار وربط».</li>
      '''
s=s[:a]+steps+s[b:]

# 5) portal panel (own portal, own Drive)
portal=open(os.path.join(HERE,'Code.portal.gs'),encoding='utf8').read()
PJ=json.dumps(portal,ensure_ascii=False).replace('\u2028','\\u2028').replace('\u2029','\\u2029').replace('</','<\\/')
panel='''<details id="myPortal" style="margin-top:8px"><summary>إنشاء بوابة الشواهد الخاصة بي (مرة واحدة، في حسابك أنت)</summary>
        <div class="note" style="margin:8px 0;line-height:1.9">تحفظ البوابة ملفات المنشآت في Google Drive الخاص بك وحدك، ولا يمر شيء عبر حساب المُعِدّ.</div>
        <ol style="line-height:1.9;margin:6px 0">
          <li>افتح script.new بحسابك، واحذف الكود الموجود، والصق كود البوابة أدناه، ثم احفظ.</li>
          <li>اختر الدالة setup من أعلى المحرر واضغط «تشغيل» ووافق على الصلاحيات. تنشئ مجلد «بوابة شواهد المنشآت» في Drive الخاص بك وكلمة سر للفريق، وتطبعها في سجل التنفيذ في أسفل المحرر. احفظ كلمة السر.</li>
          <li>اضغط «نشر» ثم «عملية نشر جديدة»، النوع «تطبيق ويب»، «تنفيذ باسم: أنا»، «الوصول: أي شخص»، وانسخ الرابط المنتهي بـ /exec.</li>
          <li>افتح قسم «إعداد الربط مع البوابة» أدناه، والصق الرابط وكلمة السر، ثم اضغط «حفظ على هذا الجهاز».</li>
        </ol>
        <label class="lbl" for="myPortalCode">كود البوابة</label>
        <textarea id="myPortalCode" readonly spellcheck="false" dir="ltr" style="min-height:120px"></textarea>
        <div class="presets"><button class="btn" id="myPortalCopy" type="button">نسخ كود البوابة</button><span class="note" id="myPortalMsg" role="status" aria-live="polite"></span></div>
      </details>
      '''
anchor='<details id="pubSet" style="margin-top:8px">'
assert s.count(anchor)==1
s=s.replace(anchor,panel+anchor)
panel_js='<script>(function(){var PG='+PJ+';var t=document.getElementById("myPortalCode"),b=document.getElementById("myPortalCopy"),m=document.getElementById("myPortalMsg");if(!t||!b)return;t.value=PG;b.addEventListener("click",function(){t.focus();t.select();var ok=function(){m.textContent="تم نسخ كود البوابة"};var no=function(){m.textContent="حدّد النص وانسخه يدوياً (Ctrl+C)"};try{var p=navigator.clipboard&&navigator.clipboard.writeText(PG);if(p&&p.then)p.then(ok,no);else{document.execCommand("copy")?ok():no()}}catch(e){no()}})})();</script>\n'

# 6) g2 inside the main (last) script: secondary watchdog
g2=r'''
;(function(){var n=0;setInterval(function(){if(window.__cr===1&&document.querySelector('script[data-g]'))return;if(++n<3)return;var d=document.documentElement;d.innerHTML='<head><meta charset="utf-8"><title>نسخة غير أصلية</title></head><body dir="rtl" style="margin:0;font-family:Tahoma,Arial,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;background:#f6f4ee"><div style="max-width:560px;padding:32px"><h1 style="font-size:1.5rem">هذه النسخة معدَّلة ولا يمكن تشغيلها</h1><p style="line-height:1.9">يعمل هذا النموذج بالنسخة الأصلية فقط، مع بقاء اسم المُعِدّ وحقوق الملكية ظاهرين.</p></div></body>'},2000)})();
'''
tmp=os.path.join(HERE,'g2.tmp.js'); open(tmp,'w',encoding='utf8').write(g2)
subprocess.check_call([OBF,tmp,'--output',tmp.replace('.tmp.js','.out.js'),'--compact','true','--string-array','true','--string-array-encoding','base64','--string-array-threshold','1','--identifier-names-generator','hexadecimal'])
g2o=open(tmp.replace('.tmp.js','.out.js'),encoding='utf8').read()
end=s.rindex('</script>')
s=s[:end]+'\n'+g2o+'\n'+s[end:]

# 7) tag every inline script with data-p, add panel script
s=s.replace('</html>',panel_js+'</html>')
s=re.sub(r'^<script>',r'<script data-p>',s,flags=re.M)
# 8) hash
def toi32(x):
    x&=0xffffffff
    return x-0x100000000 if x&0x80000000 else x
def imul(a,b): return toi32(toi32(a)*toi32(b))
def h2(t):
    a=toi32(0xdeadbeef); b=toi32(0x41c6ce57)
    u=t.encode('utf-16-le')
    for i in range(0,len(u),2):
        c=u[i]|(u[i+1]<<8)
        a=imul(a^c,2654435761); b=imul(b^c,1597334677)
    a=toi32(imul(a^((a&0xffffffff)>>16),2246822507)^imul(b^((b&0xffffffff)>>13),3266489909))
    b=toi32(imul(b^((b&0xffffffff)>>16),2246822507)^imul(a^((a&0xffffffff)>>13),3266489909))
    def b36(n):
        n&=0xffffffff; d='0123456789abcdefghijklmnopqrstuvwxyz'; r=''
        while True:
            r=d[n%36]+r; n//=36
            if n==0: return r
    return b36(a),b36(b)
parts=[]
for m in re.finditer(r'<script data-p>(.*?)</script>',s,re.S):
    parts.append(m.group(1))
t=''.join(p+'\u0001' for p in parts)
ha,hb=h2(t)
keys=json.dumps([ha,hb,len(parts)])
guard=open(os.path.join(HERE,'guard.src.js'),encoding='utf8').read().replace('__KEYS__',keys)
tmp=os.path.join(HERE,'g1.tmp.js'); open(tmp,'w',encoding='utf8').write(guard)
subprocess.check_call([OBF,tmp,'--output',tmp.replace('.tmp.js','.out.js'),'--compact','true','--control-flow-flattening','true','--control-flow-flattening-threshold','0.6','--string-array','true','--string-array-encoding','base64','--string-array-threshold','1','--self-defending','false','--identifier-names-generator','hexadecimal'])
g1=open(tmp.replace('.tmp.js','.out.js'),encoding='utf8').read()
s=s.replace('</html>','<script data-g>'+g1+'</script>\n</html>')
for f in ('g1.tmp.js','g1.out.js','g2.tmp.js','g2.out.js'): os.remove(os.path.join(HERE,f))
open(os.path.join(HERE,'..','index.html'),'w',encoding='utf8').write(s)
print('built',len(s),'scripts',len(parts),ha,hb)
