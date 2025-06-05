document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authLink = document.getElementById('authLink');
    const authLinkItem = document.getElementById('authLinkItem');
    const registerLink = document.getElementById('registerLink');
    const userDropdown = document.getElementById('userDropdown');
    const usernameLink = document.getElementById('usernameLink');
    const logoutLink = document.getElementById('logoutLink');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const bookButtons = document.querySelectorAll('.btn-book');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Hàm hiển thị thông báo
    const showNotification = (message, type = 'error') => {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        const closeNotification = document.getElementById('closeNotification');
        if (!notification || !notificationMessage) {
            console.error('Không tìm thấy phần tử notification hoặc notificationMessage');
            return;
        }

        // Cập nhật nội dung và kiểu thông báo
        notificationMessage.textContent = message;
        notification.className = `notification ${type} animate__animated animate__fadeInRight`;
        notification.style.display = 'block';
        notification.style.opacity = '1';

        // Xử lý đóng thủ công
        if (closeNotification) {
            closeNotification.onclick = () => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 500);
            };
        }

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 5000);
    };

    // Hàm cập nhật giao diện sau đăng nhập
    const updateUIAfterLogin = (username) => {
        if (authLink && authLinkItem && registerLink && userDropdown && usernameLink) {
            authLinkItem.style.display = 'none';
            registerLink.style.display = 'none';
            userDropdown.style.display = 'block';
            usernameLink.textContent = username || 'Người dùng';
            console.log('Cập nhật giao diện: Dropdown hiển thị với username:', username);
        } else {
            console.error('Thiếu phần tử DOM khi cập nhật giao diện:', {
                authLink: !!authLink,
                authLinkItem: !!authLinkItem,
                registerLink: !!registerLink,
                userDropdown: !!userDropdown,
                usernameLink: !!usernameLink
            });
        }
    };

    // Hàm xử lý đăng xuất
    const handleLogout = (e) => {
        if (e) e.preventDefault();
        
        console.log('Đăng xuất được gọi');
        try {
            // Xóa dữ liệu local storage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');

            // Đóng tất cả modal đang mở
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });

            // Cập nhật giao diện
            if (authLink) {
                authLink.textContent = 'Đăng nhập';
                authLink.setAttribute('data-bs-toggle', 'modal');
                authLink.setAttribute('data-bs-target', '#authModal');
                authLink.setAttribute('data-tab', 'login');
                authLink.href = '#';
            }

            if (authLinkItem) authLinkItem.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';

            console.log('Chuyển hướng về trang chủ');
            window.location.href = '/';
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            showNotification('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.', 'error');
        }
    };

    // Gắn sự kiện logout
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    } else {
        console.error('Không tìm thấy logoutLink');
    }

    // Kiểm tra trạng thái đăng nhập
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        console.log('Người dùng đã đăng nhập, token:', token);
        updateUIAfterLogin(username);
    } else {
        console.log('Không có token/username, người dùng chưa đăng nhập');
        if (userDropdown) userDropdown.style.display = 'none';
        if (authLinkItem) authLinkItem.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
    }

    // Xử lý chuyển tab đăng nhập/đăng ký
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            const registerTab = document.getElementById('register-tab');
            if (registerTab) registerTab.click();
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            const loginTab = document.getElementById('login-tab');
            if (loginTab) loginTab.click();
        });
    }

    // Xử lý nút đặt phòng
    if (bookButtons.length > 0) {
        bookButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const currentToken = localStorage.getItem('token'); // Lấy token mới nhất
                if (!currentToken) {
                    showNotification('Vui lòng đăng nhập để đặt phòng!', 'error');
                    if (authLink) authLink.click();
                    return;
                }

                const roomName = button.dataset.room;
                const roomDetails = button.dataset.details;
                const price = parseFloat(button.dataset.price);
                const depositAmount = price * 0.3; // Đặt cọc 30%
                const bookingDate = new Date().toISOString();

                console.log('Đặt phòng:', { roomName, roomDetails, depositAmount, bookingDate });

                try {
                    const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({
                            room_name: roomName,
                            booking_date: bookingDate,
                            room_details: roomDetails,
                            deposit_amount: depositAmount
                        })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showNotification('Đặt phòng thành công! Kiểm tra tại Dashboard.', 'success');
                    } else {
                        console.error('Lỗi API đặt phòng:', data.message);
                        showNotification('Lỗi đặt phòng: ' + data.message, 'error');
                    }
                } catch (error) {
                    console.error('Lỗi khi gọi API đặt phòng:', error);
                    showNotification('Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.', 'error');
                }
            });
        });
    } else {
        console.warn('Không tìm thấy nút đặt phòng (.btn-book)');
    }

    // Xử lý dashboard
    if (window.location.pathname.includes('dashboard')) {
        const loadDashboard = async () => {
            const currentToken = localStorage.getItem('token'); // Sử dụng token động
            if (!currentToken) {
                showNotification('Vui lòng đăng nhập để xem dashboard!', 'error');
                window.location.href = '/';
                return;
            }

            try {
                // Lấy thông tin tài khoản
                const accountResponse = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                const accountData = await accountResponse.json();
                if (accountResponse.ok) {
                    const accountUsername = document.getElementById('accountUsername');
                    const accountEmail = document.getElementById('accountEmail');
                    const accountPhone = document.getElementById('accountPhone');
                    if (accountUsername && accountEmail && accountPhone) {
                        accountUsername.textContent = accountData.username;
                        accountEmail.textContent = accountData.email;
                        accountPhone.textContent = accountData.phone;
                    } else {
                        console.error('Thiếu phần tử DOM trong dashboard (accountInfo)');
                    }
                } else {
                    console.error('Lỗi API tài khoản:', accountData.message);
                    showNotification('Lỗi tải thông tin tài khoản: ' + accountData.message, 'error');
                }

                // Lấy danh sách đặt chỗ
                const bookingResponse = await fetch('/api/bookings', {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                const bookingData = await bookingResponse.json();
                const bookingList = document.getElementById('bookingList');
                if (!bookingList) {
                    console.error('bookingList không tồn tại trong dashboard');
                    return;
                }

                if (bookingResponse.ok) {
                    bookingList.innerHTML = '';
                    if (bookingData.length === 0) {
                        bookingList.innerHTML = '<p>Chưa có phòng nào được đặt.</p>';
                    } else {
                        bookingData.forEach(booking => {
                            bookingList.innerHTML += `
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title">${booking.room_name}</h5>
                                        <p><strong>Ngày đặt:</strong> ${new Date(booking.booking_date).toLocaleString()}</p>
                                        <p><strong>Thông tin phòng:</strong> ${booking.room_details}</p>
                                        <p><strong>Thanh toán:</strong> ${booking.payment_status}</p>
                                        <p><strong>Đặt cọc:</strong> ${booking.deposit_amount} VND</p>
                                    </div>
                                </div>
                            `;
                        });
                    }
                } else {
                    console.error('Lỗi API đặt phòng:', bookingData.message);
                    showNotification('Lỗi tải danh sách đặt chỗ: ' + bookingData.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi tải dashboard:', error);
                showNotification('Đã xảy ra lỗi khi tải dashboard. Vui lòng thử lại.', 'error');
            }
        };
        loadDashboard();
    }

    // Xử lý form đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            if (!usernameInput || !passwordInput) {
                console.error('Thiếu input đăng nhập');
                showNotification('Thiếu trường nhập liệu!', 'error');
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

            if (!username || !password) {
                showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                return;
            }

            console.log('Gửi yêu cầu đăng nhập:', { username });

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);

                    if (rememberMe) {
                        localStorage.setItem('rememberedUsername', username);
                        localStorage.setItem('rememberedPassword', password);
                    } else {
                        localStorage.removeItem('rememberedUsername');
                        localStorage.removeItem('rememberedPassword');
                    }

                    showNotification('Đăng nhập thành công!', 'success');
                    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    if (authModal) authModal.hide();
                    else console.warn('Không tìm thấy authModal để đóng');

                    updateUIAfterLogin(data.username);
                } else {
                    console.error('Lỗi API đăng nhập:', data.message);
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API đăng nhập:', error);
                showNotification('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!', 'error');
            }
        });
    } else {
        console.warn('loginForm không tồn tại');
    }

    // Xử lý form đăng ký
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('registerUsername');
            const emailInput = document.getElementById('registerEmail');
            const phoneInput = document.getElementById('registerPhone');
            const passwordInput = document.getElementById('registerPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');

            if (!usernameInput || !emailInput || !phoneInput || !passwordInput || !confirmPasswordInput) {
                console.error('Thiếu input đăng ký');
                showNotification('Thiếu trường nhập liệu!', 'error');
                return;
            }

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (!username || !email || !phone || !password || !confirmPassword) {
                showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác minh không khớp!', 'error');
                return;
            }

            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phone)) {
                showNotification('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.', 'error');
                return;
            }

            console.log('Gửi yêu cầu đăng ký:', { username, email, phone });

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, phone, password }),
                });
                const data = await response.json();

                if (response.ok) {
                    showNotification(data.message, 'success');
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) loginTab.click();
                    else console.warn('Không tìm thấy login-tab để chuyển');
                } else {
                    console.error('Lỗi API đăng ký:', data.message);
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API đăng ký:', error);
                showNotification('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại!', 'error');
            }
        });
    } else {
        console.warn('registerForm không tồn tại');
    }
});

// Cập nhật phần xử lý dropdown ngôn ngữ
document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.getAttribute('data-lang');
        if (lang !== currentLang) {
            currentLang = lang;
            updateLanguage(lang);
            
            // Update active state
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        }
    });
});

        // Translations object
        const translations = {
            vi: {
                home: "Trang chủ",
                hotels: "Khách sạn",
                promotion: "Khuyến mãi",
                language: "Ngôn ngữ",
                login: "Đăng nhập",
                register: "Đăng ký",
                search_title: "Tìm kiếm khách sạn",
                destination: "Địa điểm",
                check_in: "Ngày đến",
                check_out: "Ngày đi",
                guests: "Số khách",
                rooms: "Số phòng",
                search: "Tìm kiếm",
                featured_hotels: "Khách sạn nổi bật",
                wifi: "WiFi",
                pool: "Hồ bơi",
                restaurant: "Nhà hàng",
                per_night: "/đêm",
                book_now: "Đặt ngay",
                contact: "Liên hệ",
                travel_website: "Trang web du lịch",
                contact_us: "LIÊN HỆ",
                address1: "CS1: 170D/6 Phan Đăng Lưu, P3, Phú Nhuận, TP.HCM",
                address2: "CS2: 662/3 Sư Vạn Hạnh, P12, Quận 10, TP.HCM",
                opening_hours: "GIỜ MỞ CỬA",
                week_days: "Thứ 2 - Chủ nhật"
            },
            en: {
                home: "Home",
                hotels: "Hotels",
                promotion: "Promotions",
                language: "Language",
                login: "Login",
                register: "Register",
                search_title: "Search Hotels",
                destination: "Destination",
                check_in: "Check-in",
                check_out: "Check-out",
                guests: "Guests",
                rooms: "Rooms",
                search: "Search",
                featured_hotels: "Featured Hotels",
                wifi: "WiFi",
                pool: "Pool",
                restaurant: "Restaurant",
                per_night: "/night",
                book_now: "Book Now",
                contact: "Contact",
                travel_website: "Travel Website",
                contact_us: "CONTACT US",
                address1: "Branch 1: 170D/6 Phan Dang Luu, Ward 3, Phu Nhuan, HCMC",
                address2: "Branch 2: 662/3 Su Van Hanh, Ward 12, District 10, HCMC",
                opening_hours: "OPENING HOURS",
                week_days: "Monday - Sunday"
            }
        };

        // Language switching functionality
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-option');
        let currentLang = 'vi';

        // Toggle dropdown
        languageToggle.addEventListener('click', (e) => {
            e.preventDefault();
            languageDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-dropdown')) {
                languageDropdown.classList.remove('show');
            }
        });

        // Handle language selection
        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                if (lang !== currentLang) {
                    currentLang = lang;
                    updateLanguage(lang);
                    
                    // Update active state
                    languageOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                }
                languageDropdown.classList.remove('show');
            });
        });

        // Update page content with selected language
        function updateLanguage(lang) {
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[lang][key]) {
                    element.textContent = translations[lang][key];
                }
            });
        }