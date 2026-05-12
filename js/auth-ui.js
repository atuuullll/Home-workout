document.addEventListener('DOMContentLoaded', () => {
    const guestElements = document.querySelectorAll('[data-auth-guest]');
    const userElements = document.querySelectorAll('[data-auth-user]');
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    const logoutButtons = document.querySelectorAll('[data-logout-button]');

    function setVisible(elements, isVisible) {
        elements.forEach((element) => {
            element.classList.toggle('hidden', !isVisible);
        });
    }

    function updateAuthUI(user) {
        setVisible(guestElements, !user);
        setVisible(userElements, Boolean(user));

        userEmailElements.forEach((element) => {
            element.textContent = user?.displayName || user?.email || 'Profile';
        });
    }

    logoutButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;

            try {
                if (window.firebase?.auth) {
                    await firebase.auth().signOut();
                }

                window.location.href = button.dataset.logoutRedirect || 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                button.disabled = false;
            }
        });
    });

    if (window.firebase?.auth && firebase.apps.length) {
        firebase.auth().onAuthStateChanged(updateAuthUI);
    } else {
        updateAuthUI(null);
    }
});
