

```markdown
# 🎓 AlumniWeb

A full-stack web app to connect alumni with students for mentorship, job referrals, and networking.

---

## ✅ Features
- 👥 Alumni Profiles with job role, company & achievements  
- 🧑‍🏫 Mentorship & Guidance sessions (Q&A, Webinars)  
- 💼 Job & Internship Listings (via alumni)  
- 📅 Event Management (Meetups, Lectures, etc.)  
- 🔒 Firebase Authentication with Google OAuth  
- 💬 Alumni-Student Messaging System  

---

## 🧰 Tech Stack
- **Frontend**: React + TypeScript  
- **Backend**: Node.js + Express.js  
- **Database**: MongoDB  
- **Authentication**: Firebase Authentication  
- **Hosting**: Vercel / Render / Netlify  

---

## 📁 Folder Structure

```

AlumniWeb/
│
├── client/            --> React Frontend
├── server/            --> Express Backend
├── README.md          --> Project Readme
└── .env               --> Environment Variables (not committed)

````

---

## 🔐 Environment Setup

1. Create a `.env` file inside the `server/` folder.  
2. Add the following (replace with your actual values):  

```env
MONGO_URI=your_mongodb_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
````

❗ **Do NOT commit `.env` or Firebase JSON files to GitHub.** Use `.gitignore`.

---

## ▶️ How to Run the App (Windows)

### 🖼️ Frontend Setup

```powershell
cd client
npm install
npm start
```

### 🔙 Backend Setup

```powershell
cd server
npm install
npm run dev
```

---

## 🚀 Git Commands (Windows Terminal / VS Code)

### 📌 Initial Setup

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/22FE1A6146/AlumniWeb.git
git push -u origin main
```

### ⚠️ Remove Firebase Secrets from Git

If you accidentally committed secrets:

```powershell
git filter-repo --path server/firebase-adminsdk.json --invert-paths
```

> If `git filter-repo` isn't installed, install it via:

```powershell
pip install git-filter-repo
```

---

## 🧑‍💻 Contributing Steps

1. Fork this repo
2. Clone your fork
3. Create a new branch:

```powershell
git checkout -b feature-name
```

4. Commit changes:

```powershell
git add .
git commit -m "Added new feature"
```

5. Push branch and create a PR:

```powershell
git push origin feature-name
```

---

## 📄 License

This project is under the [MIT License](LICENSE).

---

## 🙋‍♀️ Author

**Vaishnavi Vuppala**
🔗 GitHub: [@22FE1A6146](https://github.com/22FE1A6146)
🔗 LinkedIn: [vaishnavi-vuppala-54a801304](https://www.linkedin.com/in/vaishnavi-vuppala-54a801304)

