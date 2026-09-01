with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "showlivetracking" in line.lower() or "showLiveTracking" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # print surrounding
        start = max(0, idx - 2)
        end = min(len(lines), idx + 25)
        for i in range(start, end):
            print(f"   {i+1}: {lines[i].strip().encode('ascii', 'backslashreplace').decode('ascii')}")
        print("-" * 50)
        break
