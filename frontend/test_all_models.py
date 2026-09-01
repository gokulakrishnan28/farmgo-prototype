import httpx

key = "AQ.Ab8RN6KyfFe-uPb8E2ox6DN09XXAFoPIrLrqmmwiPiS6u3GqGQ"

payload = {
    "contents": [{
        "parts": [{"text": "Hello, respond with 'Success' if you can read this."}]
    }]
}

headers = {"Content-Type": "application/json"}

# List of models from listModels
models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b"
]

for m in models:
    url = f"https://generativelanguage.googleapis.com/v1/models/{m}:generateContent?key={key}"
    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=5.0)
        print(f"[{m}] Code: {response.status_code}")
        if response.status_code == 200:
            print(" -> SUCCESS!")
            print(response.json())
        else:
            # Print short error message
            msg = response.json().get("error", {}).get("message", "No message")
            print(f" -> Error: {msg[:120]}")
        print("-" * 50)
    except Exception as e:
        print(f"[{m}] Failed: {e}")
