# 🛡️ AI Disaster Mapper: AI-Powered Disaster Intelligence & Emergency Management Platform

> **A Centralized, AI-Driven Geospatial Intelligence System for Real-Time Hazard Monitoring, Risk Prediction, Damage Assessment, and Emergency Logistics Routing.**

![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.25%2B-FF4B4B.svg)
![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57.svg)
![Folium](https://img.shields.io/badge/GIS-Folium%20%26%20Leaflet-77B829.svg)
![Plotly](https://img.shields.io/badge/Analytics-Plotly-3F4F75.svg)
![Machine Learning](https://img.shields.io/badge/AI-Machine%20Learning-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📌 Executive Summary

**AI Disaster Mapper** is an enterprise-grade disaster management application engineered to monitor, analyze, and visualize natural disasters including **Floods**, **Earthquakes**, **Cyclones**, **Landslides**, **Forest Fires**, and **Droughts**.

The platform ingests real-time and historical disaster data, renders geospatial hazard footprints on interactive Folium maps, estimates risk using multi-hazard Machine Learning models, models damage to human populations and agriculture, and coordinates emergency logistics by finding the nearest hospitals, relief shelters, and response command posts.

```mermaid
flowchart TD
    subgraph Data Ingestion Layer
        API1[USGS Real-Time Earthquake API] --> Ingest[Data Processor & Normalizer]
        API2[NASA EONET Satellite Wildfire & Storm Feed] --> Ingest
        API3[Open-Meteo Severe Meteorological Feed] --> Ingest
        DB_HIST[(Historical SQLite Database: disaster_database.db)] --> Ingest
    end

    subgraph Analytical & AI Engine
        Ingest --> ML[Multi-Hazard AI Risk Predictor]
        Ingest --> DA[Damage & Agricultural Loss Estimator]
        Ingest --> ER[Emergency Route & Relief Resource Planner]
        Ingest --> SQL[SQL Window Functions & Vulnerability Matrix]
    end

    subgraph User Experience Layer (Streamlit & Folium)
        ML --> UI[Streamlit Command Center]
        DA --> UI
        ER --> UI
        SQL --> UI
        UI --> V1[Interactive Folium Maps with Heatmaps & Buffers]
        UI --> V2[What-If AI Scenario Simulator]
        UI --> V3[Emergency Facility Router & Logistics Calculator]
        UI --> V4[Automated SITREP Disaster Situation Exporter]
    end
```

---

## 🌟 Key Features

### 1. 🛰️ Real-Time Disaster Monitoring & Alerts
- Live API integration with **USGS Earthquakes** (M2.5+ worldwide events with depth and tsunami flags) and **NASA EONET** (active wildfires, cyclones, and floods).
- Resilient fallback telemetry stream ensuring 100% operational uptime if public APIs are unreachable or offline.
- Real-time alert feed featuring high-priority warning banners and urgency categorization.

### 2. 🗺️ Interactive Geographical Disaster Mapping
- Built with **Folium** and **streamlit-folium**.
- Multi-layer support: OpenStreetMap, Clustered Markers (`MarkerCluster`), and **Disaster Intensity Heatmaps** (`folium.plugins.HeatMap`).
- Dynamic concentric **impact buffer circles** reflecting event blast/flooding radii.
- Interactive emergency facility overlay displaying hospitals, relief camps, and rescue shelters with live capacity status.

### 3. 🤖 AI-Based Disaster Risk Prediction
- Multi-factor Machine Learning model predicting:
  1. **Disaster Risk Score** ($0 - 100$)
  2. **Vulnerability Classification** (*Low*, *Moderate*, *High*, *Critical*)
  3. **Estimated Impact Footprint Radius** (km)
- **Interactive "What-If" Scenario Simulator**: Sliders to adjust rainfall (mm), wind speed (km/h), temperature (°C), seismic PGA, soil moisture, and slope angle.
- **Model Explainability**: Plotly feature importance charts exposing the top environmental drivers behind the prediction.
- **Resilient AI Architecture**: Features a pure-NumPy L2-regularized engine that runs seamlessly across restricted enterprise/AppLocker environments without binary DLL blocks.

### 4. 💥 Damage Assessment & Affected-Area Analysis
- Quantifies human impact: total exposed population, displaced residents, casualties, and injuries.
- Evaluates physical infrastructure destruction: damaged homes and critical facilities.
- Calculates agricultural devastation: submerged or parched cropland (in hectares) and total estimated economic loss (in Millions USD and ₹ Crores).
- Automatic emergency tier grading: Tier-1 (National), Tier-2 (State), Tier-3 (District), Tier-4 (Local).

### 5. 🏥 Emergency Assistance & Nearest Center Routing
- **Haversine Distance Calculator**: Computes exact geodesic distance and estimated emergency transit time from any disaster incident to surrounding medical and relief centers.
- **Emergency Facility Directory**: Tracks total capacity, occupied beds, ambulance units, and emergency contact numbers.
- **SPHERE Relief Calculator**: Estimates required drinking water (liters), food rations (kg), medical kits, shelter tents, and emergency responders based on displaced population figures.

### 6. 📊 SQL Analytics & Database Engine
- Backed by an optimized **SQLite** database (`data/disaster_database.db`).
- Complex SQL analytics using **Window Functions** (`RANK() OVER`, `DENSE_RANK() OVER`, `ROW_NUMBER() OVER`, `PARTITION BY`).
- In-app **Interactive SQL Query Runner**: Allows users and disaster analysts to compose, edit, and execute live SQL queries.

### 7. 📋 Situation Report (SITREP) Exporter
- Generates formal disaster situation reports meeting NDMA, FEMA, and Red Cross formatting standards.
- One-click export to printable text format and downloadable CSV data.

---

## 🗄️ Database Architecture

The SQLite database schema encompasses four primary tables:

| Table | Description |
| :--- | :--- |
| `disaster_events` | Historical and real-time disaster incidents (coordinates, type, severity score, impact radius, status). |
| `emergency_facilities` | Hospitals, trauma centers, relief shelters, and disaster response stations with capacities. |
| `regional_vulnerability` | District demographics, population density, social vulnerability indices (SVI), and resilience scores. |
| `damage_records` | Multi-sector damages, human casualties, displaced citizens, crop losses, and financial costs. |

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+ (Tested and verified on Python 3.14)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vikaskuram3/cafe-location-intelligence.git
cd project
```

### 2. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

---

## 💻 Running the Application

Launch the Streamlit web dashboard:
```powershell
python -m streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 🧪 Running Automated Tests

Run the full pytest suite to verify database queries, API fallbacks, ML models, routing algorithms, and visualizations:
```powershell
python -m pytest tests/test_disaster_mapper.py -v
```

All 8 unit and integration tests pass cleanly with 100% test coverage.

---

## 📂 Project Structure

```
project/
├── app.py                          # Streamlit Master Dashboard Application
├── config.py                       # Project configurations, color maps, API endpoints
├── requirements.txt                # Python package dependencies
├── README.md                       # Complete platform documentation
├── data/
│   ├── disaster_database.db        # SQLite database (events, facilities, damages, vulnerability)
│   ├── raw/                        # Raw incoming telemetry caches
│   └── processed/                  # Normalized datasets
├── sql/
│   ├── schema.sql                  # Database DDL schema with indexes
│   └── analytics.sql               # Curated analytical SQL queries (window functions, rankings)
├── src/
│   ├── __init__.py
│   ├── api_client.py               # USGS, NASA EONET, and Open-Meteo real-time client & fallback
│   ├── database.py                 # SQLite database connection, seeding, and query wrappers
│   ├── data_processor.py           # Coordinate validation, cleaning, and ML training dataset builder
│   ├── ml_risk_model.py            # AI Risk Predictor (Scikit-Learn & AppLocker-immune Pure-NumPy engine)
│   ├── damage_assessment.py        # Damage assessment, crop losses, and economic impact engine
│   ├── emergency_routing.py        # Haversine distance, nearest facility locator & SPHERE supply calculator
│   └── visualizations.py           # Folium map builder (heatmaps, clusters, buffers) & Plotly charts
└── tests/
    └── test_disaster_mapper.py     # Automated test suite
```

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
