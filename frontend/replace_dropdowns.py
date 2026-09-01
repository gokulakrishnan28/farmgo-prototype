import json

# Read options list
with open("options_list.txt", "r", encoding="utf-8") as f:
    options = eval(f.read())

# Read Dashboard.tsx
with open("src/pages/Farmer/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Define TN_LOCATIONS string representation
tn_loc_def = "const TN_LOCATIONS = [\n" + ",\n".join(f'  "{opt}"' for opt in options) + "\n];\n"

# Replace pickup select options
pickup_target = """                    <option>Madurai (\u0bae\u0ba4\u0bc1\u0bb0\u0bc8)</option>
                    <option>Salem (\u0b9a\u0bc7\u0bb2\u0bae\u0bcd)</option>
                    <option>Pollachi (\u0baa\u0bca\u0bb3\u0bcd\u0bb3\u0bbe\u0b9a\u0bcd\u0b9a\u0bbf)</option>
                    <option>Thanjavur (\u0ba4\u0b9e\u0bcd\u0b9a\u0bbe\u0bb5\u0bc2\u0bb0\u0bcd)</option>
                    <option>Erode (\u0b88\u0bb0\u0bcb\u0b9f\u0bc1)</option>"""

pickup_replacement = """                  {TN_LOCATIONS.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}"""

# Re-read target destination block to match and replace
# We know the destination options block starts with '<option>Chennai Koyambedu Market' and ends with '<option>Myladi Uzhavar Sandai (மயிலாடி உழவர் சந்தை)</option>'
# Let's locate the start and end indices of destination options
start_marker = "                    <option>Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)</option>"
end_marker = "                    <option>Myladi Uzhavar Sandai (மயிலாடி உழவர் சந்தை)</option>"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    dest_block = content[start_idx:end_idx]
    
    # Replace destination block
    content = content.replace(dest_block, pickup_replacement)

# Replace pickup block
content = content.replace(pickup_target, pickup_replacement)

# Append TN_LOCATIONS to the end of the file
content += "\n\n" + tn_loc_def

# Save Dashboard.tsx
with open("src/pages/Farmer/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Dropdowns successfully refactored to use TN_LOCATIONS constant!")
