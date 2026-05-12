# NutriHealth Deployment Secrets Guide

To deploy the NutriHealth application to production, you need to configure several secret keys. This guide explains how to obtain and generate them.

## 1. JWT Secret Key (`JWT_SECRET_KEY`)
The **JWT Secret Key** is a private string used by the backend to sign and verify authentication tokens. It is **NOT** something you get from an external service; you must generate a secure, random string yourself.

### How to Generate:
- **Using Python (Recommended):**
  Run this in your terminal:
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- **Using OpenSSL:**
  ```bash
  openssl rand -base64 32
  ```
- **Using Node.js:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

---

## 2. Gemini API Key (`GEMINI_API_KEY`)
Required for the AI-powered food analysis and metabolic reports.

### How to Obtain:
1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click on **"Get API key"** in the sidebar.
4. Create a new API key for a project.
5. Copy the key and add it to your environment variables.

---

## 3. Firebase Configuration
The application uses Firebase for authentication.

### How to Configure:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project or select an existing one.
3. Add a **Web App** to your project.
4. Copy the `firebaseConfig` object.
5. Update `client/src/firebase.js` with these values, or set them as environment variables (prefixed with `VITE_`).

---

## 4. Database URL (`DATABASE_URL`)
For production, use a persistent database instead of the default SQLite.

- **Cloud SQL (PostgreSQL):** `postgresql://user:password@host:port/dbname`
- **Neon.tech (PostgreSQL):** `postgresql://user:password@host/dbname?sslmode=require`

---

> [!CAUTION]
> Never commit these keys to your version control (Git). Use environment variables or a Secret Manager (like Google Secret Manager) to store them securely.
