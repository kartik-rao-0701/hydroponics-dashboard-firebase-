// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHpokYA0QMr8QaWSQFfTuWywksR5q0b7Y",
  authDomain: "smart-agri-76b26.firebaseapp.com",
  projectId: "smart-agri-76b26",
  storageBucket: "smart-agri-76b26.firebasestorage.app",
  messagingSenderId: "1000331106332",
  appId: "1:1000331106332:web:45334c6b037d436a71e7d9",
  measurementId: "G-11GKMWD0GB"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Real-time data listeners
export function listenToNodeData(nodeId, callback) {
  const nodeRef = ref(database, `hydroponics/nodes/${nodeId}/readings`);
  return onValue(nodeRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert Firebase data to array format for charts
      const readings = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      callback(readings);
    }
  });
}

export function listenToSystemAlerts(callback) {
  const alertsRef = ref(database, 'hydroponics/alerts');
  return onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const alerts = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      callback(alerts);
    }
  });
}

export function listenToSystemStatus(callback) {
  const statusRef = ref(database, 'hydroponics/system');
  return onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

// Control functions
export function updateNodeControl(nodeId, controlType, value) {
  const controlRef = ref(database, `hydroponics/nodes/${nodeId}/controls/${controlType}`);
  return set(controlRef, {
    value: value,
    timestamp: new Date().toISOString(),
    source: 'web_dashboard'
  });
}

export function acknowledgeAlert(alertId) {
  const alertRef = ref(database, `hydroponics/alerts/${alertId}/acknowledged`);
  return set(alertRef, true);
}

export { database };
