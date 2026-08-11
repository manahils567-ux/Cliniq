# Medi-Vault: Secure Medical Record Management System

Medi-Vault is a comprehensive and secure application designed to manage medical records, set reminders, interact with an AI chatbot for health queries, and facilitate easy sharing of medical information. It supports multiple languages and ensures data privacy through robust encryption and authentication mechanisms.

## ✨ Features

*   **User Authentication:** Secure registration and login for patients and healthcare providers.
*   **Medical Record Management:** Upload, view, and manage medical documents (PDFs, images).
*   **Encrypted Storage:** Medical records are encrypted to ensure patient data confidentiality.
*   **Reminders:** Set and receive notifications for appointments, medication, etc.
*   **AI Chatbot:** Integrated Gemini-powered chatbot for health-related queries and assistance.
*   **Multi-language Support:** Frontend and backend support for multiple languages (English, Hindi, Tamil, Kannada).
*   **Secure Sharing:** Generate QR codes for time-limited, secure sharing of medical records.
*   **Contact Form:** Allow users to send inquiries or feedback.
*   **Cloudinary Integration:** For efficient storage and delivery of uploaded files.
*   **Google Translate API:** For dynamic content translation.

## 🛠️ Tech Stack

*   **Frontend:**
    *   React
    *   Tailwind CSS
    *   Axios (for API calls)
    *   i18next (for internationalization)
    *   React Router
    *   Headless UI, Heroicons
*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB (with Mongoose)
    *   JSON Web Tokens (JWT) for authentication
    *   bcryptjs (for password hashing)
    *   Crypto-JS (for data encryption)
    *   Firebase Admin SDK (potentially for auth or other services)
    *   Cloudinary API
    *   Google Generative AI (Gemini API)
    *   Google Translate API
    *   Nodemailer (implied by email config, for sending emails)
*   **Database:**
    *   MongoDB Atlas (or any MongoDB instance)

## 📂 Project Structure
medi-vault/ ├── client/ # React Frontend Application │ ├── public/ │ ├── src/ │ │ ├── components/ │ │ ├── context/ │ │ ├── locales/ │ │ ├── pages/ │ │ └── utils/ │ ├── package.json │ └── ... ├── server/ # Node.js Backend Application │ ├── controllers/ │ ├── middleware/ │ ├── models/ │ ├── routes/ │ ├── locales/ │ ├── uploads/ # (Potentially .gitignored) │ ├── package.json │ ├── server.js │ └── .env # (Gitignored - Environment variables) ├── deployment-guide.md ├── deploy.sh └── README.md


##  Prerequisites

*   Node.js (v18.x or higher recommended)
*   npm (v8.x or higher) or yarn
*   Git
*   MongoDB instance (local or cloud-hosted like MongoDB Atlas)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/medi-vault.git
cd medi-vault

2. Backend Setup
cd server
npm install
Create a .env file in the server directory and add the following environment variables. Replace placeholder values with your actual credentials and keys.

# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.mongodb.net/<your_database_name>

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_key

# Encryption Configuration
ENCRYPTION_KEY=your_strong_encryption_key_32_bytes

# Firebase Configuration (Update with your actual Firebase service account details)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email@your_project_id.iam.gserviceaccount.com

# QR Code Configuration
QR_CODE_EXPIRY=24h

# Email Configuration (e.g., for Nodemailer using Gmail)
EMAIL_USER=your_email_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud Configuration
GOOGLE_PROJECT_ID=your_google_cloud_project_id_for_translate
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the backend server:

npm run dev # For development with nodemon
# OR
npm start   # For production

The backend server will typically run on http://localhost:5000.

3. Frontend Setup
Open a new terminal:

cd client
npm install
Create a .env file in the client directory:

REACT_APP_API_URL=http://localhost:5000

(If your backend API routes are prefixed, e.g., /api, use REACT_APP_API_URL=http://localhost:5000/api)

Start the frontend development server:

npm start

The frontend will typically run on http://localhost:3000 and open automatically in your browser.

☁️ Deployment
This project is configured for deployment on platforms like Vercel (for frontend) and Render (for backend).

Frontend (Vercel)
Push your code to a GitHub repository.
Sign up/Log in to Vercel.
Import your project from GitHub.
Configuration:
Framework Preset: Create React App (or React).
Root Directory: client
Build Command: npm run build (or yarn build)
Output Directory: build (relative to the Root Directory, so build)
Install Command: npm install --legacy-peer-deps (to resolve potential peer dependency issues)
Environment Variables on Vercel:
REACT_APP_API_URL: Set this to the URL of your deployed backend (e.g., https://your-backend-name.onrender.com).
Backend (Render)
Push your code to a GitHub repository.
Sign up/Log in to Render.
Create a new "Web Service".
Connect your GitHub repository.
Configuration:
Name: e.g., medi-vault-api
Region: Choose a suitable region.
Branch: main (or your primary branch).
Root Directory: server
Environment: Node
Build Command: npm install (or yarn install)
Start Command: npm start
Environment Variables on Render:
Add all the environment variables defined in your .env file to Render's environment variable settings for the service. Ensure NODE_ENV is set to production.
Important for CORS: Ensure your backend's CORS configuration allows requests from your Vercel frontend domain. You might need to set a CORS_ORIGIN environment variable if your server.js uses it, or configure the cors middleware directly with your frontend's URL.
Refer to the deployment-guide.md for more detailed steps and alternative deployment options.

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature-name).
Make your changes.
Commit your changes (git commit -m 'Add some feature').
Push to the branch (git push origin feature/your-feature-name).
Open a Pull Request.
📄 License
This project is currently unlicensed. Consider adding an MIT License or another open-source license if you wish to share it widely.

This README was generated with assistance from an AI coding assistant.
