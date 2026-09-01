import re

with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

options = []
for idx in range(1196, 1315):
    line = lines[idx]
    m = re.search(r"<option>(.*?)</option>", line)
    if m:
        options.append(m.group(1))

print(f"Parsed {len(options)} options.")
with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/options_list.txt", "w", encoding="utf-8") as out:
    out.write(repr(options))
