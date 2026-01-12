# Attendance Taker 📱✅

Attendance Taker is a modern, responsive, and efficient web application designed to streamline the process of recording and reporting student attendance. Built with **HTML, Tailwind CSS, and Vanilla JavaScript**, it functions as a **Progressive Web App (PWA)**, allowing users to install it on their devices and use it offline.

## 🚀 Features

*   **Smart Attendance Grid**: Quickly mark students as absent using an intuitive grid interface.
*   **Detailed Setup**: Input Course Name, Year, Subject, Section, and Total Students.
*   **Instant Email Reports**: Send detailed attendance reports directly to your inbox using **EmailJS**.
*   **Progressive Web App (PWA)**: Installable on mobile (Android/iOS) and desktop. Works offline!
*   **Auto-Save**: Never lose your data! The app remembers your session and inputs automatically.
*   **Mobile Optimized**: Fully responsive design that looks great on all screen sizes.
*   **Dark Mode UI**: A sleek, professional dark interface with ambient background effects.

---

## �️ Complete Setup Guide

Follow these steps to get your own copy of **Attendance Taker** running perfectly with email reporting.

### 1️⃣ Project Files
Ensure your project folder (`Ats/`) has this exact structure:
```
Ats/
├── assets/              # Images folder
│   ├── favicon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo_full.png    # App Logo
│   └── email_logo.png   # Logo optimized for emails
├── index.html           # Main application
├── script.js            # Logic & Configuration
├── style.css            # Styling
├── email_template.html  # Code for the email design
├── manifest.json        # PWA Settings
├── sw.js                # Offline functionality
└── README.md            # This guide
```

---

### 2️⃣ Configure EmailJS (Required for Emails)
This app uses **EmailJS** to send emails without a backend server.

1.  **Create Account**: Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account.
2.  **Add Service**:
    *   Go to the **"Email Services"** tab.
    *   Click **"Add New Service"**.
    *   Select **Gmail** (or your preferred provider).
    *   Connect your account and click **"Create Service"**.
    *   Copy the **Service ID** (e.g., `service_xy123z`).
3.  **Create Template**:
    *   Go to the **"Email Templates"** tab.
    *   Click **"Create New Template"**.
    *   Click the **"Source Code"** button (Usually an icon like `< >`).
    *   **Open the file `email_template.html`** from this project folder.
    *   Copy the **entire code** from that file.
    *   Paste it into the EmailJS Source Code editor, replacing everything there.
    *   **Save** the template.
    *   Copy the **Template ID** (e.g., `template_ab123c`).
4.  **Get Public Key**:
    *   Go to the **"Account"** (or Profile) page.
    *   Copy your **Public Key** (e.g., `user_123456789`).

---

### 3️⃣ Connect the Code
Now you need to tell the app your keys.

1.  Open `script.js` in a text editor (Notepad, VS Code, etc.).
2.  Look for the configuration section at the very top:
    ```javascript
    const EMAILJS_CONFIG = {
        SERVICE_ID: "YOUR_SERVICE_ID",   // Paste Service ID here
        TEMPLATE_ID: "YOUR_TEMPLATE_ID", // Paste Template ID here
        PUBLIC_KEY: "YOUR_PUBLIC_KEY"    // Paste Public Key here
    };
    ```
3.  Replace the placeholder text with your actual keys from Step 2.
4.  **Save** the file.

---

### 4️⃣ Host the Logo (For Emails)
Emails cannot access the `assets` folder on your computer. You must host the logo online for it to appear in sent emails.

1.  Find the file `assets/email_logo.png`.
2.  Upload it to a free image host like [ImgBB](https://imgbb.com/) or [Imgur](https://imgur.com/).
3.  Get the **Direct Link** (Must end in `.png`).
    *   *Note: On ImgBB, select "HTML full linked" code, then extract the url from the `src` part, or right-click the uploaded image and choosing "Copy Image Address".*
4.  Go back to your **EmailJS Dashboard** > **Email Templates**.
5.  Edit your template, click Source Code, and find the `<img>` tag at the top.
6.  Replace the `src` URL with your new direct link.
7.  Save the template.

---

### 5️⃣ How to Run & Install

#### Running on PC
Simply double-click `index.html` to open it in your browser.

#### Running on Mobile (Local Network)
If your PC and Phone are on the same Wi-Fi:
1.  Open VS Code (or termianl).
2.  Run a local server (e.g., using Live Server extension or `python -m http.server 8000`).
3.  On your phone, visit your PC's IP address (e.g., `http://192.168.1.5:8000`).

#### deploying to the Web (Recommended)
To use it anywhere:
1.  Upload this entire folder to GitHub.
2.  Connect your GitHub repo to **Netlify** or **Vercel** (Free hosting).
3.  You will get a public URL (e.g., `https://attendance-taker.netlify.app`).

#### Installing the App (PWA)
Once you have the public URL open on your phone:
*   **Android (Chrome)**: Tap the menu (⋮) -> **"Install App"** or **"Add to Home Screen"**.
*   **iOS (Safari)**: Tap "Share" icon -> Scroll down -> **"Add to Home Screen"**.

Now it works like a native app and even works offline! 📶


