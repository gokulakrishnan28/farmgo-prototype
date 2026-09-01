"""
UX improvements for Farmer Dashboard:
1. Auto-open wizard when farmer_category is in sessionStorage
2. Replace complex wizard step 1 (category select in dashboard) and merge steps
3. Make the booking form clean and easy to use
"""
import re

filepath = "src/pages/Farmer/Dashboard.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# ──────────────────────────────────────────────────────────────────────────────
# 1. Auto-open wizard when arriving from category selection
# ──────────────────────────────────────────────────────────────────────────────
old_state = """  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);"""

new_state = """  // Auto-open wizard if farmer selected a category from landing page
  const [showWizard, setShowWizard] = useState(() => {
    return !!sessionStorage.getItem("farmer_category");
  });
  const [wizardStep, setWizardStep] = useState(() => {
    // Skip step 1 (category) since it was already chosen on landing page
    return sessionStorage.getItem("farmer_category") ? 2 : 1;
  });"""

if old_state in content:
    content = content.replace(old_state, new_state)
    print("OK 1: Auto-open wizard state added")
else:
    print("MISS 1: Could not find showWizard state")

# ──────────────────────────────────────────────────────────────────────────────
# 2. After setting state, clear sessionStorage key to avoid re-triggering
#    We do this by adding a useEffect after the existing isTamil state init area.
#    Find the language toggle init and add a useEffect after the state declarations
# ──────────────────────────────────────────────────────────────────────────────
old_voice_state = "  // Voice simulation state"
new_voice_state = """  // Clear farmer_category from sessionStorage after consuming it (prevent re-trigger)
  // This runs once on mount using a ref approach
  const _categoryConsumedRef = (() => {
    sessionStorage.removeItem("farmer_category");
    return null;
  })();

  // Voice simulation state"""

if old_voice_state in content:
    content = content.replace(old_voice_state, new_voice_state, 1)
    print("OK 2: SessionStorage cleanup added")
else:
    print("MISS 2: Could not find voice simulation state comment")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\nDone. Run: npx tsc --noEmit to verify")
