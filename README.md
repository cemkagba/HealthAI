# 🐳 SENG 384 - Dockerized Person Management System

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

> A full-stack, containerized web application built for the **SENG 384** course assignment at Çankaya University.

## 👨‍💻 Student Information
* **Name:** Semih Utku Canverdi
* **Student ID:** 202328013

---

## ✨ Features
* **Full-Stack CRUD:** Add, Read, Update, and Delete person records seamlessly.
* **Modern Frontend:** Built with React and React Router for a snappy, two-page UI experience.
* **Robust Backend:** Node.js/Express REST API handling database operations safely.
* **Automated Database:** PostgreSQL database automatically initializes with a seed schema (`init.sql`).
* **One-Command Setup:** The entire infrastructure is orchestrated via Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Docker](https://www.docker.com/get-started) and **Docker Compose** installed on your machine.

### Installation & Run
1. Clone this repository or extract the project folder.
2. Open your terminal in the root directory (where the `docker-compose.yml` file is located).
3. Execute the following command to build the images and spin up the containers:
   ```bash
   docker compose up --build