# 🎓 T-Square LMS - Frontend

Welcome to the **T-Square** Learning Management System frontend repository. This project is built using **React** and integrates with a **Laravel API** to provide a seamless educational experience.

---

## 🚀 Team Collaboration
This project is currently being developed by a team of 3 frontend developers. 
- **Lead Developer:** Adel
- **Project Goal:** Build a scalable, multi-language LMS platform.

---

## 🛠 Tech Stack
- **Framework:** React.js
- **State Management:** (e.g., Redux Toolkit / Context API)
- **Styling:** CSS / (e.g., Tailwind or Bootstrap)
- **API Communication:** Axios
- **Icons & UI:** Custom oval-shaped UI components & feature wrappers.

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **NPM** or **Yarn**

---

## ⚙️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Dolla464/T-square_front.git
   cd t-square-lms-front

2. **Install dependencies:**
   ```bash
   npm install

3. **Environment Variables:**
   Copy the .env.example file to .env and fill in the required keys:
   ```bash
   cp .env.example .env
   Make sure to set the VITE_API_BASE_URL to point to your local Laravel server.
4. **Run the development server:**
   ```bash
   npm run dev

📁 Project Structure
   * src/components: Reusable UI components (like the feature-icon-wrapper).
   * src/pages: Main application views.
   * src/services: API integration and services.
   * src/assets: Images, icons, and global styles.

🛡 CI/CD & Standards
   * Linting: We use ESLint to keep the code clean. Please run npm run lint before pushing your code.
   * Git Flow: Please create a new branch for every feature (e.g., feature/login-page) and open a Pull Request for review.

📄 License
This project is private and belongs to the T-Square development team.
