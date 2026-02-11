import re

with open('gallery.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'data-pswp-src="([^"]+)"', content)
for match in matches:
    print(match)
