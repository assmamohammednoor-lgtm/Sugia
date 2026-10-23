# منصة سقيا — المياه أصل الحياة

مشروع Front-End (HTML5 + CSS3 + Vanilla JS) يعمل مباشرة بفتح `index.html`، ويستخدم `localStorage` كقاعدة بيانات مؤقتة.

## هيكل الملفات
```
sugia-platform/
├── index.html  home.html  booking.html  tracking.html  contact.html  complaints.html
├── css/style.css      (ملف CSS واحد لكل الصفحات)
├── js/app.js          (ملف JavaScript واحد؛ كل صفحة تشغّل جزءها فقط)
├── assets/images  assets/icons
└── README.md
```

## الصفحات
`index.html` (دخول/إنشاء حساب) · `home.html` · `booking.html` (يقبل `?service=tanker|delivery`) · `tracking.html` (يقبل `?order=SUG-...`) · `contact.html` · `complaints.html`

## مفاتيح localStorage
`sugia_users` · `sugia_current_user` · `sugia_orders` · `sugia_complaints` · `sugia_messages`

> ملاحظة: الترويسة والتنقل السفلي والتذييل تُرسم من `js/app.js`. عند التحويل إلى PHP يمكنك نقلها إلى `includes/header.php` و`includes/footer.php`.
> زر «محاكاة تقدّم الحالة» في صفحة المتابعة للتجربة فقط؛ لاحقًا تتغير الحالة من لوحة إدارة.

## الرفع على InfinityFree
1. سجّل الدخول إلى لوحة التحكم وأنشئ حسابًا للاستضافة (Hosting Account).
2. افتح File Manager (أو FTP) وادخل إلى المجلد `htdocs/`.
3. ارفع **محتويات** مجلد `sugia-platform` (ملفات HTML ومجلدات css/js/assets) داخل `htdocs/` مباشرة.
4. افتح `http://اسم-موقعك.rf.gd/` — ستظهر `index.html` تلقائيًا. كل المسارات نسبية فلا تحتاج أي تعديل.

## التحويل المستقبلي إلى PHP + MySQL
1. أنشئ قاعدة MySQL من لوحة InfinityFree (MySQL Databases) ثم استورد SQL أدناه عبر phpMyAdmin.
2. غيّر امتداد الصفحات إلى `.php` (وحدّث الروابط) دون تغيير CSS/JS.
3. أنشئ ملفات API (أدناه) وأرجع JSON.
4. في ملفات JS ابحث عن `FUTURE BACKEND` واستبدل `dbGet/dbSet` بـ `fetch`، مثال:
```js
const res = await fetch('api/orders/create.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
const order = await res.json();
```

### بنية API المقترحة
```
api/
├── auth/      login.php  register.php  logout.php
├── orders/    create.php get.php  update.php
├── complaints/create.php get.php update.php
├── contact/   create.php
└── config/    database.php
```

### SQL Schema مقترح
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  size VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  address VARCHAR(255) NOT NULL,
  area VARCHAR(100) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'قيد المراجعة',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_number VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NULL,
  order_number VARCHAR(20) NULL,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(150) NOT NULL,
  details TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'تم الاستلام',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_number) REFERENCES orders(order_number)
);
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120) NULL,
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
(أضف عمود `payment` إلى `orders` إذا أردت حفظ طريقة الدفع.)

## الأمان عند الانتقال إلى PHP
- `password_hash()` عند التسجيل و`password_verify()` عند الدخول، ولا تُخزَّن كلمات المرور نصًا صريحًا أبدًا.
- PHP Sessions للحماية الحقيقية للصفحات (الحماية الحالية في المتصفح تجريبية فقط ويمكن تجاوزها).
- Prepared Statements (PDO/MySQLi) لمنع SQL Injection.
- Validation على السيرفر وليس في المتصفح فقط.
- CSRF Token في كل النماذج، وتهريب المخرجات (`htmlspecialchars`).
