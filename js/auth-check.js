// Check authentication state when the page loads
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // No user is signed in, redirect to login page
        window.location.replace('/login.html');
    }
});