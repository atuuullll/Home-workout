import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8M-3v6x7SRxaAEyXPoyXXEdWD4Vng7yU",
  authDomain: "homeworkout-42259.firebaseapp.com",
  projectId: "homeworkout-42259",
  storageBucket: "homeworkout-42259.firebasestorage.app",
  messagingSenderId: "424443672532",
  appId: "1:424443672532:web:bfcf888d8a602deb7b4841",
  measurementId: "G-P552EYDYCB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
export const db = firebase.firestore();
export { firebase };
