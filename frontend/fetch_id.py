import urllib.request
import urllib.parse
import re

html = urllib.request.urlopen('https://www.youtube.com/results?search_query=' + urllib.parse.quote('Portfolio Risk and Return - Part I 2025 Level I CFA AnalystPrep')).read().decode('utf-8')
match = re.search(r'videoId":"(.*?)"', html)
if match:
    print(match.group(1))
