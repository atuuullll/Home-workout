document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');

    // Function to show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm text-center';
        errorDiv.textContent = message;

        // Remove any existing error message
        const existingError = signupForm.querySelector('.bg-red-500\\/20');
        if (existingError) {
            existingError.remove();
        }

        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate password strength
    function isStrongPassword(password) {
        return password.length >= 6;
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validation
        if (!fullName) {
            showError('Please enter your full name');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (!isStrongPassword(password)) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (!termsCheckbox.checked) {
            showError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        try {
            // Show loading state
            const submitButton = signupForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...';
            submitButton.disabled = true;

            // Check if Firebase is initialized
            if (!firebase.apps.length) {
                throw new Error('Firebase is not initialized');
            }

            // Create user with Firebase
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Update user profile with full name
            await userCredential.user.updateProfile({
                displayName: fullName
            });

            // Send email verification
            await userCredential.user.sendEmailVerification();

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500 text-sm text-center';
            successDiv.innerHTML = `
                Account created successfully!<br>
                Please check your email to verify your account.<br>
                Redirecting to login...
            `;
            signupForm.insertBefore(successDiv, signupForm.firstChild);

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Signup error:', error);
            
            // Handle errors
            let errorMessage = 'An error occurred during signup.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }

            showError(errorMessage);

            // Reset button
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    // Real-time password match validation
    confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }
    });
}); 