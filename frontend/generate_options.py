import sys

raw_data = """
Kanchipuram, Kanchipuram
Pallavaram, Kanchipuram
Chengelpet, Chengelpet
Tiruthani, Tiruvallur
Tiruvallur, Tiruvallur
Ambattur, Tiruvallur
Vellore, Vellore
Katpadi, Vellore
Vaniyampadi, Vellore
Gudiyatham, Vellore
Kathithapattarai, Vellore
Arcot, Vellore
Ranipettai, Vellore
Tiruvannamalai, Tiruvannamalai
Polur, Tiruvannamalai
Arani, Tiruvannamalai
Cheyyar, Tiruvannamalai
Cuddalore, Cuddalore
Chidambaram, Cuddalore
Viruthachalam, Cuddalore
Panruti, Cuddalore
Dindivanam, Villupuram
Villupuram, Villupuram
Kallakurichi, Villupuram
Sooramangalam, Salem
Ammapet, Salem
Athur, Salem
Thathakapatti, Salem
Mettur, Salem
Attayampatti, Salem
Hasthampatti, Salem
Namakkal, Namakkal
Tiruchengode, Namakkal
Rasipuram, Namakkal
Kumarapalayam, Namakkal
Dharmapuri, Dharmapuri
Hosur, Krishnagiri
Krishnagiri, Krishnagiri
Kovai R.S.Puram, Coimbatore
Singanallur, Coimbatore
Pollachi, Coimbatore
Udumalpet, Coimbatore
Tiruppur (North), Tiruppur
Mettupalayam, Coimbatore
Tiruppur (South), Tiruppur
Kurichi, Coimbatore
Ooty, Nilgiris
Coonoor, Nilgiris
Erode Sampath nagar, Erode
Gobichettipalayam, Erode
Sathyamangalam, Erode
Dharapuram, Erode
Tiruchi Anna nagar, Tiruchi
Tiruchi K.K nagar, Tiruchi
Thuraiyur, Tiruchi
Manaparai, Tiruchi
Perambalur, Perambalur
Ariyalur, Ariyalur
Karur, Karur
Kulithalai, Karur
Velayuthampalayam, Karur
Thanjavur, Thanjavur
Kumbakonam, Thanjavur
Pattukottai, Thanjavur
Mayiladuthurai, Nagapattinam
Nagapattinam, Nagapattinam
Tiruthuraipoondi, Tiruvarur
Mannarkudi, Tiruvarur
Tiruvarur, Tiruvarur
Pudukottai, Pudukottai
Aranthangi, Pudukottai
Alangudi, Pudukottai
Madurai Anna nagar, Madurai
Chokkikulam, Madurai
Palanganatham, Madurai
Usilampatti, Madurai
Tirumangalam, Madurai
Melur, Madurai
Dindigul, Dindigul
Palani, Dindigul
Chinnalapatti, Dindigul
Theni, Theni
Cumbum, Theni
Bodi, Theni
Periyakulam, Theni
Sivagangai, Sivagangai
Devakottai, Sivagangai
Karaikudi, Sivagangai
Aruppukottai, Viruthunagar
Rajapalayam, Viruthunagar
Srivilliputhur, Viruthunagar
Viruthunagar, Viruthunagar
Sivakasi, Viruthunagar
Sathur, Viruthunagar
Ramanathapuram, Ramanathapuram
Paramakudi, Ramanathapuram
Sankarankovil, Tirunelveli
Palayamkottai, Tirunelveli
Tenkasi, Tirunelveli
Kandiyaperi, Tirunelveli
Tuticorin, Tuticorin
Kovilpatti, Tuticorin
Vadaseri, Kanyakumari
Myladi, Kanyakumari
"""

tamil_names = {
    "Kanchipuram": "காஞ்சிபுரம்",
    "Pallavaram": "பல்லாவரம்",
    "Chengelpet": "செங்கல்பட்டு",
    "Tiruthani": "திருத்தணி",
    "Tiruvallur": "திருவள்ளூர்",
    "Ambattur": "அம்பத்தூர்",
    "Vellore": "வேலூர்",
    "Katpadi": "காட்பாடி",
    "Vaniyampadi": "வாணியம்பாடி",
    "Gudiyatham": "குடியாத்தம்",
    "Kathithapattarai": "காதிதாப்பட்டறை",
    "Arcot": "ஆற்காடு",
    "Ranipettai": "இராணிப்பேட்டை",
    "Tiruvannamalai": "திருவண்ணாமலை",
    "Polur": "போளூர்",
    "Arani": "ஆரணி",
    "Cheyyar": "செய்யாறு",
    "Cuddalore": "கடலூர்",
    "Chidambaram": "சிதம்பரம்",
    "Viruthachalam": "விருத்தாசலம்",
    "Panruti": "பண்ருட்டி",
    "Dindivanam": "திண்டிவனம்",
    "Villupuram": "விழுப்புரம்",
    "Kallakurichi": "கள்ளக்குறிச்சி",
    "Sooramangalam": "சூரமங்கலம்",
    "Ammapet": "அம்மாபேட்டை",
    "Athur": "ஆத்தூர்",
    "Thathakapatti": "தாதகாப்பட்டி",
    "Mettur": "மேட்டூர்",
    "Attayampatti": "ஆட்டையாம்பட்டி",
    "Hasthampatti": "அஸ்தம்பட்டி",
    "Namakkal": "நாமக்கல்",
    "Tiruchengode": "திருச்செங்கோடு",
    "Rasipuram": "இராசிபுரம்",
    "Kumarapalayam": "குமாரபாளையம்",
    "Dharmapuri": "தர்மபுரி",
    "Hosur": "ஓசூர்",
    "Krishnagiri": "கிருஷ்ணகிரி",
    "Kovai R.S.Puram": "கோவை ஆர்.எஸ்.புரம்",
    "Singanallur": "சிங்கநல்லூர்",
    "Pollachi": "பொள்ளாச்சி",
    "Udumalpet": "உடுமலைப்பேட்டை",
    "Tiruppur (North)": "திருப்பூர் (வடக்கு)",
    "Mettupalayam": "மேட்டுப்பாளையம்",
    "Tiruppur (South)": "திருப்பூர் (தெற்கு)",
    "Kurichi": "குறிச்சி",
    "Ooty": "ஊட்டி",
    "Coonoor": "குன்னூர்",
    "Erode Sampath nagar": "ஈரோடு சம்பத் நகர்",
    "Gobichettipalayam": "கோபிசெட்டிபாளையம்",
    "Sathyamangalam": "சத்தியமங்கலம்",
    "Dharapuram": "தாராபுரம்",
    "Tiruchi Anna nagar": "திருச்சி அண்ணா நகர்",
    "Tiruchi K.K nagar": "திருச்சி கே.கே நகர்",
    "Thuraiyur": "துறையூர்",
    "Manaparai": "மணப்பாறை",
    "Perambalur": "பெரம்பலூர்",
    "Ariyalur": "அரியலூர்",
    "Karur": "கரூர்",
    "Kulithalai": "குளித்தலை",
    "Velayuthampalayam": "வேலாயுதம்பாளையம்",
    "Thanjavur": "தஞ்சாவூர்",
    "Kumbakonam": "கும்பகோணம்",
    "Pattukottai": "பட்டுக்கோட்டை",
    "Mayiladuthurai": "மயிலாடுதுறை",
    "Nagapattinam": "நாகப்பட்டினம்",
    "Tiruthuraipoondi": "திருத்துறைப்பூண்டி",
    "Mannarkudi": "மன்னார்குடி",
    "Tiruvarur": "திருவாரூர்",
    "Pudukottai": "புதுக்கோட்டை",
    "Aranthangi": "அறந்தாங்கி",
    "Alangudi": "ஆலங்குடி",
    "Madurai Anna nagar": "மதுரை அண்ணா நகர்",
    "Chokkikulam": "சொக்கிகுளம்",
    "Palanganatham": "பழங்காநத்தம்",
    "Usilampatti": "உசிலம்பட்டி",
    "Tirumangalam": "திருமங்கலம்",
    "Melur": "மேலூர்",
    "Dindigul": "திண்டுக்கல்",
    "Palani": "பழனி",
    "Chinnalapatti": "சின்னாளப்பட்டி",
    "Theni": "தேனி",
    "Cumbum": "கம்பம்",
    "Bodi": "போடிநாயக்கனூர்",
    "Periyakulam": "பெரியகுளம்",
    "Sivagangai": "சிவகங்கை",
    "Devakottai": "தேவகோட்டை",
    "Karaikudi": "காரைக்குடி",
    "Aruppukottai": "அருப்புக்கோட்டை",
    "Rajapalayam": "இராஜபாளையம்",
    "Srivilliputhur": "ஸ்ரீவில்லிபுத்தூர்",
    "Viruthunagar": "விருதுநகர்",
    "Sivakasi": "சிவகாசி",
    "Sathur": "சாத்தூர்",
    "Ramanathapuram": "இராமநாதபுரம்",
    "Paramakudi": "பரமக்குடி",
    "Sankarankovil": "சங்கரன்கோவில்",
    "Palayamkottai": "பாளையங்கோட்டை",
    "Tenkasi": "தென்காசி",
    "Kandiyaperi": "கண்டியபேரி",
    "Tuticorin": "தூத்துக்குடி",
    "Kovilpatti": "கோவில்பட்டி",
    "Vadaseri": "வடாசேரி",
    "Myladi": "மயிலாடி"
}

options = []
for line in raw_data.strip().split("\n"):
    if not line:
        continue
    name, dist = [x.strip() for x in line.split(",")]
    ta_name = tamil_names.get(name, name)
    option_str = f'<option>{name} Uzhavar Sandai ({ta_name} உழவர் சந்தை)</option>'
    options.append(option_str)

# Print options encoded in backslash to prevent console output crashing
for opt in options:
    print(opt.encode("ascii", "backslashreplace").decode("ascii"))
