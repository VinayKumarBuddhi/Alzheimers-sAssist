# 🧠 Alzheimer’s Assist

Welcome to **Alzheimer’s Assist** – an innovative, AI-powered platform designed to support individuals with Alzheimer’s and their families. This project combines facial recognition, emergency contact management, and a user-friendly dashboard to provide safety, connection, and peace of mind.

---

## 🌟 Project Concept
Alzheimer’s Assist is built to help caregivers and families:
- **Identify and authenticate users** using advanced face recognition technology.
- **Store and manage emergency contacts** for quick access in critical situations.
- **Provide a secure dashboard** for users and family members to manage profiles and information.

The platform leverages modern web technologies and machine learning to create a seamless, secure, and supportive experience for those affected by Alzheimer’s.

---

## 🚀 Features
- **Face Login & Registration:** Users can register and log in using facial recognition, powered by Python and dlib.
- **Emergency Contact Management:** Store, update, and access emergency contacts easily.
- **Family Member Profiles:** Add and manage family members for quick identification and support.
- **Secure Authentication:** JWT-based authentication for all users.
- **Modern UI:** Built with React and Tailwind CSS for a clean, accessible interface.
- **Python Integration:** Backend uses Python scripts for face embedding and comparison.

---

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express, MongoDB, JWT
- **Face Recognition:** Python, dlib, custom scripts

---

## ☁️ Deployment (Azure PaaS)
- Deployed on **Microsoft Azure App Service (PaaS)** as a single application.
- **Backend + Frontend together:** The Node.js/Express backend hosts the API and serves the built React frontend (static files) from the same App Service.
- **Configuration:** Environment variables for secrets and runtime settings.
- **CI/CD:** Automated builds and deployments via GitHub Actions.

---

## 📂 Project Structure
```
Alzheimer’sAssist/
  ├── backend/    # Node.js/Express API, face recognition integration
  └── frontend/   # React web app
```

---

## 📖 Documentation
- [Backend README](./backend/README.md) – API routes, setup, and face recognition details
- [Frontend README](./frontend/README.md) – UI, components, and usage

---

## 🧩 How It Works
1. **User Registration:**
   - Register with details and a face scan.
   - Face embedding is generated and stored securely.
2. **Login:**
   - Login with username/password or face scan.
   - Face login matches the scan against all registered users.
3. **Dashboard:**
   - Access and manage your profile, family members, and emergency contacts.
4. **Emergency Support:**
   - Quick access to emergency contacts for caregivers and users.

---

## 💡 Why Alzheimer’s Assist?
Alzheimer’s Assist is more than just an app – it’s a lifeline for families. By combining AI, security, and thoughtful design, we aim to empower those living with Alzheimer’s and their loved ones.

---

## 🧑‍💻 What I Did
- **Architected the system:** Designed the full-stack layout across frontend, backend, and ML components.
- **Implemented backend APIs:** Built Express routes for authentication, family member management, and face operations.
- **Integrated face recognition:** Wrote Python scripts (dlib) for embedding and comparison, and wired them to Node.js.
- **Added secure auth:** Implemented JWT-based authentication and middleware protections.
- **Developed the frontend:** Crafted React pages and components with Tailwind CSS for a clean UX.
- **Set up deployment:** Deployed a single Azure App Service hosting the Node.js backend and serving the React build via Express; wired CI/CD with GitHub Actions.

---

## 🤝 Contributing
We welcome contributions! Please see the backend and frontend READMEs for setup instructions and guidelines.

---

## 📬 Get in Touch
For questions, suggestions, or support, please open an issue or contact the maintainers.

---

> “Technology, when used with empathy, can change lives.” 