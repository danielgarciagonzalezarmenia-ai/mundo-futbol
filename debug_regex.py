import re, json, os
os.chdir(r'C:\Users\Daniel\Desktop\Mundo Futbol')
content = open('app-pc.js', encoding='utf-8').read()
pattern = re.compile(r"home:\s*'([^']+)',\s*away:\s*'([^']+)',\s*channels:\s*(\[[^\]]*\])\s*\}", re.DOTALL)
found = 0
for m in pattern.finditer(content):
    key = m.group(1) + ' vs ' + m.group(2)
    try:
        ch = json.loads(m.group(3))
    except:
        ch = 'PARSE ERROR'
    if ch:
        found += 1
        print(f'{key}: {ch}')
print(f'Total non-empty: {found}')
