🌾 FarmGo — Connects Farmer ,Buyer,Transporter,FPO with AI

«Smart India Hackathon 2026 | Problem Statement: SIH26132
Strengthening Market Linkages and Price Discovery for Farmers»

FarmGo is an AI-powered agricultural platform designed to connect farmers, FPOs, buyers, and transporters through a single integrated digital ecosystem.

The platform helps farmers make better selling decisions by providing market price insights, demand information, buyer connections, crop listings, bidding, and intelligent logistics recommendations.

---

🚜 Problem

Small and marginal farmers often face several challenges after producing their crops:

- ❌ Limited awareness of prices in nearby markets
- ❌ Difficulty finding verified buyers
- ❌ Lack of information about market demand
- ❌ Difficulty finding suitable transportation
- ❌ Dependence on intermediaries
- ❌ Post-harvest losses due to delayed transportation
- ❌ Limited access to data-driven selling decisions

These challenges can reduce farmer profitability and create inefficiencies throughout the agricultural supply chain.

---

💡 Our Solution

FarmGo brings the major participants of the agricultural supply chain onto one platform.

👨‍🌾 Farmer

Farmers can:

- List available crops
- Specify quantity and expected price
- View market price information
- Discover potential buyers
- Receive buyer bids
- Compare selling opportunities
- Find suitable transportation
- Track their crop transactions

🏢 Buyer

Buyers can:

- Discover available crops
- Search based on crop and quantity
- Place bids
- Connect with farmers/FPOs
- Compare available supplies
- Coordinate transportation

🚚 Transporter

Transporters can:

- View transportation requirements
- Find crop transportation opportunities
- Provide transport details
- Connect farmers and buyers
- Support efficient movement of agricultural produce

---

🤖 AI-Powered Features

FarmGo uses AI and data-driven techniques to support agricultural decision-making.

📊 Crop Price Forecasting

FarmGo analyzes historical and market data to estimate future crop prices.

Example:

Crop: Tomato
Current Price: ₹2,800 / Quintal

Forecast:
Next 7 Days → ₹3,050 / Quintal

Recommendation:
Monitor nearby markets and compare buyer offers.

«Forecasts are intended as decision-support information and may vary based on real-world market conditions.»

🧠 Intelligent Market Analysis

FarmGo can analyze:

- Current prices
- Historical prices
- Market arrivals
- Demand
- Nearby markets
- Available buyers

This helps identify potentially better selling opportunities.

🚚 Smart Logistics Matching

After a farmer and buyer are matched, FarmGo can help identify suitable transportation options based on:

- Pickup location
- Delivery location
- Crop quantity
- Transport availability
- Route requirements

---

🔄 FarmGo Workflow

             ┌───────────────┐
             │    Farmer     │
             └───────┬───────┘
                     │
                     ▼
              List Crop / Supply
                     │
                     ▼
          ┌─────────────────────┐
          │       FarmGo        │
          │  Market Intelligence│
          └──────────┬──────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      Prices      Demand      Markets
          │          │          │
          └──────────┼──────────┘
                     ▼
              Buyer Matching
                     │
                     ▼
              Buyer Bidding
                     │
                     ▼
             Farmer + Buyer
                  Match
                     │
                     ▼
             Transport Matching
                     │
                     ▼
             🚚 Crop Delivery

---

🏗️ System Architecture

                 ┌──────────────────────┐
                 │      FarmGo App      │
                 │   React + TypeScript │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │      FastAPI         │
                 │      Backend         │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       PostgreSQL       AI/ML Models     REST APIs
             │              │              │
             │              ▼              │
             │       Price Forecasting     │
             │       Market Analysis       │
             │       AI Assistant          │
             │                             │
             └──────────────┬──────────────┘
                            ▼
                 Agricultural Data Sources

---

🛠️ Technology Stack

Layer| Technology
Frontend| React.js, TypeScript
UI| Tailwind CSS
Backend| Python, FastAPI
Database| PostgreSQL
AI Assistant| Multilingual LLM, NLLB
Machine Learning| Python, XGBoost, Scikit-learn
Market Data| AGMARKNET, e-NAM, Government OGD
Maps| Leaflet, OpenStreetMap
APIs| REST APIs
Version Control| Git & GitHub
Deployment| AWS

---

📁 Project Structure

farmgo/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── main.py
│
├── ml/
│   ├── datasets/
│   ├── preprocessing/
│   ├── models/
│   └── forecasting/
│
├── docs/
│   ├── architecture/
│   └── screenshots/
│
├── requirements.txt
├── package.json
└── README.md

«The exact structure may vary depending on the current implementation in the repository.»

---

📈 Price Forecasting Pipeline

Historical Market Data
          │
          ▼
     Data Cleaning
          │
          ▼
     Feature Engineering
          │
          ▼
   Train ML Model
          │
          ▼
     XGBoost / ML Model
          │
          ▼
     Price Prediction
          │
          ▼
 Farmer-Facing Insight

Example Input

{
  "crop": "Tomato",
  "market": "Dindigul",
  "quantity": 500,
  "date": "2026-09-24"
}

Example Output

{
  "crop": "Tomato",
  "market": "Dindigul",
  "current_price": 2800,
  "forecast_price": 3050,
  "forecast_period": "7 days"
}

---

🌐 Data Sources

FarmGo is designed to use agricultural and government data sources such as:

- AGMARKNET
- e-NAM
- Government Open Data
- Historical market price datasets
- Market arrival information
- Demand-related data
- Location and mapping data

Data availability depends on the APIs and datasets accessible during deployment.

---

🌍 Multilingual AI

FarmGo is designed to support communication between users who may prefer different languages.

The AI layer can be extended for:

- 🇬🇧 English
- 🇮🇳 Tamil
- Other Indian languages

This helps make agricultural technology more accessible to users who may not be comfortable using English-only interfaces.

---

🔐 Security & Privacy

The production version of FarmGo should implement:

- Secure authentication
- Role-based authorization
- Password hashing
- API authentication
- Input validation
- Secure database access
- HTTPS
- Environment variables for secrets
- Protection against unauthorized API access

Never commit API keys, passwords, database credentials, or ".env" files to GitHub.

---

☁️ Deployment

FarmGo can be deployed using a cloud architecture such as:

                    GitHub
                       │
                       ▼
              ┌────────────────┐
              │      AWS       │
              └───────┬────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     Frontend                 Backend
          │                       │
          ▼                       ▼
     React App                 FastAPI
                                  │
                                  ▼
                              PostgreSQL

---

🚀 Getting Started

1. Clone the repository

git clone https://github.com/gokulakrishnan28/farmgo-prototype.git

cd farmgo-prototype

2. Install frontend dependencies

npm install

3. Start the frontend

npm run dev

4. Setup backend

Create a Python virtual environment:

python -m venv venv

Activate it:

Windows

venv\Scripts\activate

Linux / macOS

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run FastAPI:

uvicorn main:app --reload

---

🔑 Environment Variables

Create a ".env" file:

DATABASE_URL=your_database_url
API_KEY=your_api_key
MODEL_API_KEY=your_model_api_key

Do not upload ".env" to GitHub.

Add it to ".gitignore":

.env
venv/
__pycache__/
node_modules/

---

🎯 SIH 2026 Alignment

Problem Statement

SIH26132 – Strengthening market linkages and price discovery for farmers

FarmGo addresses the problem through:

Challenge| FarmGo Approach
Poor price visibility| Market price information
Limited buyer access| Digital buyer discovery
Price uncertainty| AI-based price forecasting
Market comparison difficulty| Multi-market analysis
Transportation issues| Transporter matching
Supply-demand mismatch| Market and demand insights
Language barriers| Multilingual AI
Fragmented ecosystem| Farmer + Buyer + Transporter platform

---

💡 Innovation

FarmGo combines multiple agricultural workflows into one platform instead of treating them as separate systems.

Core Innovation

Price Intelligence
        +
Buyer Discovery
        +
Bidding
        +
Supply Matching
        +
Transport Matching
        +
Multilingual AI
        ↓
     FARMGO

The goal is to connect price discovery → selling opportunity → buyer → logistics within a single workflow.

---

📱 Prototype

🌐 Live Prototype

FarmGo Web Application

https://main.d2atxcd6av0vmq.amplifyapp.com/

🎥 Demonstration Video

https://youtu.be/eITF4_hnWu4

💻 GitHub Repository

https://github.com/gokulakrishnan28/farmgo-prototype

---

🖼️ Screenshots

Add screenshots of the following modules:

📱 Farmer Dashboard
📊 Market Price Dashboard
🤖 AI Price Forecast
🛒 Buyer Portal
🚚 Transporter Portal
🤝 Buyer-Farmer Matching
📈 Market Analytics
🗺️ Location & Transport

Example:

![FarmGo Dashboard](docs/screenshots/dashboard.png)

---

👥 Team

Team Name: FarmGo


🏆 Smart India Hackathon 2026

FarmGo is developed as a prototype for Smart India Hackathon 2026 with the objective of improving agricultural market connectivity and helping farmers make more informed selling decisions.

Problem Statement: SIH26132
Domain: Agriculture / Rural Development
Project: FarmGo

---

🔮 Future Scope

Future versions of FarmGo can include:

- 📍 Real-time mandi price updates
- 🤖 Advanced crop price forecasting
- 🌦️ Weather-aware price prediction
- 🧑‍🌾 Personalized farmer recommendations
- 🏦 Digital financing integration
- 📦 Warehouse and cold-storage discovery
- 🚚 Real-time vehicle tracking
- 🗣️ Voice-based agricultural assistant
- 🌐 More Indian languages
- 📊 Advanced supply-demand forecasting
- 🔗 Blockchain-based supply-chain traceability
- 📱 Dedicated Android application

---

🤝 Contribution

Contributions are welcome.

git checkout -b feature/new-feature

Make your changes, commit them, and create a pull request.

---

📄 License

This project is currently developed as a Smart India Hackathon 2026 prototype.

Add an appropriate open-source license before accepting external contributions.

---

🌾 FarmGo

Connecting Farmers. Markets. Buyers. Transporters.

From crop production to market connection — FarmGo aims to make the agricultural supply chain smarter, more connected, and data-driven.
