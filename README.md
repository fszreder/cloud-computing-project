# 🚀 CloudClientPro

**CloudClientPro** is an enterprise-grade CRM system designed in a **Cloud-Native** architecture. The project combines a modern SPA frontend with a distributed backend and Microsoft Azure AI services, enabling automated management of customer data and multimedia assets.

---

## 🏗️ System Architecture

The system consists of three main modules working together within the Azure ecosystem:

1. **Frontend (**``**)**\
   A **React + Vite** based SPA providing a responsive user interface, client-side business validation, and communication with the API.

2. **Backend API (**``**)**\
   A **Node.js (Express)** server acting as an API Gateway. It is responsible for business logic, file uploads, database communication, and integration with Azure services.

3. **Function App (**``**)**\
   Serverless **Azure Functions** responsible for asynchronous image processing (thumbnail generation using the Sharp library) and image analysis using **Azure AI Vision v4.0**.

---

## 🛠️ Technologies Used

**Frontend**

- React
- TypeScript
- Tailwind CSS
- Vite

**Backend**

- Node.js
- Express
- Multer (Memory Storage)

**Database**

- Azure Cosmos DB (NoSQL)

**Storage & Messaging**

- Azure Blob Storage (avatars, documents)
- Azure Storage Queues (event-driven model)

**AI**

- Azure AI Vision v4.0 (Image Captioning)

---

## 📋 Prerequisites

- **Node.js**: version 18.x or higher
- **NPM**: version 9.x or higher
- **Microsoft Azure account** with an active subscription and configured resources:
  - Azure Cosmos DB
  - Azure Storage Account
  - Azure AI Services
  - Azure App Service / Azure Functions

---

## ⚙️ Local Installation and Configuration

### 1. Clone the repository

```bash
git clone https://github.com/fszreder/cloud-client-pro.git
cd cloud-client-pro
```

---

### 2. Backend Configuration (`/cloud-backend`)

```bash
cd cloud-backend
npm install
```

Create a `.env` file and fill in your configuration values (do not commit this file):

```env
PORT=3000
AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
COSMOS_CONNECTION_STRING="your_connection_string"
AZURE_AI_KEY="your_ai_key"
AZURE_AI_ENDPOINT="your_ai_endpoint"
```

Start the backend locally:

```bash
npm start
```

---

### 3. Frontend Configuration (`/cloud-frontend`)

```bash
cd ../cloud-frontend
npm install
npm run dev
```

The frontend application will be available at:

```
http://localhost:5173
```

---

### 4. Function App Configuration (`/function-app`)

```bash
cd ../function-app
npm install
```

Functions can be run locally using **Azure Functions Core Tools** or deployed directly to Azure.

---

## ☁️ Azure Environment Configuration (Production)

When deploying to **Azure App Service** and **Azure Functions**, all environment variables must be configured in:

**Azure Portal → Configuration → Application Settings**

### Required Environment Variables

| Key                               | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string for Azure Storage (Blob + Queues) |
| `COSMOS_CONNECTION_STRING`        | Azure Cosmos DB connection string                   |
| `AZURE_AI_KEY`                    | Azure AI Vision subscription key                    |
| `AZURE_AI_ENDPOINT`               | Azure AI Vision service endpoint                    |
| `AzureWebJobsStorage`             | _(Function App)_ Required for queue triggers        |

---

## 🌟 Key Project Features

- **Milanist Blacklist**\
  Automated business logic that prevents assigning VIP status to AC Milan players, enforced directly in the React frontend layer.

- **Asynchronous Thumbnail Generation**\
  Image uploads do not block the user. Thumbnails are generated in the background by Azure Functions triggered via storage queues.

- **AI-Generated Descriptions**\
  Each uploaded profile image receives an automatically generated description using Azure AI Vision, improving management of large customer datasets.

---

## 👥 Authors

- **Filip Szreder**
- **Aleksandra Bluszcz**

Project developed as part of the course **“Cloud Computing Technologies”** (academic year 2025/2026).
