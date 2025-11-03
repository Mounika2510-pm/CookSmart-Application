# 🥘 CookSmart – Smart Recipe Builder

CookSmart is a modern **React + TypeScript** application designed to simplify the cooking experience.  
It allows users to **create, edit, organize, and cook recipes step-by-step**, with a smooth and responsive UI.

---

## 🚀 Features Implemented

### 🏠 1. **Welcome Page**
- Eye-catching animated hero screen introducing “CookSmart”.
- Full-screen cooking background with smooth fade-up text animation.
- Encourages users to explore or create recipes.

---

### 📜 2. **Recipes List Page**
- Displays all saved recipes in a clean, card-based grid layout.
- Each card shows:
  - Recipe name, difficulty, total time, and complexity score.
- Options to:
  - **Edit Recipe** – update existing recipes.
  - **Start Cooking** – navigate to the cooking flow page.
- Fully responsive layout with adaptive spacing and grid adjustments for mobile.

---

### 🧑‍🍳 3. **Recipe Builder Page**
- Lets users **create or edit recipes** interactively.
- Includes validation and intuitive UI for each section:
  - **Basic Info:** Recipe title, difficulty, derived stats (total time, ingredients, complexity).
  - **Ingredients Section:**  
    Add, delete, and list ingredients with validation for name, quantity, and unit.
  - **Steps Section:**  
    Add both *instruction* and *cooking* steps.
      - Instruction steps allow selecting ingredients.
      - Cooking steps include temperature and speed settings.
  - Built-in validation:
      - Prevents invalid entries (e.g., duration ≤ 0, empty fields).
      - Disables the **Save** button until all mandatory fields are complete.
  - Visual feedback using **Snackbar** messages.
- Fully styled with blur-glass effect, warm orange tones, and shadows.

---

### 🍳 4. **Cooking Page**
- Displays a recipe’s steps one by one with clear instructions.
- Includes **Start**, **Pause**, and **Stop** functionality for step timers.
- Smooth popup animation when the cooking screen appears.
- Layout remains consistent and clean across all devices.

---

### 💾 5. **Data Handling**
- All recipes are managed using **Redux Toolkit** for state management.
- Add, update, and fetch operations are handled globally, ensuring a consistent experience.

---

## 🧱 Tech Stack

| Tool / Library | Purpose |
|-----------------|----------|
| **React (TypeScript)** | Frontend framework |
| **Redux Toolkit** | State management |
| **Material UI (MUI)** | Components and form controls |
| **React Router DOM** | Routing between pages |
| **CSS Animations** | Page transitions and popups |
| **Vercel** | Deployment platform |

---

## 💡 Responsive Design

CookSmart is fully responsive and optimized for:
- 🖥️ Desktop  
- 💻 Laptop  
- 📱 Tablets  
- 📱 Small-screen mobile devices (like iPhone SE)

All components adjust dynamically using media queries.

---

## ⚙️ How to Run Locally

```bash
# 1️⃣ Clone the repo
git clone https://github.com/YOUR_USERNAME/cooksmart.git
cd cooksmart

# 2️⃣ Install dependencies
npm install

# 3️⃣ Run locally
npm start

# 4️⃣ Build for production
npm run build
