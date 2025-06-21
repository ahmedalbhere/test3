// ... (بقية الكود كما هو حتى دالة barberSignup)

async function barberSignup() {
    const name = document.getElementById('barberName').value.trim();
    const phone = document.getElementById('newBarberPhone').value.trim();
    const city = document.getElementById('barberCity').value.trim();
    const location = document.getElementById('barberLocation').value.trim();
    const password = document.getElementById('newBarberPassword').value;
    const confirmPassword = document.getElementById('confirmBarberPassword').value;
    const errorElement = document.getElementById('barberError');
    
    // التحقق من صحة البيانات
    if (!name || !phone || !city || !location || !password || !confirmPassword) {
        errorElement.textContent = 'جميع الحقول مطلوبة';
        errorElement.classList.remove('hidden');
        return;
    }
    
    // ... (بقية التحقق من الصحة كما هو)
    
    try {
        // إنشاء حساب في Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, `${phone}@barber.com`, password);
        const user = userCredential.user;
        
        // حفظ بيانات الحلاق في قاعدة البيانات
        await set(ref(database, 'barbers/' + user.uid), {
            name: name,
            phone: phone,
            city: city,
            location: location,
            status: 'open',
            queue: {}
        });
        
        // ... (بقية الدالة كما هو)
    } catch (error) {
        // ... (معالجة الأخطاء كما هو)
    }
}

// ... (بقية الكود حتى دالة loadBarbers)

// تحميل قائمة الحلاقين مع دعم البحث
let allBarbers = [];

async function loadBarbers() {
    const barbersList = document.getElementById('barbersList');
    barbersList.innerHTML = 'جارٍ التحميل...';
    
    onValue(ref(database, 'barbers'), (snapshot) => {
        const barbers = snapshot.val() || {};
        allBarbers = Object.entries(barbers).map(([id, barber]) => ({ id, ...barber }));
        filterBarbers();
    });
}

// تصفية الحلاقين حسب البحث
function filterBarbers() {
    const searchInput = document.getElementById('searchBarbers').value.toLowerCase();
    const barbersList = document.getElementById('barbersList');
    const filteredBarbers = allBarbers.filter(barber => {
        const matchesCity = barber.city && barber.city.toLowerCase().includes(searchInput);
        const matchesName = barber.name && barber.name.toLowerCase().includes(searchInput);
        return matchesCity || matchesName;
    });
    
    renderBarbersList(filteredBarbers);
}

// عرض قائمة الحلاقين
function renderBarbersList(barbers) {
    const barbersList = document.getElementById('barbersList');
    barbersList.innerHTML = '';
    
    if (barbers.length === 0) {
        barbersList.innerHTML = '<div class="alert alert-info">لا يوجد حلاقون متطابقون مع بحثك</div>';
        return;
    }
    
    barbers.forEach(barber => {
        const barberCard = document.createElement('div');
        barberCard.className = 'barber-card';
        
        const statusClass = barber.status === 'open' ? 'status-open' : 'status-closed';
        const statusText = barber.status === 'open' ? 'مفتوح' : 'مغلق';
        const queueLength = barber.queue ? Object.keys(barber.queue).length : 0;
        const hasBooking = currentUser && currentUser.booking;
        
        barberCard.innerHTML = `
            <div class="barber-city">${barber.city || 'غير محدد'}</div>
            <div class="barber-info">
                <div class="barber-header">
                    <div class="barber-avatar">${barber.name.charAt(0)}</div>
                    <div class="barber-name">${barber.name}</div>
                </div>
                <div class="barber-status ${statusClass}">${statusText}</div>
                <div class="barber-details">
                    <div>رقم الهاتف: ${barber.phone || 'غير متوفر'}</div>
                    <div>الموقع: <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barber.location)}" target="_blank" class="location-link">${barber.location || 'غير متوفر'}</a></div>
                    <div>عدد المنتظرين: ${queueLength}</div>
                    <div>وقت الانتظار التقريبي: ${queueLength * 15} دقيقة</div>
                </div>
            </div>
            <button class="book-btn" ${barber.status === 'closed' || hasBooking ? 'disabled' : ''}" 
                    onclick="bookAppointment('${barber.id}', '${barber.name.replace(/'/g, "\\'")}')">
                ${hasBooking ? 'لديك حجز بالفعل' : (barber.status === 'open' ? 'احجز الآن' : 'غير متاح')}
            </button>
        `;
        
        barbersList.appendChild(barberCard);
    });
}

// ... (بقية الكود كما هو)

// جعل الدوال متاحة globally
window.showScreen = showScreen;
window.clientLogin = clientLogin;
window.barberLogin = barberLogin;
window.barberSignup = barberSignup;
window.showBarberSignup = showBarberSignup;
window.showBarberLogin = showBarberLogin;
window.bookAppointment = bookAppointment;
window.completeClient = completeClient;
window.logout = logout;
window.filterBarbers = filterBarbers;
