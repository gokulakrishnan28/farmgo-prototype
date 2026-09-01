with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Transporter/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "completedtrips.map" in line.lower() or "requests.map" in line.lower() or "activeshipment" in line.lower():
        print(f"Line {idx+1}: {line.strip().encode('ascii', 'backslashreplace').decode('ascii')}")
        start = max(0, idx - 2)
        end = min(len(lines), idx + 25)
        for i in range(start, end):
            print(f"   {i+1}: {lines[i].strip().encode('ascii', 'backslashreplace').decode('ascii')}")
        print("-" * 50)
