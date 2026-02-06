<img width="1417" height="735" alt="image" src="https://github.com/user-attachments/assets/6882d98c-dfd1-4cc1-9f9d-f9d169e67457" />

## 🏗️ System Architecture

This project utilizes a robust multi-tier architecture hosted on **Amazon Web Services (AWS)**. It is designed for modularity and scalability, leveraging **Docker** for consistent containerization across environments.

---

### 🎨 Frontend
* **Framework:** React
* **Language:** TypeScript
* **Description:** A type-safe Single Page Application (SPA) that manages the user interface and client-side state, communicating with the backend via **HTTP/REST**.

---

### 🌐 Web & Application Tier
The backend is hosted on an **AWS EC2** instance, with all services orchestrated via **Docker**.

* **Reverse Proxy (Nginx):** Acts as the entry point for all incoming traffic. It handles SSL termination, security headers, and routes requests to the internal application server. Nginx is also a load balancer to balance and forward requests to backend.
* **WSGI Server (Gunicorn):** A Production-grade interface between the Nginx web server and the Python application, managing multiple worker processes for high concurrency.
* **Core Logic (Flask):** A modular backend services layer (running Python) structured into functional domains:
    * **User Service:** Authentication and profile management.
    * **Booking & Event Services:** Core business logic for scheduling.
    * **Payment Service:** Processing and transaction management.
    * **Admin Service:** Internal tools and monitoring.

---

### 💾 Data & Cloud Services
* **Relational Database (PostgreSQL):** A containerized instance used for structured data storage, ensuring data integrity and complex querying capabilities.
* **Cache (Redis):** An in-memory data store used to optimize performance for session storage and frequently accessed "hot" data.
* **Object Storage (Amazon S3):** Used for durable storage of unstructured assets such as images, user-uploaded files, and static media.

---

### 🚀 Key Technical Highlights
* **Container-First:** The entire stack is dockerized for seamless deployment.
* **Separation of Concerns:** Distinct services for business logic ensure the codebase remains maintainable as it grows.
* **Hybrid Storage:** Combines relational data (PostgreSQL), in-memory speed (Redis), and massive scale object storage (S3).
