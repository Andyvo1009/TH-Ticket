
# 🎫 TicketHub
**Your gateway to seamless events and unforgettable experiences.**

TicketHub is a high-performance ticket booking platform designed to streamline event discovery, seat reservation, and secure transactions.

---

## 🏗️ System Architecture

<img width="1417" height="735" alt="image" src="https://github.com/user-attachments/assets/6882d98c-dfd1-4cc1-9f9d-f9d169e67457" />

This project utilizes a robust multi-tier architecture hosted on **Amazon Web Services (AWS)**. It is designed for modularity and scalability, leveraging **Docker** for consistent containerization across all environments.

### 🎨 Frontend
* **Framework:** React
* **Language:** TypeScript
* **Description:** A modern, type-safe Single Page Application (SPA) that manages the user interface and client-side state. It communicates with the backend services via a structured **REST API**.

---

### 🌐 Web & Application Tier
The backend ecosystem is hosted on an **AWS EC2** instance, with all services orchestrated using **Docker containers**.

* **Reverse Proxy (Nginx):** Acts as the entry point for all incoming traffic. It handles SSL termination, manages static assets, and forwards requests to the application server.
* **WSGI Server (Gunicorn):** A production-grade interface between Nginx and the Flask application, managing multiple worker processes to handle concurrent booking requests.
* **Core Logic (Flask):** A modular Python backend structured into domain-specific services:
    * **User Service:** Manages authentication, authorization, and user profiles.
    * **Booking & Event Services:** Handles the core logic for event listings and real-time seat reservations.
    * **Payment Service:** Orchestrates secure transaction processing and payment gateway integration.
    * **Admin Service:** Provides internal tools for event management and system-wide monitoring.

---

### 💾 Data & Cloud Services
* **Relational Database (PostgreSQL):** A containerized database used for structured data storage, ensuring ACID compliance for ticket inventory and user records.
* **Cache (Redis):** An in-memory data store used to optimize performance for session management and "hot" data like real-time ticket availability.
* **Object Storage (Amazon S3):** Provides durable, scalable storage for unstructured assets such as event posters, digital tickets, and user uploads.

---

### 🚀 Key Technical Highlights
* **Container-First:** The entire stack is dockerized, ensuring a consistent "it works on my machine" experience from local development to production.
* **Service-Oriented Design:** Distinct logic layers ensure the codebase remains maintainable and can be scaled independently as the platform grows.
* **Optimized Performance:** Uses a hybrid storage approach (PostgreSQL + Redis) to balance data integrity with high-speed access.
