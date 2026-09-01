import os

options_block = """                    <option>Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)</option>
                    <option>Coimbatore MGR Market (கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை)</option>
                    <option>Madurai Mattuthavani (மதுரை மாட்டுத்தாவணி)</option>
                    <option>Kanchipuram Uzhavar Sandai (காஞ்சிபுரம் உழவர் சந்தை)</option>
                    <option>Pallavaram Uzhavar Sandai (பல்லாவரம் உழவர் சந்தை)</option>
                    <option>Chengelpet Uzhavar Sandai (செங்கல்பட்டு உழவர் சந்தை)</option>
                    <option>Tiruthani Uzhavar Sandai (திருத்தணி உழவர் சந்தை)</option>
                    <option>Tiruvallur Uzhavar Sandai (திருவள்ளூர் உழவர் சந்தை)</option>
                    <option>Ambattur Uzhavar Sandai (அம்பத்தூர் உழவர் சந்தை)</option>
                    <option>Vellore Uzhavar Sandai (வேலூர் உழவர் சந்தை)</option>
                    <option>Katpadi Uzhavar Sandai (காட்பாடி உழவர் சந்தை)</option>
                    <option>Vaniyampadi Uzhavar Sandai (வாணியம்பாடி உழவர் சந்தை)</option>
                    <option>Gudiyatham Uzhavar Sandai (குடியாத்தம் உழவர் சந்தை)</option>
                    <option>Kathithapattarai Uzhavar Sandai (காதிதாப்பட்டறை உழவர் சந்தை)</option>
                    <option>Arcot Uzhavar Sandai (ஆற்காடு உழவர் சந்தை)</option>
                    <option>Ranipettai Uzhavar Sandai (இராணிப்பேட்டை உழவர் சந்தை)</option>
                    <option>Tiruvannamalai Uzhavar Sandai (திருவண்ணாமலை உழவர் சந்தை)</option>
                    <option>Polur Uzhavar Sandai (போளூர் உழவர் சந்தை)</option>
                    <option>Arani Uzhavar Sandai (ஆரணி உழவர் சந்தை)</option>
                    <option>Cheyyar Uzhavar Sandai (செய்யாறு உழவர் சந்தை)</option>
                    <option>Cuddalore Uzhavar Sandai (கடலூர் உழவர் சந்தை)</option>
                    <option>Chidambaram Uzhavar Sandai (சிதம்பரம் உழவர் சந்தை)</option>
                    <option>Viruthachalam Uzhavar Sandai (விருத்தாசலம் உழவர் சந்தை)</option>
                    <option>Panruti Uzhavar Sandai (பண்ருட்டி உழவர் சந்தை)</option>
                    <option>Dindivanam Uzhavar Sandai (திண்டிவனம் உழவர் சந்தை)</option>
                    <option>Villupuram Uzhavar Sandai (விழுப்புரம் உழவர் சந்தை)</option>
                    <option>Kallakurichi Uzhavar Sandai (கள்ளக்குறிச்சி உழவர் சந்தை)</option>
                    <option>Sooramangalam Uzhavar Sandai (சூரமங்கலம் உழவர் சந்தை)</option>
                    <option>Ammapet Uzhavar Sandai (அம்மாபேட்டை உழவர் சந்தை)</option>
                    <option>Athur Uzhavar Sandai (ஆத்தூர் உழவர் சந்தை)</option>
                    <option>Thathakapatti Uzhavar Sandai (தாதகாப்பட்டி உழவர் சந்தை)</option>
                    <option>Mettur Uzhavar Sandai (மேட்டூர் உழவர் சந்தை)</option>
                    <option>Attayampatti Uzhavar Sandai (ஆட்டையாம்பட்டி உழவர் சந்தை)</option>
                    <option>Hasthampatti Uzhavar Sandai (அஸ்தம்பட்டி உழவர் சந்தை)</option>
                    <option>Namakkal Uzhavar Sandai (நாமக்கல் உழவர் சந்தை)</option>
                    <option>Tiruchengode Uzhavar Sandai (திருச்செங்கோடு உழவர் சந்தை)</option>
                    <option>Rasipuram Uzhavar Sandai (இராசிபுரம் உழவர் சந்தை)</option>
                    <option>Kumarapalayam Uzhavar Sandai (குமாரபாளையம் உழவர் சந்தை)</option>
                    <option>Dharmapuri Uzhavar Sandai (தர்மபுரி உழவர் சந்தை)</option>
                    <option>Hosur Uzhavar Sandai (ஓசூர் உழவர் சந்தை)</option>
                    <option>Krishnagiri Uzhavar Sandai (கிருஷ்ணகிரி உழவர் சந்தை)</option>
                    <option>Kovai R.S.Puram Uzhavar Sandai (கோவை ஆர்.எஸ்.புரம் உழவர் சந்தை)</option>
                    <option>Singanallur Uzhavar Sandai (சிங்கநல்லூர் உழவர் சந்தை)</option>
                    <option>Pollachi Uzhavar Sandai (பொள்ளாச்சி உழவர் சந்தை)</option>
                    <option>Udumalpet Uzhavar Sandai (உடுமலைப்பேட்டை உழவர் சந்தை)</option>
                    <option>Tiruppur (North) Uzhavar Sandai (திருப்பூர் (வடக்கு) உழவர் சந்தை)</option>
                    <option>Mettupalayam Uzhavar Sandai (மேட்டுப்பாளையம் உழவர் சந்தை)</option>
                    <option>Tiruppur (South) Uzhavar Sandai (திருப்பூர் (தெற்கு) உழவர் சந்தை)</option>
                    <option>Kurichi Uzhavar Sandai (குறிச்சி உழவர் சந்தை)</option>
                    <option>Ooty Uzhavar Sandai (ஊட்டி உழவர் சந்தை)</option>
                    <option>Coonoor Uzhavar Sandai (குன்னூர் உழவர் சந்தை)</option>
                    <option>Erode Sampath nagar Uzhavar Sandai (ஈரோடு சம்பத் நகர் உழவர் சந்தை)</option>
                    <option>Gobichettipalayam Uzhavar Sandai (கோபிசெட்டிபாளையம் உழவர் சந்தை)</option>
                    <option>Sathyamangalam Uzhavar Sandai (சத்தியமங்கலம் உழவர் சந்தை)</option>
                    <option>Dharapuram Uzhavar Sandai (தாராபுரம் உழவர் சந்தை)</option>
                    <option>Tiruchi Anna nagar Uzhavar Sandai (திருச்சி அண்ணா நகர் உழவர் சந்தை)</option>
                    <option>Tiruchi K.K nagar Uzhavar Sandai (திருச்சி கே.கே நகர் உழவர் சந்தை)</option>
                    <option>Thuraiyur Uzhavar Sandai (துறையூர் உழவர் சந்தை)</option>
                    <option>Manaparai Uzhavar Sandai (மணப்பாறை உழவர் சந்தை)</option>
                    <option>Perambalur Uzhavar Sandai (பெரம்பலூர் உழவர் சந்தை)</option>
                    <option>Ariyalur Uzhavar Sandai (அரியலூர் உழவர் சந்தை)</option>
                    <option>Karur Uzhavar Sandai (கரூர் உழவர் சந்தை)</option>
                    <option>Kulithalai Uzhavar Sandai (குளித்தலை உழவர் சந்தை)</option>
                    <option>Velayuthampalayam Uzhavar Sandai (வேலாயுதம்பாளையம் உழவர் சந்தை)</option>
                    <option>Thanjavur Uzhavar Sandai (தஞ்சாவூர் உழவர் சந்தை)</option>
                    <option>Kumbakonam Uzhavar Sandai (கும்பகோணம் உழவர் சந்தை)</option>
                    <option>Pattukottai Uzhavar Sandai (பட்டுக்கோட்டை உழவர் சந்தை)</option>
                    <option>Mayiladuthurai Uzhavar Sandai (மயிலாடுதுறை உழவர் சந்தை)</option>
                    <option>Nagapattinam Uzhavar Sandai (நாகப்பட்டினம் உழவர் சந்தை)</option>
                    <option>Tiruthuraipoondi Uzhavar Sandai (திருத்துறைப்பூண்டி உழவர் சந்தை)</option>
                    <option>Mannarkudi Uzhavar Sandai (மன்னார்குடி உழவர் சந்தை)</option>
                    <option>Tiruvarur Uzhavar Sandai (திருவாரூர் உழவர் சந்தை)</option>
                    <option>Pudukottai Uzhavar Sandai (புதுக்கோட்டை உழவர் சந்தை)</option>
                    <option>Aranthangi Uzhavar Sandai (அறந்தாங்கி உழவர் சந்தை)</option>
                    <option>Alangudi Uzhavar Sandai (ஆலங்குடி உழவர் சந்தை)</option>
                    <option>Madurai Anna nagar Uzhavar Sandai (மதுரை அண்ணா நகர் உழவர் சந்தை)</option>
                    <option>Chokkikulam Uzhavar Sandai (சொக்கிகுளம் உழவர் சந்தை)</option>
                    <option>Palanganatham Uzhavar Sandai (பழங்காநத்தம் உழவர் சந்தை)</option>
                    <option>Usilampatti Uzhavar Sandai (உசிலம்பட்டி உழவர் சந்தை)</option>
                    <option>Tirumangalam Uzhavar Sandai (திருமங்கலம் உழவர் சந்தை)</option>
                    <option>Melur Uzhavar Sandai (மேலூர் உழவர் சந்தை)</option>
                    <option>Dindigul Uzhavar Sandai (திண்டுக்கல் உழவர் சந்தை)</option>
                    <option>Palani Uzhavar Sandai (பழனி உழவர் சந்தை)</option>
                    <option>Chinnalapatti Uzhavar Sandai (சின்னாளப்பட்டி உழவர் சந்தை)</option>
                    <option>Theni Uzhavar Sandai (தேனி உழவர் சந்தை)</option>
                    <option>Cumbum Uzhavar Sandai (கம்பம் உழவர் சந்தை)</option>
                    <option>Bodi Uzhavar Sandai (போடிநாயக்கனூர் உழவர் சந்தை)</option>
                    <option>Periyakulam Uzhavar Sandai (பெரியகுளம் உழவர் சந்தை)</option>
                    <option>Sivagangai Uzhavar Sandai (சிவகங்கை உழவர் சந்தை)</option>
                    <option>Devakottai Uzhavar Sandai (தேவகோட்டை உழவர் சந்தை)</option>
                    <option>Karaikudi Uzhavar Sandai (காரைக்குடி உழவர் சந்தை)</option>
                    <option>Aruppukottai Uzhavar Sandai (அருப்புக்கோட்டை உழவர் சந்தை)</option>
                    <option>Rajapalayam Uzhavar Sandai (இராஜபாளையம் உழவர் சந்தை)</option>
                    <option>Srivilliputhur Uzhavar Sandai (ஸ்ரீவில்லிபுத்தூர் உழவர் சந்தை)</option>
                    <option>Viruthunagar Uzhavar Sandai (விருதுநகர் உழவர் சந்தை)</option>
                    <option>Sivakasi Uzhavar Sandai (சிவகாசி உழவர் சந்தை)</option>
                    <option>Sathur Uzhavar Sandai (சாத்தூர் உழவர் சந்தை)</option>
                    <option>Ramanathapuram Uzhavar Sandai (இராமநாதபுரம் உழவர் சந்தை)</option>
                    <option>Paramakudi Uzhavar Sandai (பரமக்குடி உழவர் சந்தை)</option>
                    <option>Sankarankovil Uzhavar Sandai (சங்கரன்கோவில் உழவர் சந்தை)</option>
                    <option>Palayamkottai Uzhavar Sandai (பாளையங்கோட்டை உழவர் சந்தை)</option>
                    <option>Tenkasi Uzhavar Sandai (தென்காசி உழவர் சந்தை)</option>
                    <option>Kandiyaperi Uzhavar Sandai (கண்டியபேரி உழவர் சந்தை)</option>
                    <option>Tuticorin Uzhavar Sandai (தூத்துக்குடி உழவர் சந்தை)</option>
                    <option>Kovilpatti Uzhavar Sandai (கோவில்பட்டி உழவர் சந்தை)</option>
                    <option>Vadaseri Uzhavar Sandai (வடாசேரி உழவர் சந்தை)</option>
                    <option>Myladi Uzhavar Sandai (மயிலாடி உழவர் சந்தை)</option>"""

filepath = "c:/Users/Gokulakrishnan/Documents/farmGo prototype/frontend/src/pages/Farmer/Dashboard.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """                    <option>Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)</option>
                    <option>Coimbatore MGR Market (கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை)</option>
                    <option>Madurai Mattuthavani (மதுரை மாட்டுத்தாவணி)</option>"""

if target in content:
    new_content = content.replace(target, options_block)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Success: Replaced target with all Uzhavar Sandai options!")
else:
    print("Error: Target block not found in Dashboard.tsx")
