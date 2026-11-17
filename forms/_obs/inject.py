# يحقن طبقة «المعاينة الميدانية» في نسخ النموذج: python3 forms/_obs/inject.py forms/22m-v4/index.html forms/22m-v5/index.html
import sys, os, re
d = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(d, 'obs.src.js'), encoding='utf-8').read().replace('__OBDATA__', open(os.path.join(d, 'data.json'), encoding='utf-8').read().strip())
css = open(os.path.join(d, 'obs.css'), encoding='utf-8').read()
blk = '<style id="obs-css">\n' + css + '</style>\n<script id="obs-js">\n' + js + '</script>\n'
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'<style id="obs-css">.*?</script>\n', '', s, flags=re.S)
    i = s.rindex('</html>')
    s = s[:i] + blk + s[i:]
    open(p, 'w', encoding='utf-8').write(s)
    print('injected', p)
