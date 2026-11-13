
# 🩸 PulseLink – AI-Powered Blood Donor Finder

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?logo=springboot)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)
![AI](https://img.shields.io/badge/AI-Powered-8A2BE2)
![Ollama](https://img.shields.io/badge/Ollama-LLM-black)
![License](https://img.shields.io/badge/Status-Prototype-blue)

## 📌 Project Overview

**PulseLink** is an AI-powered blood donor finder application designed to simplify and accelerate the process of finding suitable blood donors during medical emergencies.

The application connects blood requesters with eligible and available donors through intelligent matching based on blood group, geographical location, donor availability, and eligibility criteria.

By integrating **Java, Spring Boot, React.js, MySQL, and Large Language Models (LLMs)**, PulseLink aims to provide an efficient, intelligent, and user-friendly digital blood donation platform.

## 🎯 Project Objectives

- Reduce the time required to find suitable blood donors.
- Automate donor identification and matching.
- Improve donor-requester connectivity.
- Maintain donor privacy and confidentiality.
- Support donor eligibility screening through AI.
- Simplify blood request management.

## ✨ Key Features

### 👤 Donor Management
- Donor registration and profile management.
- Blood group and location information.
- Manage donor availability status.
- Track previous donation dates.
- Maintain donor eligibility information.

### 🏥 Blood Request Management
- Create and submit blood requests.
- Specify required blood group and units.
- Provide hospital and location details.
- Track blood request status.
- Manage donor responses.

### 🤖 AI-Powered Donor Matching
- Automatically identify suitable donors.
- Match based on blood group compatibility.
- Location-based donor filtering.
- Consider donor availability and eligibility.
- Intelligent donor ranking and recommendations.

### 🔐 Privacy and Communication
- Donor contact information is protected.
- Requester and donor details are shared only after donor acceptance.
- Donor acceptance and rejection workflow.

### 🧠 AI-Based Eligibility Screening
- Integrated Ollama with Qwen LLM.
- AI-assisted donor screening.
- Evaluate eligibility-related information.
- Support the donor verification workflow.

*AI screening is intended as decision support and does not replace professional medical eligibility assessment.*

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Java 21 | Backend programming |
| Spring Boot | Backend application development |
| Spring Data JPA | Database operations |
| Hibernate | ORM |
| MySQL | Relational database |
| React.js | Frontend development |
| JavaScript | Frontend logic |
| HTML5 & CSS3 | UI development |
| REST APIs | Frontend-backend communication |
| Ollama | Local LLM integration |
| Qwen LLM | AI-assisted donor screening |
| Maven | Dependency management |
| Git & GitHub | Version control |

## 🏗️ System Architecture

```text
          USER
           |
     React.js Frontend
           |
        REST APIs
           |
    Spring Boot Backend
           |
    -------------------
    |        |        |
 Donor    Request   Matching
 Service  Service   Service
    |        |        |
    -------------------
           |
        MySQL DB
           |
    AI Eligibility
       Screening
           |
     Ollama + Qwen
```

## 🔄 Application Workflow

1. Donor or requester provides the required registration information.
2. User accesses the application.
3. Requester submits a blood request.
4. Backend processes the request.
5. Matching logic identifies suitable donors.
6. AI-assisted screening supports eligibility verification.
7. Suitable donors are ranked and recommended.
8. Requester selects a donor and sends a request.
9. Donor accepts or rejects the request.
10. Necessary contact information is shared after acceptance.

## 🩸 Donor Matching Criteria

| Criteria | Description |
|---|---|
| Blood Group | Blood group compatibility |
| Location | City-based donor matching |
| Availability | Active and available donors |
| Eligibility | Donation-related eligibility information |
| Ranking | Suitable donor prioritization |

## 📂 Project Structure

```text
Pulse_Link/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/example/demo/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── repository/
│   │       │       ├── entity/
│   │       │       └── PulseLinkApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md
```

*Note: Adjust the folder names above to match your actual repository structure.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

- Java JDK 21
- Node.js and npm
- MySQL Server
- Maven
- Git
- Ollama (for local LLM integration)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Pulse_Link.git
```

```bash
cd Pulse_Link
```

### 2. Backend Setup

Open the backend project in Spring Tool Suite (STS) or your preferred Java IDE.

Configure MySQL in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blood_donor_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Create the database:

```sql
CREATE DATABASE blood_donor_db;
```

Run the Spring Boot application.

Backend URL:

```text
http://localhost:8080
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

### 4. AI Integration Setup

Install and start Ollama.

Download the Qwen model configured in your application:

```bash
ollama pull qwen2.5:3b
```

Start Ollama:

```bash
ollama serve
```

*Ensure that the model name and configuration match your backend integration.*

## 🔌 API Functionality

The backend provides REST API operations for:

- Donor registration and retrieval.
- Donor profile updates.
- Donor availability management.
- Blood request creation.
- Blood request retrieval and tracking.
- Donor matching and ranking.
- Donor response management.

## 🚀 Future Enhancements

- Complete role-based authentication and authorization.
- Real-time donor notifications.
- GPS-based nearby donor identification.
- Admin dashboard and donor verification.
- Advanced AI-based donor recommendations.
- Cloud deployment and production database integration.
- Automated email and SMS notifications.

## 💡 Project Highlights

- Full-stack application development.
- RESTful API development using Spring Boot.
- Database design and integration using MySQL.
- Intelligent donor matching and ranking algorithms.
- AI integration using Ollama and Qwen LLM.
- Privacy-focused donor-requester communication.
- Practical application of Java and React.js.

## 👨‍💻 Developer

**Ranjith Kumar**

BE Computer Science and Engineering | 2025 Graduate

Interested in Java Development, Full Stack Development, Backend Engineering, and AI-powered applications.

## ⭐ Support

If you find this project interesting, consider giving this repository a ⭐ on GitHub.

---

**PulseLink – Connecting Donors, Saving Lives. 🩸**
