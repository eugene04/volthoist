import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDYpSoDHIMZeyUkUQZw9dUgO6PB9grDljc",
    authDomain: "volthoist.firebaseapp.com",
    projectId: "volthoist",
    storageBucket: "volthoist.firebasestorage.app",
    messagingSenderId: "792014377153",
    appId: "1:792014377153:web:4ab79dfa1ac57ed109c440",
    measurementId: "G-2VXK6V7EHD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
