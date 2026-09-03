// Website တစ်ခုလုံးတွင် Saved Theme & Color ကို Auto Apply လုပ်ပေးသည့် Function
function applySavedTheme() {
  const savedAccent = localStorage.getItem('accentColor') || '#3b82f6';
  const savedTheme = localStorage.getItem('pingusTheme') || 'light';

  // ၁။ CSS Variable ပြောင်းခြင်း
  document.documentElement.style.setProperty('--accent-color', savedAccent);

  // ၂။ Buttons/Icons အရောင်များကို လိုက်ပြောင်းပေးခြင်း
  document.querySelectorAll('.btn-save, button, .primary-btn, .logo, .nav-item.active').forEach(el => {
    if (el.classList.contains('logo')) {
      el.style.setProperty('color', savedAccent, 'important');
    } else {
      el.style.setProperty('background-color', savedAccent, 'important');
    }
  });

  // ၃။ Dark Mode သတ်မှတ်ခြင်း
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

// Color Dots နှိပ်သည့်အခါ
window.changeColor = function(color) {
  localStorage.setItem('accentColor', color);
  applySavedTheme();
};

// Dark Mode Switch နှိပ်သည့်အခါ
window.toggleDarkMode = function(isDark) {
  localStorage.setItem('pingusTheme', isDark ? 'dark' : 'light');
  applySavedTheme();
};

// Page စဖွင့်သည်နှင့် Global Theme ကို အလိုအလျောက် သတ်မှတ်မည်
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();

  // Settings Page ရှိ Checkbox အခြေအနေ ပြန်ညှိခြင်း
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.checked = (localStorage.getItem('pingusTheme') === 'dark');
  }
});