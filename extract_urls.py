import re, pathlib
files=['index.tsx','alumni_search.js','index.html','api.ts','seed-export.ts','alumni_modal.html']
pat=re.compile(r'https?://[^\s\"\'\)\]\},>]+')
allpairs=[]
for f in files:
    text=pathlib.Path(f).read_text(encoding='utf-8', errors='ignore')
    urls=[]
    for m in pat.finditer(text):
        u=m.group(0).rstrip('),.;\'\"')
        urls.append(u)
    # clean accidental trailing punctuation and duplicates
    uniq=[]
    seen=set()
    for u in urls:
        if u not in seen:
            seen.add(u)
            uniq.append(u)
    print(f'FILE::{f}::{len(uniq)}')
    for u in uniq:
        print(u)
    print('END')
    allpairs.extend(uniq)
print('TOTAL::'+str(len(set(allpairs))))
for u in sorted(set(allpairs)):
    print(u)
