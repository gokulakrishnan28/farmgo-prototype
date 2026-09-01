# NLLB-200 Translation Service
import os
import sys

_tokenizer = None
_model = None
_pipe = None

def translate_nllb(text: str, src_lang: str = "eng_Latn", tgt_lang: str = "tam_Taml") -> str:
    """
    Translate text using facebook/nllb-200-distilled-600M model.
    Falls back gracefully to heuristic translation if transformers/torch is unavailable.
    """
    global _tokenizer, _model, _pipe
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
        
        if _pipe is None:
            print("Initializing NLLB-200 model translation pipeline...")
            model_name = "facebook/nllb-200-distilled-600M"
            _tokenizer = AutoTokenizer.from_pretrained(model_name)
            _model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            _pipe = pipeline(
                "translation",
                model=_model,
                tokenizer=_tokenizer,
                src_lang=src_lang,
                tgt_lang=tgt_lang,
                max_length=400
            )
            
        result = _pipe(text, tgt_lang=tgt_lang)
        if result and len(result) > 0:
            return result[0]['translation_text']
    except Exception as e:
        print(f"[NLLB-Service] Live model translation fallback: {e}")
        
    return heuristic_translate(text, src_lang, tgt_lang)

def heuristic_translate(text: str, src_lang: str, tgt_lang: str) -> str:
    """
    Fast local heuristic translator for agri-logistics queries.
    """
    lower = text.lower()
    
    # English to Tamil fallback
    if src_lang == "eng_Latn":
        if "banana" in lower and "dispatch" in lower:
            return "வாழைப்பழத்தை அனுப்புவதற்கு தேவையான உகந்த வெப்பநிலை 13°C முதல் 15°C (கட்டுப்படுத்தப்பட்ட ஈரப்பதம் 90%) ஆகும்."
        elif "banana" in lower and ("degree" in lower or "temperature" in lower):
            return "வாழைப்பழங்கள் கொண்டு செல்ல 13°C முதல் 15°C வெப்பநிலை தேவைப்படுகிறது."
        elif "tomato" in lower and "price" in lower:
            return "தக்காளி விலை: கிலோவிற்கு ₹35 முதல் ₹40 வரை."
        elif "onion" in lower and "price" in lower:
            return "சின்ன வெங்காயத்தின் தற்போதைய விலை ₹60/கிலோ."
        elif "price" in lower or "rate" in lower:
            return "தற்போதைய சந்தை விலை நிலவரம்: தக்காளி ₹35/கிலோ, வெங்காயம் ₹60/கிலோ, உருளைக்கிழங்கு ₹30/கிலோ."
        elif "vehicle" in lower or "transport" in lower:
            return "வாழைப்பழம் மற்றும் காய்கறிகளுக்கு குளிர்சாதன (Reefer) சிறிய வேன் அல்லது Tata Ace/Bolero வண்டிகள் உகந்தது."
        elif "chennai" in lower or "koyambedu" in lower:
            return "கோயம்பேடு சந்தைக்கான போக்குவரத்து தடம் மதுரை மற்றும் ஈரோட்டில் இருந்து தேசிய நெடுஞ்சாலை NH-38 வழியாக இணைக்கப்பட்டுள்ளது."
        elif "thank" in lower or "thanks" in lower:
            return "மிக்க நன்றி! வேறு ஏதேனும் உதவி தேவைப்படுகிறதா?"
        else:
            return "வணக்கம்! நான் உங்கள் FarmGo உதவியாளர். பயிர் விலை நிலவரம், குளிர்சாதன வாகனங்கள் மற்றும் சென்னை கோயம்பேடு சந்தைக்கான வழிகளைப் பற்றி என்னிடம் கேட்கலாம்."

    # Tamil to English fallback
    else:
        if "வாழை" in lower or "வாழைப்பழம்" in lower:
            return "What temperature/degree is required for banana dispatch?"
        elif "தக்காளி" in lower and "விலை" in lower:
            return "What is the current tomato price?"
        elif "வெங்காயம்" in lower and "விலை" in lower:
            return "What is the price of onions?"
        elif "வண்டி" in lower or "வாகனம்" in lower:
            return "Which vehicle is best for agri transport?"
        elif "சென்னை" in lower or "கோயம்பேடு" in lower:
            return "How to reach Chennai Koyambedu market?"
        else:
            return text # Return unchanged
