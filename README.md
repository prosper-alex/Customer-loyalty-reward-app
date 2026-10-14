# Customer Loyalty App

A full-stack customer loyalty and rewards application built to help customers earn points through purchases, track their loyalty balances, explore rewards, and redeem accumulated points.

The application features a React frontend and a Node.js/Express backend connected to MongoDB, with authentication and role-based access for customers and administrators.

## 🚀 Live Demo

* **Frontend:** https://customer-loyalty-reward-app-frontend.onrender.com
* **Backend API:** https://customer-loyalty-reward-app-uldx.onrender.com
* **GitHub Repository:** https://github.com/kali-ship-bit/Customer-loyalty-reward-app

## ✨ Features

### Authentication and User Management

* User registration and login.
* Password hashing and JWT-based authentication.
* User profile management.
* Role-based access control for customers and administrators.

### Product Management

* Create, view, update, and manage products.
* Track product prices and stock quantities.
* Manage product availability.
* Browse available products.

### Purchases and Loyalty Points

* Record customer purchases.
* Calculate loyalty points earned from purchases.
* Update product stock after successful purchases.
* Track points balances and transaction history.

### Rewards and Redemption

* Browse available rewards.
* Redeem rewards using accumulated points.
* Validate points balances and reward availability.
* Record reward redemption transactions.

### Additional Features

* Favorites management.
* Notifications.
* Responsive user interface.
* Input validation and error handling.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* DaisyUI

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)
* bcryptjs
* Helmet
* CORS

### Deployment and Development Tools

* Render
* MongoDB Atlas
* Git and GitHub

## 📁 Project Structure

Customer-loyalty-reward-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utilities/
│   ├── app.js
│   └── package.json
│
├── src/                          # Frontend source code
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── icons/
│   ├── lib/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── docs/                         # Project documentation
│   ├── API_DOCUMENTATION.md
│   └── TESTING_REPORT.md
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js


## ⚙️ Getting Started

### Prerequisites

Install the following:

* [Node.js](https://nodejs.org/)
* npm, included with Node.js
* A MongoDB Atlas account or another compatible MongoDB instance
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/kali-ship-bit/Customer-loyalty-reward-app.git
cd Customer-loyalty-reward-app
```

### 2. Configure the Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory.

Configure the variables required by your backend. For example:

```env
PORT = 3000
FRONTEND_URL=https://customer-loyalty-reward-app-frontend.onrender.com
MONGODB_URI = 
JWT_SECRET = 
EMAIL_USER = 
EMAIL_PASSWORD = 
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Your application may require additional variables depending on its enabled integrations. Check the backend configuration before starting the server.

Start the backend using the appropriate script from `backend/package.json`. For example:

```bash
npm run dev
```

### 3. Configure the Frontend

Open a second terminal and return to the project root:

```bash
cd Customer-loyalty-reward-app
npm install
```

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3000/api
```

This assumes the frontend uses `VITE_API_URL` as its API base URL and appends endpoint paths without duplicating `/api`.

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite, typically:

```text
http://localhost:5173
```

### Environment Variable Security

Never commit `.env` files, database credentials, JWT secrets, or API keys to GitHub. Keep local environment files excluded through `.gitignore`.

## 🌐 API Overview

The backend exposes API routes under the `/api` prefix.

Route groups include:

| Route                | Purpose                            |
| -------------------- | ---------------------------------- |
| `/api/auth`          | Authentication and user management |
| `/api/products`      | Product management                 |
| `/api/purchases`     | Purchase records                   |
| `/api/points`        | Loyalty points and transactions    |
| `/api/rewards`       | Rewards and redemption             |
| `/api/favorites`     | Favorites management               |
| `/api/notifications` | Notifications                      |

For endpoint details, including HTTP methods, authentication requirements, request bodies, and response formats, consult the project's API documentation if available.

## 🧪 Testing

The application has undergone manual testing of its main user flows, including:

* User registration and login.
* Dashboard and product loading.
* Purchases and points updates.
* Reward redemption.
* Input validation and role restrictions.

Automated test coverage should be documented separately once tests have been implemented and executed.

## 🔐 Security

Security measures used by the application include:

* Password hashing.
* JWT-based authentication.
* Protected routes and role-based authorization.
* Environment variables for sensitive configuration.
* CORS configuration.
* Request validation and error handling.

Security configurations should be reviewed and tested as the application evolves.

## 👥 Contributors

This project was developed collaboratively as part of the TS Academy full-stack capstone project.

* Ajube Tamaradiepreye Daniella
* Rebecca Woryi
* Godwin Divine
* Kenneth Goddy-natus
* Qudus Olayemi Shittu
* Godwin Ayobami
* Inioluwa Olaposi

## 📌 Future Improvements

Potential improvements include:

* Automated frontend and backend tests.
* Expanded API documentation.
* Performance monitoring and optimization.
* Improved loading states and user feedback.
* Additional accessibility and security testing.
