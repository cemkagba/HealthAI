HEALTH AI Platform
HEALTH AI is a secure, GDPR-compliant matchmaking platform designed to bridge the gap between healthcare professionals and engineering experts. It facilitates multidisciplinary innovation by providing a structured environment for partner discovery and secure meeting scheduling.

🚀 Key Features
Institutional Validation: Registration is strictly restricted to .edu and .edu.tr email addresses.

Role-Based Access Control (RBAC): Dedicated interfaces and permissions for Engineers, Healthcare Professionals, and Admins.

Secure Meeting Workflow: Mandatory Non-Disclosure Agreement (NDA) acceptance before proposing meeting slots.

Modernized Collaboration: Meeting requests feature interactive calendar pills, color-coded status badges, and real-time form validation.

Rich Text Integration: Post descriptions are powered by Tiptap for safe, modern, and lightweight rich text editing.

Premium UI/UX: Built with Tailwind CSS featuring glassmorphism modal backdrops, skeleton loaders, subtle micro-interactions, and Sonner toast notifications.

Admin Dashboard: Full system oversight with user suspension (guarded by confirmation modals), post moderation, visual statistics, and CSV export for audit logs.

Privacy First: Zero file uploads to protect intellectual property and ensure no patient data is stored.

🛠 Tech Stack
Frontend: React 18, Vite, Tailwind CSS, Tiptap (Rich Text), Sonner (Toasts), Lucide-React (Icons)

Backend: Node.js, Express.js

Database: PostgreSQL 16 (Hosted on Neon Serverless DB)

Deployment Architecture: Render (Backend API) & Netlify (Frontend)

📦 Installation & Setup (Local Development)
Since the database is securely hosted on Neon DB, you no longer need a local PostgreSQL instance.

1. Clone the repository:

Bash
git clone https://github.com/cemkagba/HealthAI.git
cd HealthAI
2. Environment Variables:
Create a .env file in the backend directory and add your Neon DB connection string:
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

3. Run via Docker (App Containers only):

Bash
docker compose up --build
4. Access the application:

Frontend: http://localhost:3000

Backend API: http://localhost:5000/api/health

🔑 Seed Credentials (Test Accounts)
You can use the following accounts to test the different roles in the system:

Admin: yigit@cankaya.edu.tr (Password: 1234)

Engineer: cem@cankaya.edu.tr (Password: 1234)

Healthcare: selin@hacettepe.edu.tr (Password: 1234)

🛡 Security & Audit
The system implements a comprehensive audit trail, logging every sensitive action (registration, moderation, meeting acceptance) into a tamper-resistant database table accessible only by administrators. All passwords are encrypted using bcrypt with 12 salt rounds. A custom background polling hook strictly monitors unread notification states securely without exposing unnecessary web socket connections.
