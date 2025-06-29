# Hydroponics Lab Dashboard

A professional-grade web dashboard for monitoring and controlling a hydroponics system, designed to work with an ESP32 S3 main server and Firebase Realtime Database.

## ✨ Features

- **Real-time Data Visualization**: Advanced charts (temperature, humidity, pH) using Recharts.
- **Node Overview**: Displays status and key sensor readings for multiple hydroponics nodes.
- **Control Interface**: Mock controls for LED lights, nutrient pumps, and exhaust fans.
- **Alert System**: Displays recent system alerts and warnings.
- **Responsive Design**: Optimized for various screen sizes (desktop, tablet, mobile).
- **Firebase Integration**: Connects directly to Firebase Realtime Database for live data updates.

## 🚀 Getting Started

Follow these steps to set up and run the Hydroponics Lab Dashboard locally.

### Prerequisites

- Node.js (LTS version recommended) and npm (or pnpm/yarn) installed.
- Access to your Firebase Project (where your ESP32 is sending data).

### 1. Clone the Repository (or place the folder)

If you haven't already, get the project files. If you downloaded a ZIP, extract it.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/hydroponics-dashboard.git
cd hydroponics-dashboard
```

### 2. Install Dependencies

Navigate to the project directory and install the required Node.js packages:

```bash
cd hydroponics-dashboard
pnpm install # or npm install or yarn install
```

### 3. Configure Firebase

1.  **Open `src/firebase_config.js`** in your code editor.
2.  **Replace the `firebaseConfig` object** with your actual Firebase project configuration. You can find this in your Firebase project settings (Project settings -> General -> Your apps -> Web app -> Firebase SDK snippet -> Config).

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_FIREBASE_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID" // Optional
    };
    ```
    **Make sure to use the configuration you obtained from your Firebase project.**

### 4. Run the Development Server

Start the local development server to view the dashboard in your browser:

```bash
pnpm run dev # or npm run dev or yarn dev
```

This will typically open the dashboard at `http://localhost:5173` (or a similar port). The dashboard will display mock data initially, but once your ESP32 is sending data to Firebase, it will update in real-time.

## 📦 Project Structure

```
hydroponics-dashboard/
├── public/             # Static assets
├── src/                # React source code
│   ├── assets/         # Images, icons
│   ├── components/     # Reusable UI components (shadcn/ui)
│   │   └── ui/         # Shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── App.css         # Main CSS file (TailwindCSS)
│   ├── App.jsx         # Main React application component
│   ├── index.css       # Global styles
│   ├── main.jsx        # Entry point for React app
│   └── firebase_config.js # Firebase configuration and functions
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite build configuration
└── README.md           # This file
```

## ⚙️ Deployment to Firebase Hosting

To deploy your dashboard to Firebase Hosting:

1.  **Ensure Firebase CLI is installed and logged in:**
    ```bash
npm install -g firebase-tools
firebase login
    ```
2.  **Initialize Firebase in your project (if not already done):**
    Navigate to the `hydroponics-dashboard` root directory and run:
    ```bash
firebase init
    ```
    *   Select `Hosting` and `Realtime Database` features.
    *   Choose your `smart-agri-76b26` Firebase project.
    *   Set `dist` as your public directory.
    *   Configure as a single-page app (Y).
    *   Do NOT set up GitHub Action deploys (N) if you want to deploy manually.

3.  **Build your React application for production:**
    ```bash
pnpm run build # or npm run build or yarn build
    ```
    This will create a `dist` folder with optimized production-ready files.

4.  **Deploy to Firebase Hosting:**
    ```bash
firebase deploy --only hosting
    ```
    Firebase will provide you with a live URL for your dashboard.

## 🤝 Contributing

Contributions are welcome! Please follow standard GitHub flow:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.
