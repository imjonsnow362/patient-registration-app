# Modern In-Browser Patient Management System

This system provides a cutting-edge patient management solution that operates entirely within your web browser, powered by **PGlite (WebAssembly PostgreSQL)**.

---

### Core Capabilities

* **Integrated Database:** Features a full PostgreSQL database running directly within your browser, thanks to PGlite.
* **Offline Functionality:** Works seamlessly without an internet connection, with all data securely stored and persisted in IndexedDB.
* **Synchronized Tabs:** Ensures consistent database state across multiple browser tabs for a unified experience.
* **Comprehensive Patient Registration:** Offers a complete form for adding new patients, capturing extensive medical details.
* **Effortless Patient Lookup:** Provides robust search and filtering capabilities to quickly locate patients by name and other attributes.
* **Direct SQL Access:** Includes an advanced interface for executing custom SQL queries directly against the database.
* **Sleek User Interface:** Built with React, offering a clean, responsive, and intuitive user experience.

---

### Setup Guide

To get this system running locally, follow these simple steps:

#### Prerequisites

* **Node.js:** Version 16 or higher
* **npm:** Version 7 or higher

#### Installation Steps

1.  **Obtain the Repository:**
    ```bash
    git clone [(https://github.com/imjonsnow362/patient-registration-app.git)]
    cd patient-registration-app
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Launch Development Server:**
    ```bash
    npm run dev
    ```
4.  **Access Application:**
    Open your web browser and navigate to `http://localhost:5173`.


### Project Layout

The project adheres to a clear and organized structure:

Markdown

# Modern In-Browser Patient Management System

This system provides a cutting-edge patient management solution that operates entirely within your web browser, powered by **PGlite (WebAssembly PostgreSQL)**.

---

### Core Capabilities

* **Integrated Database:** Features a full PostgreSQL database running directly within your browser, thanks to PGlite.
* **Offline Functionality:** Works seamlessly without an internet connection, with all data securely stored and persisted in IndexedDB.
* **Synchronized Tabs:** Ensures consistent database state across multiple browser tabs for a unified experience.
* **Comprehensive Patient Registration:** Offers a complete form for adding new patients, capturing extensive medical details.
* **Effortless Patient Lookup:** Provides robust search and filtering capabilities to quickly locate patients by name and other attributes.
* **Direct SQL Access:** Includes an advanced interface for executing custom SQL queries directly against the database.
* **Sleek User Interface:** Built with React, offering a clean, responsive, and intuitive user experience.

---

### Setup Guide

To get this system running locally, follow these simple steps:

#### Prerequisites

* **Node.js:** Version 16 or higher
* **npm:** Version 7 or higher

#### Installation Steps

1.  **Obtain the Repository:**
    ```bash
    git clone [https://github.com/bajpaisushil/Patient_System-Pglite.git](https://github.com/bajpaisushil/Patient_System-Pglite.git)
    cd Patient_System-Pglite
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Launch Development Server:**
    ```bash
    npm run dev
    ```
4.  **Access Application:**
    Open your web browser and navigate to `http://localhost:5173`.

---

### Project Layout

The project adheres to a clear and organized structure:
patient-system-pglite/
├── public/
│   └── pglite-worker.js     # PGlite worker for multi-tab support
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React context providers
│   │   └── DatabaseContext.tsx
│   ├── pages/               # Application pages
│   │   ├── Dashboard.tsx
│   │   ├── PatientList.tsx
│   │   ├── PatientQuery.tsx
│   │   └── PatientRegistration.tsx
│   ├── services/            # Core services
│   │   └── DatabaseService.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
└── vite.config.ts

### Implementation Details

#### PGlite Integration

This system leverages **PGlite** to enable a PostgreSQL database to run directly within your browser. For efficient multi-tab operation and persistent data storage, the database is initialized within a **Web Worker** and utilizes **IndexedDB**.

#### Database Schema

The patient data is structured within the following database schema:

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  height_cm INTEGER,
  weight_kg INTEGER,
  allergies TEXT,
  medical_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (last_name, first_name);

### How to Use
#### Adding a New Patient
1. Navigate to the "Register" page via the dashboard or navigation menu.
2. Complete the required patient information fields.
3. Click "Register Patient" to save the new record.
#### Searching for Patients
1. Go to the "Patients" page.
2. Utilize the search bar to find patients by name.
3. Select a patient from the list to view their comprehensive details.
#### Executing Custom Queries
1. Access the "Query" page.
2. Input your desired SQL query into the provided editor.
3. Click "Execute" to run the query and display the results.
