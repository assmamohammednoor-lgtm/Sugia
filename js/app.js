/* main.js - shared helpers + header/footer/navigation rendering */
const KEYS = {users:'sugia_users',current:'sugia_current_user',orders:'sugia_orders',complaints:'sugia_complaints',messages:'sugia_messages'};

// FUTURE BACKEND: Replace these localStorage helpers with fetch() calls to the PHP API (api/...).
function dbGet(key){try{return JSON.parse(localStorage.getItem(key))||[]}catch(e){return []}}
function dbSet(key,val){localStorage.setItem(key,JSON.stringify(val))}

const ICONS = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  truck:'<path d="M2 6h11v10H2z"/><path d="M13 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  drop:'<path d="M12 2.5S5 10 5 15a7 7 0 0014 0c0-5-7-12.5-7-12.5z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  phone:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/>'
};
function icon(n){return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>'}
const DROP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5S5 10 5 15a7 7 0 0014 0c0-5-7-12.5-7-12.5z"/></svg>';
const NAV = [
  {href:'home.html',page:'home',label:'الرئيسية',short:'الرئيسية',icon:'home'},
  {href:'booking.html',page:'booking',label:'طلب مياه',short:'طلب',icon:'truck'},
  {href:'tracking.html',page:'tracking',label:'متابعة الطلب',short:'متابعة',icon:'search'},
  {href:'complaints.html',page:'complaints',label:'الشكاوى',short:'شكاوى',icon:'alert'},
  {href:'contact.html',page:'contact',label:'تواصل معنا',short:'تواصل',icon:'phone'}
];
const STATUS_CLASS = {'قيد المراجعة':'warn','تم قبول الطلب':'info','جاري التجهيز':'info','خرج للتوصيل':'info','تم التوصيل':'ok','تم الإلغاء':'bad','تم الاستلام':'warn','جاري المعالجة':'info','تمت المعالجة':'ok','مغلقة':'gray'};

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function badge(status){return '<span class="badge '+(STATUS_CLASS[status]||'gray')+'">'+esc(status)+'</span>'}
function infoList(rows){return '<dl class="info">'+rows.map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1]==null||r[1]===''?'-':r[1])+'</dd></div>').join('')+'</dl>'}
function todayStr(){return new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)}
function formatDate(iso){if(!iso)return '-';const d=new Date(iso.length===10?iso+'T00:00:00':iso);return isNaN(d)?iso:d.toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'})}
function isValidPhone(p){return /^\+?[0-9\s-]{8,15}$/.test(String(p).trim())}
function isValidEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}
function nextSerial(prefix,list,field){const y=new Date().getFullYear(),re=new RegExp('^'+prefix+'-'+y+'-(\\d+)$');let max=0;list.forEach(i=>{const m=re.exec(i[field]);if(m)max=Math.max(max,+m[1])});return prefix+'-'+y+'-'+String(max+1).padStart(4,'0')}

function getCurrentUser(){try{return JSON.parse(localStorage.getItem(KEYS.current))}catch(e){return null}}
function logout(){
  // FUTURE BACKEND: call api/auth/logout.php then redirect.
  localStorage.removeItem(KEYS.current);location.href='index.html';
}

/* Toast / Modal */
function showToast(msg,type){
  let w=document.querySelector('.toast-wrap');
  if(!w){w=document.createElement('div');w.className='toast-wrap';w.setAttribute('role','status');document.body.appendChild(w)}
  const t=document.createElement('div');t.className='toast '+(type||'info');t.textContent=msg;w.appendChild(t);
  setTimeout(()=>t.remove(),3500);
}
function closeModal(){const m=document.getElementById('modal');if(m)m.remove()}
function showModal(o){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';ov.id='modal';
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true"><div class="modal-icon '+(o.type||'')+'">'+icon(o.icon||'check')+'</div><h3>'+esc(o.title)+'</h3><div>'+(o.body||'')+'</div><div class="modal-actions"></div></div>';
  const box=ov.querySelector('.modal-actions');
  (o.actions||[]).forEach(a=>{
    const b=document.createElement('button');b.type='button';b.className='btn '+(a.cls||'btn-primary');b.textContent=a.label;
    b.addEventListener('click',()=>{if(!a.keep)closeModal();if(a.onClick)a.onClick()});box.appendChild(b);
  });
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal()});
  document.body.appendChild(ov);
}
function copyToClipboard(text){
  const done=()=>showToast('تم النسخ بنجاح','success');
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,()=>fallbackCopy(text,done))}else fallbackCopy(text,done);
}
function fallbackCopy(text,done){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){showToast('تعذر النسخ','error')}t.remove()}

/* Forms helpers */
function clearErrors(form){form.querySelectorAll('.err').forEach(e=>e.textContent='');form.querySelectorAll('.invalid').forEach(e=>e.classList.remove('invalid'))}
function showErrors(form,errs){
  clearErrors(form);let first=true;
  Object.keys(errs).forEach(id=>{
    const el=form.querySelector('#'+id);if(!el)return;
    el.classList.add('invalid');const f=el.closest('.field'),s=f&&f.querySelector('.err');if(s)s.textContent=errs[id];
    if(first){el.focus();first=false}
  });
}
function withLoading(btn,fn,delay){
  btn.disabled=true;btn.classList.add('loading');
  setTimeout(()=>{try{fn()}finally{btn.disabled=false;btn.classList.remove('loading')}},delay||500);
}

/* Layout */
function renderLayout(){
  const page=document.body.dataset.page,user=getCurrentUser();
  const h=document.getElementById('site-header');
  if(h&&user){
    h.innerHTML='<div class="header-in"><a class="brand" href="home.html"><span class="logo-drop">'+DROP+'</span><span class="brand-text"><strong>منصة سقيا</strong><span>المياه أصل الحياة</span></span></a>'+
      '<nav class="main-nav" aria-label="التنقل الرئيسي">'+NAV.map(n=>'<a href="'+n.href+'"'+(n.page===page?' class="active" aria-current="page"':'')+'>'+n.label+'</a>').join('')+'</nav>'+
      '<div class="user-box">'+icon('user')+'<span class="user-name">'+esc(user.fullName)+'</span><button type="button" class="logout-btn" id="logoutBtn">تسجيل الخروج</button></div></div>';
    document.getElementById('logoutBtn').addEventListener('click',()=>showModal({title:'تسجيل الخروج',type:'q',icon:'help',body:'<p>هل تريد تسجيل الخروج من حسابك؟</p>',actions:[{label:'نعم، خروج',onClick:logout},{label:'إلغاء',cls:'btn-ghost'}]}));
    const bn=document.createElement('nav');bn.className='bottom-nav';bn.setAttribute('aria-label','التنقل السفلي');
    bn.innerHTML=NAV.map(n=>'<a href="'+n.href+'"'+(n.page===page?' class="active" aria-current="page"':'')+'>'+icon(n.icon)+'<span>'+n.short+'</span></a>').join('');
    document.body.appendChild(bn);
  }
  const f=document.getElementById('site-footer');
  if(f)f.innerHTML='<strong>منصة سقيا</strong><p>المياه أصل الحياة</p><small>© 2026 منصة سقيا - جميع الحقوق محفوظة</small>';
  document.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=icon(e.dataset.icon)});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('.toggle-pw');if(!b)return;
  const i=b.parentElement.querySelector('input');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'إظهار':'إخفاء';
});

// Frontend-only route guard (NOT real security). FUTURE BACKEND: use PHP Sessions.
if(document.body.dataset.protected==='true'&&!getCurrentUser()){location.replace('index.html')}

/* ================= Page modules (each runs only on its own page) ================= */
const Pages={};

/* ---- index page ---- */
Pages.index=function(){
/* auth.js - login & registration (index.html) */
// FUTURE BACKEND:
// Replace localStorage authentication with PHP + MySQL authentication.
// (password_hash / password_verify + PHP Sessions). Never store plain passwords in production.

if(getCurrentUser()){location.replace('home.html')}

function validateLogin(u,p){
  const e={};
  if(!u.trim())e.loginUsername='اسم المستخدم مطلوب';
  if(!p)e.loginPassword='كلمة المرور مطلوبة';
  return e;
}
function validateRegistration(d){
  const e={};
  if(d.fullName.trim().length<3)e.regName='الاسم الكامل مطلوب (3 أحرف على الأقل)';
  if(!isValidPhone(d.phone))e.regPhone='رقم الهاتف غير صحيح';
  if(!d.username.trim())e.regUsername='لا يمكن ترك اسم المستخدم فارغًا';
  else if(d.username.trim().length<3)e.regUsername='اسم المستخدم قصير جدًا';
  if(!d.password)e.regPassword='كلمة المرور مطلوبة';
  else if(d.password.length<6)e.regPassword='كلمة المرور يجب ألا تقل عن 6 أحرف';
  if(d.confirm!==d.password)e.regConfirm='كلمتا المرور غير متطابقتين';
  return e;
}
function registerUser(d){
  // FUTURE BACKEND: fetch('api/auth/register.php',{method:'POST',body:...})
  const users=dbGet(KEYS.users);
  if(users.some(u=>u.username.toLowerCase()===d.username.trim().toLowerCase()))return {ok:false,errors:{regUsername:'اسم المستخدم مستخدم مسبقًا'}};
  users.push({id:Date.now(),fullName:d.fullName.trim(),phone:d.phone.trim(),username:d.username.trim(),password:d.password,createdAt:new Date().toISOString()});
  dbSet(KEYS.users,users);
  return {ok:true};
}
function loginUser(username,password){
  // FUTURE BACKEND: fetch('api/auth/login.php',...) and start a PHP session.
  const u=dbGet(KEYS.users).find(x=>x.username.toLowerCase()===username.trim().toLowerCase()&&x.password===password);
  if(!u)return null;
  localStorage.setItem(KEYS.current,JSON.stringify({id:u.id,fullName:u.fullName,phone:u.phone,username:u.username}));
  return u;
}

const loginForm=document.getElementById('loginForm'),registerForm=document.getElementById('registerForm');
function toggleForms(reg){loginForm.hidden=reg;registerForm.hidden=!reg;clearErrors(loginForm);clearErrors(registerForm)}
document.getElementById('showRegister').addEventListener('click',()=>toggleForms(true));
document.getElementById('showLogin').addEventListener('click',()=>toggleForms(false));

loginForm.addEventListener('submit',e=>{
  e.preventDefault();
  const u=document.getElementById('loginUsername').value,p=document.getElementById('loginPassword').value;
  const errs=validateLogin(u,p);
  if(Object.keys(errs).length)return showErrors(loginForm,errs);
  clearErrors(loginForm);
  withLoading(loginForm.querySelector('[type=submit]'),()=>{
    if(loginUser(u,p)){showToast('تم تسجيل الدخول بنجاح','success');window.location.href='home.html'}
    else showToast('اسم المستخدم أو كلمة المرور غير صحيحة','error');
  });
});
registerForm.addEventListener('submit',e=>{
  e.preventDefault();
  const d={fullName:regName.value,phone:regPhone.value,username:regUsername.value,password:regPassword.value,confirm:regConfirm.value};
  const errs=validateRegistration(d);
  if(Object.keys(errs).length)return showErrors(registerForm,errs);
  clearErrors(registerForm);
  withLoading(registerForm.querySelector('[type=submit]'),()=>{
    const r=registerUser(d);
    if(!r.ok)return showErrors(registerForm,r.errors);
    registerForm.reset();toggleForms(false);loginUsername.value=d.username;
    showToast('تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن','success');
  });
});

};

/* ---- booking page ---- */
Pages.booking=function(){
/* booking.js - water tanker / delivery requests (booking.html) */
const SERVICES={tanker:'طلب صهريج مياه',delivery:'توصيل مياه'};
const form=document.getElementById('bookingForm');

function getServiceFromURL(){const s=new URLSearchParams(location.search).get('service');return SERVICES[s]?s:'tanker'}
function generateOrderId(){return nextSerial('SUG',dbGet(KEYS.orders),'orderNumber')}
function validateOrder(d){
  const e={};
  if(d.name.trim().length<3)e.bName='الاسم مطلوب';
  if(!isValidPhone(d.phone))e.bPhone='رقم الهاتف غير صحيح';
  if(!d.service)e.bService='اختر نوع الخدمة';
  if(!d.size)e.bSize='اختر الحجم';
  if(!(parseInt(d.qty,10)>=1))e.bQty='أدخل كمية صحيحة (1 أو أكثر)';
  if(!d.address.trim())e.bAddress='العنوان مطلوب';
  if(!d.area.trim())e.bArea='المنطقة مطلوبة';
  if(!d.date)e.bDate='اختر تاريخ الطلب';else if(d.date<todayStr())e.bDate='لا يمكن اختيار تاريخ سابق';
  if(!d.time)e.bTime='اختر الوقت المفضل';
  if(!d.payment)e.bPayment='اختر طريقة الدفع';
  return e;
}
function saveOrder(d){
  // FUTURE BACKEND: fetch('api/orders/create.php',{method:'POST',body:JSON.stringify(d)}) and use the returned order number.
  const orders=dbGet(KEYS.orders),user=getCurrentUser();
  const order={orderNumber:generateOrderId(),userId:user.id,customerName:d.name.trim(),phone:d.phone.trim(),serviceType:SERVICES[d.service],
    size:bSize.options[bSize.selectedIndex].text,quantity:parseInt(d.qty,10),address:d.address.trim(),area:d.area.trim(),date:d.date,time:d.time,
    payment:d.payment,notes:d.notes.trim(),status:'قيد المراجعة',createdAt:new Date().toISOString()};
  orders.push(order);dbSet(KEYS.orders,orders);
  return order;
}
function updateTitle(){pageTitle.textContent=SERVICES[bService.value]||'طلب صهريج'}

const user=getCurrentUser();
if(user){bName.value=user.fullName;bPhone.value=user.phone||''}
bService.value=getServiceFromURL();updateTitle();bDate.min=todayStr();
bService.addEventListener('change',updateTitle);
form.addEventListener('reset',()=>{clearErrors(form);setTimeout(()=>{bService.value=getServiceFromURL();updateTitle()},0)});

form.addEventListener('submit',e=>{
  e.preventDefault();
  const d={name:bName.value,phone:bPhone.value,service:bService.value,size:bSize.value,qty:bQty.value,address:bAddress.value,area:bArea.value,date:bDate.value,time:bTime.value,payment:bPayment.value,notes:bNotes.value};
  const errs=validateOrder(d);
  if(Object.keys(errs).length)return showErrors(form,errs);
  clearErrors(form);
  withLoading(document.getElementById('submitBtn'),()=>{
    const o=saveOrder(d);form.reset();
    showModal({title:'تم إرسال طلبك بنجاح',body:'<p>رقم طلبك:</p><span class="order-code">'+esc(o.orderNumber)+'</span>',actions:[
      {label:'نسخ رقم الطلب',cls:'btn-outline',keep:true,onClick:()=>copyToClipboard(o.orderNumber)},
      {label:'متابعة الطلب',onClick:()=>{location.href='tracking.html?order='+encodeURIComponent(o.orderNumber)}}]});
  },700);
});

};

/* ---- tracking page ---- */
Pages.tracking=function(){
/* tracking.js - order tracking (tracking.html) */
const FLOW=['قيد المراجعة','تم قبول الطلب','جاري التجهيز','خرج للتوصيل','تم التوصيل'];
const resultBox=document.getElementById('result'),trackForm=document.getElementById('trackForm'),tOrderInput=document.getElementById('tOrder');

function findOrder(id){
  // FUTURE BACKEND: fetch('api/orders/get.php?order_number='+id)
  id=id.trim().toUpperCase();
  return dbGet(KEYS.orders).find(o=>String(o.orderNumber).toUpperCase()===id)||null;
}
function renderOrderStatus(o){
  const steps=['تم إرسال الطلب'];
  if(o.status==='تم الإلغاء')steps.push('تم الإلغاء');
  else steps.push(...FLOW.slice(0,FLOW.indexOf(o.status)+1));
  return '<ol class="timeline">'+steps.map((s,i)=>'<li class="'+(i===steps.length-1?'current':'done')+(s==='تم الإلغاء'?' cancel':'')+'">'+esc(s)+'</li>').join('')+'</ol>';
}
function displayOrder(o){
  resultBox.innerHTML='<article class="card result-card"><div class="result-head"><h2>'+esc(o.orderNumber)+'</h2>'+badge(o.status)+'</div>'+
    infoList([['اسم العميل',o.customerName],['رقم الهاتف',o.phone],['نوع الخدمة',o.serviceType],['الحجم',o.size],['الكمية',o.quantity],['تاريخ الطلب',formatDate(o.date)],['العنوان',o.address+' - '+o.area],['حالة الطلب',o.status]])+
    '<h3 class="sub">مراحل الطلب</h3>'+renderOrderStatus(o)+
    '<button type="button" id="advanceBtn" class="btn btn-ghost btn-block">محاكاة تقدّم الحالة (تجريبي فقط)</button></article>';
  document.getElementById('advanceBtn').addEventListener('click',()=>advanceStatus(o.orderNumber));
}
function showNotFound(){
  resultBox.innerHTML='<div class="card empty"><div class="hero-icon">'+icon('search')+'</div><p>عذرًا، لم يتم العثور على طلب بهذا الرقم.</p><button type="button" id="retryBtn" class="btn btn-outline">إعادة المحاولة</button></div>';
  document.getElementById('retryBtn').addEventListener('click',()=>{resultBox.innerHTML='';tOrderInput.value='';tOrderInput.focus()});
}
function advanceStatus(num){
  // Demo only: in production the status is changed by an admin through api/orders/update.php
  const orders=dbGet(KEYS.orders),o=orders.find(x=>x.orderNumber===num),i=FLOW.indexOf(o.status);
  if(i<0||i===FLOW.length-1)return showToast('الطلب في آخر مرحلة','info');
  o.status=FLOW[i+1];dbSet(KEYS.orders,orders);displayOrder(o);showToast('تم تحديث الحالة (تجريبي)','success');
}
trackForm.addEventListener('submit',e=>{
  e.preventDefault();
  const v=tOrderInput.value;
  if(!v.trim())return showErrors(trackForm,{tOrder:'أدخل رقم الطلب'});
  clearErrors(trackForm);
  withLoading(document.getElementById('trackBtn'),()=>{const o=findOrder(v);o?displayOrder(o):showNotFound()},500);
});
const pre=new URLSearchParams(location.search).get('order');
if(pre){tOrderInput.value=pre;const o=findOrder(pre);o?displayOrder(o):showNotFound()}

};

/* ---- contact page ---- */
Pages.contact=function(){
/* contact.js - contact form (contact.html) */
const contactForm=document.getElementById('contactForm');
function validateContactForm(d){
  const e={};
  if(d.name.trim().length<3)e.cName='الاسم مطلوب';
  if(!isValidPhone(d.phone))e.cPhone='رقم الهاتف غير صحيح';
  if(d.email.trim()&&!isValidEmail(d.email.trim()))e.cEmail='البريد الإلكتروني غير صحيح';
  if(!d.subject.trim())e.cSubject='الموضوع مطلوب';
  if(d.message.trim().length<10)e.cMessage='الرسالة قصيرة جدًا (10 أحرف على الأقل)';
  return e;
}
function saveMessage(d){
  // FUTURE BACKEND: fetch('api/contact/create.php',{method:'POST',body:JSON.stringify(d)})
  const list=dbGet(KEYS.messages),u=getCurrentUser();
  list.push({id:Date.now(),userId:u?u.id:null,name:d.name.trim(),phone:d.phone.trim(),email:d.email.trim(),subject:d.subject.trim(),message:d.message.trim(),createdAt:new Date().toISOString()});
  dbSet(KEYS.messages,list);
}
const cu=getCurrentUser();if(cu){cName.value=cu.fullName;cPhone.value=cu.phone||''}
contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  const d={name:cName.value,phone:cPhone.value,email:cEmail.value,subject:cSubject.value,message:cMessage.value};
  const errs=validateContactForm(d);
  if(Object.keys(errs).length)return showErrors(contactForm,errs);
  clearErrors(contactForm);
  withLoading(document.getElementById('sendBtn'),()=>{saveMessage(d);contactForm.reset();showToast('تم إرسال رسالتك بنجاح.','success')},700);
});

};

/* ---- complaints page ---- */
Pages.complaints=function(){
/* complaints.js - complaints & suggestions (complaints.html) */
const complaintForm=document.getElementById('complaintForm'),findForm=document.getElementById('findForm'),cResult=document.getElementById('cResult');

function generateComplaintId(){return nextSerial('CMP',dbGet(KEYS.complaints),'complaintNumber')}
function validateComplaint(d){
  const e={};
  if(d.name.trim().length<3)e.cpName='الاسم الكامل مطلوب';
  if(!isValidPhone(d.phone))e.cpPhone='رقم الهاتف غير صحيح';
  if(!d.type)e.cpType='اختر نوع الرسالة';
  if(!d.title.trim())e.cpTitle='العنوان مطلوب';
  if(d.details.trim().length<10)e.cpDetails='التفاصيل قصيرة جدًا (10 أحرف على الأقل)';
  return e;
}
function saveComplaint(d){
  // FUTURE BACKEND: fetch('api/complaints/create.php',{method:'POST',body:JSON.stringify(d)})
  const list=dbGet(KEYS.complaints),u=getCurrentUser();
  const c={complaintNumber:generateComplaintId(),userId:u?u.id:null,name:d.name.trim(),phone:d.phone.trim(),type:d.type,orderNumber:d.order.trim(),title:d.title.trim(),details:d.details.trim(),status:'تم الاستلام',createdAt:new Date().toISOString()};
  list.push(c);dbSet(KEYS.complaints,list);return c;
}
function findComplaint(id){
  // FUTURE BACKEND: fetch('api/complaints/get.php?complaint_number='+id)
  id=id.trim().toUpperCase();
  return dbGet(KEYS.complaints).find(c=>String(c.complaintNumber).toUpperCase()===id)||null;
}
function displayComplaint(c){
  cResult.innerHTML=c?'<article class="card result-card"><div class="result-head"><h3>'+esc(c.complaintNumber)+'</h3>'+badge(c.status)+'</div>'+
    infoList([['رقم الشكوى',c.complaintNumber],['نوع الرسالة',c.type],['عنوان الشكوى',c.title],['تاريخ الإرسال',formatDate(c.createdAt)],['الحالة',c.status]])+'</article>'
    :'<div class="card empty"><div class="hero-icon">'+icon('search')+'</div><p>لم يتم العثور على شكوى بهذا الرقم.</p></div>';
}
const pu=getCurrentUser();if(pu){cpName.value=pu.fullName;cpPhone.value=pu.phone||''}

complaintForm.addEventListener('submit',e=>{
  e.preventDefault();
  const d={name:cpName.value,phone:cpPhone.value,type:cpType.value,order:cpOrder.value,title:cpTitle.value,details:cpDetails.value};
  const errs=validateComplaint(d);
  if(Object.keys(errs).length)return showErrors(complaintForm,errs);
  clearErrors(complaintForm);
  withLoading(document.getElementById('cpBtn'),()=>{
    const c=saveComplaint(d);complaintForm.reset();
    showModal({title:'تم إرسال شكواك بنجاح',body:'<p>رقم الشكوى:</p><span class="order-code">'+esc(c.complaintNumber)+'</span>',actions:[{label:'نسخ رقم الشكوى',cls:'btn-outline',keep:true,onClick:()=>copyToClipboard(c.complaintNumber)},{label:'إغلاق',cls:'btn-ghost'}]});
  },700);
});
findForm.addEventListener('submit',e=>{
  e.preventDefault();
  if(!fId.value.trim())return showErrors(findForm,{fId:'أدخل رقم الشكوى'});
  clearErrors(findForm);
  withLoading(document.getElementById('findBtn'),()=>displayComplaint(findComplaint(fId.value)),500);
});

};

/* ================= Start ================= */
(function start(){
  if(document.body.dataset.protected==='true'&&!getCurrentUser())return; // redirecting to index.html
  try{renderLayout()}catch(e){console.error(e)}
  const run=Pages[document.body.dataset.page];
  if(run){try{run()}catch(e){console.error(e)}}
})();
