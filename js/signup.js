document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm') || document.getElementById('signup-form');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword') || document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');

    if (!signupForm || !emailInput || !passwordInput || !confirmPasswordInput) return;

    function showMessage(message, type = 'error') {
        signupForm.querySelectorAll('[data-auth-message]').forEach((element) => element.remove());

        const messageDiv = document.createElement('div');
        messageDiv.dataset.authMessage = 'true';
        messageDiv.className = type === 'success'
            ? 'mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm text-center'
            : 'mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center';
        messageDiv.textContent = message;
        signupForm.insertBefore(messageDiv, signupForm.firstChild);
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
        
        const fullName = fullNameInput?.value.trim() || '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validation
        if (fullNameInput && !fullName) {
            showMessage('Please enter your full name');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address');
            return;
        }

        if (!isStrongPassword(password)) {
            showMessage('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match');
            return;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
            showMessage('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...';
            submitButton.disabled = true;

            // Check if Firebase is initialized
            if (!window.firebase?.auth || !firebase.apps.length) {
                throw new Error('Firebase is not initialized.');
            }

            // Create user with Firebase
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Update user profile with full name
            if (fullName) {
                await userCredential.user.updateProfile({
                    displayName: fullName
                });
            }

            // Send email verification
            if (userCredential.user.sendEmailVerification) {
                await userCredential.user.sendEmailVerification();
            }

            // Show success message
            showMessage('Account created successfully. Redirecting...', 'success');

            // Redirect to main website after 2 seconds
            setTimeout(() => {
                window.location.replace('index.html');
            }, 900);

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
                    errorMessage = error.message || 'An error occurred during signup.';
            }

            showMessage(errorMessage);

            // Reset button
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
