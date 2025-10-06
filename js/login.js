document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
        submitButton.disabled = true;

        try {
            // Check if Firebase is initialized
            if (!firebase.apps.length) {
                throw new Error('Firebase is not initialized');
            }

            // Sign in with Firebase
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500 text-sm text-center';
            successDiv.textContent = 'Login successful! Redirecting...';

            // Remove any existing messages
            const existingMessages = loginForm.querySelectorAll('.bg-red-500\\/20, .bg-green-500\\/20');
            existingMessages.forEach(msg => msg.remove());

            loginForm.insertBefore(successDiv, loginForm.firstChild);

            // Redirect after a short delay to ensure user sees success message
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);

            // Handle errors
            let errorMessage = 'An error occurred during login.';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
            }

            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm text-center';
            errorDiv.textContent = errorMessage;

            // Remove any existing error message
            const existingError = loginForm.querySelector('.bg-red-500\\/20');
            if (existingError) {
                existingError.remove();
            }

            loginForm.insertBefore(errorDiv, loginForm.firstChild);

            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
});
