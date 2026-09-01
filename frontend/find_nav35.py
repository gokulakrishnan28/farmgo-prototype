with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for idx, line in enumerate(lines):
    if "wizardstep === 3.5" in line.lower():
        found = True
        print(f"Line {idx+1}: {line.strip()}")
    if found and "wizard nav" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
        # print surrounding
        start = max(0, idx - 2)
        end = min(len(lines), idx + 20)
        for i in range(start, end):
            print(f"   {i+1}: {lines[i].strip().encode('ascii', 'backslashreplace').decode('ascii')}")
        print("-" * 50)
        break
