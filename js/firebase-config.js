const firebaseConfig = {
    apiKey: "AIzaSyB8M-3v6x7SRxaAEyXPoyXXEdWD4Vng7yU",
    authDomain: "homeworkout-42259.firebaseapp.com",
    projectId: "homeworkout-42259",
    storageBucket: "homeworkout-42259.firebasestorage.app",
    messagingSenderId: "424443672532",
    appId: "1:424443672532:web:bfcf888d8a602deb7b4841",
    measurementId: "G-P552EYDYCB"
};

if (!window.firebase) {
    console.error('Firebase SDK is not loaded.');
} else if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

window.homeworkoutFirebase = {
    auth: () => (window.firebase?.auth ? firebase.auth() : null),
    db: () => (window.firebase?.firestore ? firebase.firestore() : null)
};
