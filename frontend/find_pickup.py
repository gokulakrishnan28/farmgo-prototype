with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "pickup village/location" in line.lower() or "pickuplocation" in line:
        if "<select" in line or "option" in line or "label" in line:
            print(f"Line {idx+1}: {line.strip().encode('ascii', 'backslashreplace').decode('ascii')}")
            # print surrounding
            start = max(0, idx - 3)
            end = min(len(lines), idx + 20)
            for i in range(start, end):
                print(f"   {i+1}: {lines[i].strip().encode('ascii', 'backslashreplace').decode('ascii')}")
            print("-" * 50)
            break
