with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "import" in line and "lucide-react" in line:
        print(f"Line {idx+1}: {line.strip()}")
        break
