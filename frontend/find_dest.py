with open("c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "destination" in line.lower() or "pickup" in line.lower() or "sandai" in line.lower():
        if "select" in line or "option" in line or "[" in line or "const" in line or "val" in line or "value" in line:
            print(f"Line {idx+1}: {line.strip().encode('ascii', 'backslashreplace').decode('ascii')}")
