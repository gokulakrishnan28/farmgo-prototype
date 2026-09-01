with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "interactive multi-step logistics wizard" in line.lower() or "stepper progress bar" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
        # print surrounding
        start = max(0, idx - 2)
        end = min(len(lines), idx + 18)
        for i in range(start, end):
            print(f"   {i+1}: {lines[i].strip()}")
        print("-" * 50)
        break
