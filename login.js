document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
            submitButton.disabled = true;

            // Sign in with Firebase
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Successful login
            window.location.href = 'index.html';
        } catch (error) {
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