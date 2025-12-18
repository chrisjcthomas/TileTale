document.addEventListener('DOMContentLoaded', function () {
    // Menu functionality
    const menuItems = document.querySelectorAll('.menu-item');
    const menuContainers = document.querySelectorAll('.menu-item-container');

    // Handle keyboard navigation for menu
    menuItems.forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Toggle dropdown visibility
                const dropdown = this.nextElementSibling;
                const isVisible = dropdown.style.visibility === 'visible';

                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateY(-10px)';
                });

                // Toggle current dropdown
                if (!isVisible) {
                    dropdown.style.opacity = '1';
                    dropdown.style.visibility = 'visible';
                    dropdown.style.transform = 'translateY(0)';

                    // Focus the first item in the dropdown
                    const firstDropdownItem = dropdown.querySelector('.dropdown-item');
                    if (firstDropdownItem) {
                        firstDropdownItem.focus();
                    }
                }
            }
        });
    });

    // Handle keyboard navigation for dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                // Close dropdown and focus parent menu item
                const dropdown = this.closest('.dropdown-menu');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';

                const menuItem = dropdown.previousElementSibling;
                if (menuItem) {
                    menuItem.focus();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextItem = this.nextElementSibling;
                if (nextItem) {
                    nextItem.focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevItem = this.previousElementSibling;
                if (prevItem) {
                    prevItem.focus();
                } else {
                    // If at the top of dropdown, focus the menu item
                    const menuItem = this.closest('.dropdown-menu').previousElementSibling;
                    if (menuItem) {
                        menuItem.focus();
                    }
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu-item-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
            });
        }
    });

    // Handle mobile menu toggle
    let isMobileMenuOpen = false;

    function toggleMobileMenu() {
        if (window.innerWidth <= 768) {
            menuContainers.forEach(container => {
                if (isMobileMenuOpen) {
                    container.style.display = 'flex';
                } else {
                    // Keep only the active one visible
                    if (!container.classList.contains('active')) {
                        container.style.display = 'none';
                    }
                }
            });
            isMobileMenuOpen = !isMobileMenuOpen;
        }
    }

    // Adjust menu display on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuContainers.forEach(container => {
                container.style.display = 'flex';
            });
            isMobileMenuOpen = false;
        }
    });

    // Login form functionality
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the default form submission

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput ? usernameInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            if (username && password) {
                console.log('Login attempt with:');
                console.log('Username:', username);
                console.log('Password:', password);
                // Here you would typically send the data to a backend server
                // For this example, we'll just log it and show an alert.
                alert('Login successful! Backend integration needed for real auth.');
            } else {
                alert('Please enter both username and password.');
            }
        });
    }
});