# 🏛️ Samadhan - Your Civic Companion

**Samadhan** is a modern civic engagement platform designed to bridge the gap between citizens and local administration. It empowers users to report civic issues, access government schemes, and get instant assistance via an AI-powered voice assistant.

---

## 🚀 Key Features

### 📢 Issue Reporting System
* **Categorized Reporting:** Report issues like Water, Electricity, Roads, Sanitation, Parks, and Buildings.
* **AI Image Recognition:** Upload photos to auto-detect the issue type and severity level.
* **Voice-to-Text Description:** Record issue descriptions using the integrated Voice Assistant.
* **Location Tagging:** Automatically captures address and coordinates for accurate mapping.

### 📊 Community Dashboard
* **Real-time Feed:** View issues reported by the community instantly (powered by Supabase Realtime).
* **Support System:** Upvote and support issues to highlight urgency.
* **Status Tracking:** Track issues from "Reported" to "Resolved".

### 🛡️ Administrative Control Panel (RBAC & Real-time Scoping)
* **Super Admin Dashboard:** Monitor all departments system-wide, filter issues dynamically, and delete invalid grievances.
* **Department Admin Dashboards:** Dedicated views for Water, Sanitation, Electricity, Roads, Parks, and Buildings.
* **Real-time Scoping:** Department admins receive live toast notifications and list updates **only** for grievances belonging to their category.

### 👤 Citizen Profile Page
* **Information Updates:** Edit and persist contact details (Full Name, Phone, Address, City, State, Pincode).
* **My Issues Tracker:** A dual-list system showing:
  1. **Reported Issues:** Grievances directly filed by the citizen.
  2. **Supported Issues:** Grievances reported by others that the citizen has upvoted/supported.
* **Notification Preferences:** Toggles for Email, SMS, and Push alerts for issue updates and weekly summaries.

### 🤖 Samadhan AI Assistant & value-add Services
* **24/7 Chatbot:** Powered by Google Gemini 1.5 Flash.
* **Multilingual:** Fully supports Hindi & English.
* **Form Analyzer:** Upload complex government forms to receive step-by-step guidance and audio explanations.
* **Document Locker:** Securely store IDs and certificates for application attachment.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React + Vite
* **Language:** TypeScript
* **Styling:** Vanilla CSS & shadcn/ui

### **Backend & BaaS**
* **Platform:** Supabase (BaaS)
* **Database:** PostgreSQL with Row Level Security (RLS)
* **Auth:** Supabase Auth (Email/Password)
* **Realtime:** Supabase Realtime (WebSockets)

### **Orchestration Service**
* **Framework:** FastAPI (Python)
* **AI Model:** Google Gemini API / Google AI Studio

---

## ⚡ Getting Started

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* A [Supabase](https://supabase.com/) project
* A [Google AI Studio](https://aistudio.google.com/) API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kanishq09/your-civic-companion.git
   cd your-civic-companion
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Python Orchestrator Setup**
   ```bash
   cd orchestration
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

---

## 🛡️ Database Seeding (Testing Admins)

To seed mock administrative accounts for local development and testing:

1. Open [supabase/migrations/20260616160000_admin_mock_seed.sql](file:///c:/Users/Asus/Downloads/samadhan-AiForBharat/supabase/migrations/20260616160000_admin_mock_seed.sql) and copy the script.
2. Go to your **Supabase Dashboard** -> **SQL Editor**.
3. Create a **New Query**, paste the script, and click **Run**.

This will seed the following testing accounts:
* **Super Admin**: `admin@samadhan.gov.in` (Password: `Samadhan@Admin2024!`)
* **Roads Admin**: `roads@samadhan.gov.in` (Password: `Samadhan@Roads2024!`)
* **Water Admin**: `water@samadhan.gov.in` (Password: `Samadhan@Water2024!`)
* *(And separate accounts for sanitation, electricity, parks, and buildings)*

---

## 🤝 Contributing
Contributions are welcome! Please run the linter before submitting PRs:
```bash
npm run lint
```

## 📄 License
This project is licensed under the MIT License.
