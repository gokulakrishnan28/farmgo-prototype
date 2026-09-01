with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for idx, line in enumerate(lines):
    if idx + 1 > 1572:
        if "setwizardstep" in line.lower() or "wizard nav" in line.lower():
            print(f"Line {idx+1}: {line.strip().encode('ascii', 'backslashreplace').decode('ascii')}")
            # print surrounding
            start = max(0, idx - 2)
            end = min(len(lines), idx + 8)
            for i in range(start, end):
                print(f"   {i+1}: {lines[i].strip().encode('ascii', 'backslashreplace').decode('ascii')}")
            print("-" * 50)
