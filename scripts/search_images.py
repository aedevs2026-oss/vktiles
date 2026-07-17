import requests, sys, re, os
from urllib.parse import quote

query = ' '.join(sys.argv[1:]) if len(sys.argv) > 1 else 'parking tile grey'
url = 'https://www.bing.com/images/search?q=' + quote(query)
resp = requests.get(url, headers={'User-Agent':'Mozilla/5.0'}, timeout=20)
print(resp.status_code)
print(resp.text[:2000])
