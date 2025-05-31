// Firebase SDKs
// This file centralizes your Firebase config and initialization

// Only include this file ONCE before any other Firebase usage

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8M-3v6x7SRxaAEyXPoyXXEdWD4Vng7yU",
  authDomain: "homeworkout-42259.firebaseapp.com",
  projectId: "homeworkout-42259",
  storageBucket: "homeworkout-42259.appspot.com",
  messagingSenderId: "424443672532",
  appId: "1:424443672532:web:bfcf888d8a602deb7b4841"
};

// Initialize Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Get auth instance
const auth = firebase.auth();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "home.html";
    })
    .catch(error => {
      alert("Login error: " + error.message);
    });
}