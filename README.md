# 🏋️‍♂️ Fitness Tracker Web App

Live at: [Fitness-Tracker](https://fitness-tracker-gamma-indol.vercel.app/)  

A secure, full-stack workout tracking platform built with **React**, **Node.js**, and **MySQL**. Users can log exercises, sets, reps, and weights—complete with authentication, personalized history, and robust backend validation.

---

## 🛠️ Tech Stack

| Layer        | Technologies                            |
|--------------|------------------------------------------|
| **Frontend** | React, TailwindCSS                      |
| **Backend**  | Node.js, Express (RESTful API)          |
| **Database** | MySQL with normalized schema       |
| **Auth**     | JWT-based sessions, bcrypt password hashing |
| **Security** | Token-protected routes, CORS configured |

---

## 🚀 Core Features

- 🔐 **User Auth:** Secure registration and login with hashed credentials  
- 📅 **Workout Logging:** Track workouts by date  
- 🏋️ **Exercise Management:** Add/remove exercises with set, rep, and weight tracking  
- 📈 **History View:** View personalized workout logs  
- 🧹 **Data Isolation:** Each user accesses only their own data  

---

## ✨ Highlights

- **JWT Authentication:** Stateless sessions with bcrypt-secured passwords  
- **RESTful API Design:** Modular, well-documented endpoints  
- **Relational Data Modeling:** MySQL schema with foreign key constraints  
- **Middleware Security:** Route protection via token verification  
- **CRUD Support:** Full create/read/delete for workouts and exercises  
- **Reusable Exercise Library:** Avoids duplication across sessions  
- **Robust Error Handling:** Descriptive messages and HTTP status codes  
- **CORS Configuration:** Seamless frontend-backend integration  

---

