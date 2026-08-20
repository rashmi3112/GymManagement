# ⚙️ Firebase Integration Guide: FitCore Gym Management

This guide explains how to set up Firebase and how it is utilized by both the **React JS frontend** and the **PHP backend** to deliver authentication, database services, and media storage.

---

## 1. Step-by-Step Firebase Console Setup

To connect the application to your database, follow these steps in the [Firebase Console](https://console.firebase.google.com/):

### Step A: Create a Firebase Project
1. Click **Add Project**.
2. Name the project (e.g., `FitCore-Gym`).
3. (Optional) Disable Google Analytics unless you need it.
4. Click **Create Project** and wait for it to provision.

### Step B: Enable Authentication
1. In the left sidebar, click **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable:
   - **Email/Password**: Click, toggle **Enable**, and click **Save**.
   - **Google**: Click, toggle **Enable**, select a project support email, and click **Save**.

### Step C: Create the Firestore Database
1. Click **Build** -> **Firestore Database** in the left sidebar.
2. Click **Create database**.
3. Select your Database Location (preferably close to your users, e.g., `asia-south1` or `us-central1`).
4. Select **Start in production mode** (or **Start in test mode** for local setup).
5. Click **Create**.
6. Under the **Rules** tab, publish these rules to allow read/write access:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Step D: Set Up Firebase Storage (For Profile Photos)
1. Click **Build** -> **Storage** in the left sidebar.
2. Click **Get Started** and select **Start in production mode**.
3. Click **Next** -> **Done**.
4. Under the **Rules** tab, update the rules to permit photo uploads:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Step E: Register a Web App
1. Go to the project dashboard and click the **Web icon (</>)** to register an app.
2. Enter an app nickname (e.g., `FitCore-Web`).
3. Click **Register App**.
4. Copy the `firebaseConfig` object values.
5. Open your local project's [frontend/.env](file:///d:/Rashmi/Projects/GymManagement/frontend/.env) file and replace the placeholder values with your copied config keys.

---

## 2. How Firebase is Used in the Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React JS Frontend                    │
│                                                        │
│  1. Logs in user via Firebase Auth Client SDK          │
│  2. Directs photo uploads to Firebase Storage          │
│  3. Queries Firestore directly for real-time widgets   │
│  4. Retrieves a secure JWT ID token                    │
└───────────────────────────┬────────────────────────────┘
                            │ (Adds JWT in Bearer Header)
                            ▼
┌────────────────────────────────────────────────────────┐
│                     PHP REST API                       │
│                                                        │
│  1. Decodes JWT payload locally to authenticate requests│
│  2. Translates PHP arrays into Firestore REST JSON     │
│  3. Performs CRUD on DB via Firestore REST Endpoints   │
└───────────────────────────┬────────────────────────────┘
                            │ (Rest HTTP: GET/POST/PATCH/DELETE)
                            ▼
┌────────────────────────────────────────────────────────┐
│                        Firebase                        │
│             (Auth / Firestore / Storage)               │
└────────────────────────────────────────────────────────┘
```

---

## 3. How the Frontend Uses Firebase

The React application uses the official **Firebase Web SDK** (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`) loaded via [src/services/firebase.js](file:///d:/Rashmi/Projects/GymManagement/frontend/src/services/firebase.js):

### A. Authentication & Sign-in Persistence
When a user logs in (e.g. on the [Login page](file:///d:/Rashmi/Projects/GymManagement/frontend/src/pages/Login.jsx)), Firebase Auth manages state persistence automatically:
- **Email Login**: `signInWithEmailAndPassword(auth, email, password)`
- **Google Login**: `signInWithPopup(auth, googleProvider)`
- **Session Tracking**: [AuthContext.jsx](file:///d:/Rashmi/Projects/GymManagement/frontend/src/context/AuthContext.jsx) registers `onAuthStateChanged(auth, callback)`, which triggers automatically whenever a user logs in or out, updating user contexts globally.

### B. User Registration & Roles
Upon successful user sign-up:
1. `createUserWithEmailAndPassword(auth, email, password)` creates the user record in Firebase Auth.
2. A document is written to the **`users`** Firestore collection containing extra fields (e.g., `role: "admin" | "trainer" | "member"`, `phone`, and `createdAt`).
3. Role-based client-side route guards in [App.jsx](file:///d:/Rashmi/Projects/GymManagement/frontend/src/App.jsx) look at this document to control user access.

### C. Profile Photo Uploads
On the [Members profile editor page](file:///d:/Rashmi/Projects/GymManagement/frontend/src/pages/Members.jsx):
1. Clicking upload takes a local file input.
2. `uploadBytes(ref(storage, path), file)` streams the photo file to the Storage bucket.
3. `getDownloadURL(snap.ref)` fetches a public image URL, which is saved on the member's database document.

---

## 4. How the Backend (PHP) Uses Firebase

To avoid running heavy third-party SDK dependencies or complex server configurations, the **PHP backend** interfaces directly with Firebase using **Firestore's Native REST API**:

### A. Authentication Verification
The frontend interceptor in [api.js](file:///d:/Rashmi/Projects/GymManagement/frontend/src/services/api.js) automatically injects the active user's Firebase token into API headers:
`Authorization: Bearer <Firebase_ID_Token>`

Our PHP [AuthMiddleware](file:///d:/Rashmi/Projects/GymManagement/backend/middleware/auth.php):
1. Grabs the Bearer Token from headers.
2. Decodes the token payload locally (base64 URL decode) to extract standard JWT claims.
3. Retrieves the authenticated user's `uid`, `email`, and `name` to confirm authorization.

### B. Firestore REST Document Operations
Our custom [Firestore REST class](file:///d:/Rashmi/Projects/GymManagement/backend/config/firebase.php) coordinates calls to Google's Firestore endpoints using cURL:
- **Endpoint Structure**: `https://firestore.googleapis.com/v1/projects/{project-id}/databases/(default)/documents/{collection-name}`
- **Response Mapping**: Converts Firestore's strict, wrapped JSON structure:
  ```json
  "name": { "stringValue": "John Doe" }
  ```
  into a standard, readable PHP array:
  ```php
  ["name" => "John Doe"]
  ```

This allows endpoints like [members.php](file:///d:/Rashmi/Projects/GymManagement/backend/api/members.php) or [payments.php](file:///d:/Rashmi/Projects/GymManagement/backend/api/payments.php) to read, search, write, or delete collection documents using clean PHP objects.
