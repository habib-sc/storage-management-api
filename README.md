# Storage Management System Backend

This is a comprehensive Node.js backend for a personal cloud storage (Google Drive clone) application. It provides a secure and efficient way to manage files and folders, track storage usage, and perform advanced document operations.

## Features

- **Authentication & Security**: JWT-based authentication with secure password hashing.
- **File Management**: Upload, create, rename, and recursively delete files and folders.
- **Document Duplication**: Easily duplicate files or entire folder structures with auto-incrementing suffixes.
- **Secure Viewing**: Stream images, PDFs, and text files through an authenticated API—no public exposure of private assets.
- **Favourites**: Mark specific documents as favourites for quick access.
- **Dashboard Stats**: Real-time aggregation of storage usage, categories (Image, PDF, Notes), and item counts.
- **Move/Copy to Folder**: Seamlessly organize your files by moving or copying them between folders.

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Handling**: Multer (Disk Storage) and Node.js File System (`fs`) API
- **Auth**: JSON Web Tokens (JWT) and Bcrypt.js
- **Utilities**: Morgan (logging), Helmet (security), Dotenv (config)

## Getting Started

### Prerequisites

- Node.js (v18.x or higher recommended)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd storage-management-system-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Variables:
   Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Email
   EMAIL_HOST=
   EMAIL_PORT=
   EMAIL_USER=
   EMAIL_PASS=
   ```

### Running the Application

- **Development Mode**:

  ```bash
  npm run dev
  ```

  Runs the server with `nodemon` for automatic restarts on code changes.

- **Production Mode**:
  ```bash
  npm start
  ```

---
