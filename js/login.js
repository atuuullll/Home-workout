document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!loginForm || !emailInput || !passwordInput) return;

    function showMessage(message, type = 'error') {
        loginForm.querySelectorAll('[data-auth-message]').forEach((element) => element.remove());

        const messageDiv = document.createElement('div');
        messageDiv.dataset.authMessage = 'true';
        messageDiv.className = type === 'success'
            ? 'mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm text-center'
            : 'mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center';
        messageDiv.textContent = message;
        loginForm.insertBefore(messageDiv, loginForm.firstChild);
    }

    function getLoginErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email or password is incorrect.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait a moment and try again.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            default:
                return error.message || 'An error occurred during login.';
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
        submitButton.disabled = true;

        try {
            if (!window.firebase?.auth || !firebase.apps.length) {
                throw new Error('Firebase is not initialized.');
            }

            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            await firebase.auth().signInWithEmailAndPassword(
                emailInput.value.trim(),
                passwordInput.value
            );

            showMessage('Login successful. Redirecting...', 'success');
            window.setTimeout(() => {
                window.location.href = 'index.html';
            }, 700);
        } catch (error) {
            console.error('Login error:', error);
            showMessage(getLoginErrorMessage(error));
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
});
