import { auth } from './firebase-config.js';
import { 
  onAuthStateChanged, 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements များကို ရယူခြင်း
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const currentPasswordInput = document.getElementById('current-pass');
const newPasswordInput = document.getElementById('new-pass');

// Buttons (Profile Card & Password Card အတွက်)
const saveProfileBtn = document.querySelector('.settings-card:nth-child(1) .btn-save');
const updatePasswordBtn = document.querySelector('.settings-card:nth-child(2) .btn-save');

// ၁။ Login ဝင်ထားသော User စစ်ဆေးခြင်းနှင့် Form ထဲသို့ ဒေတာဖြည့်ခြင်း
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (usernameInput) usernameInput.value = user.displayName || '';
    if (emailInput) emailInput.value = user.email || '';
  } else {
    // Login မဝင်ထားပါက Login Page သို့ ပြန်ညွှန်းမည်
    window.location.href = 'login.html';
  }
});

// ၂။ Profile (Display Name) ပြောင်းလဲခြင်း
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const newName = usernameInput.value.trim();

    if (!newName) {
      alert('ကျေးဇူးပြု၍ Display Name ထည့်သွင်းပေးပါ။');
      return;
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        alert('Profile နာမည် ပြောင်းလဲမှု အောင်မြင်ပါသည်။');
      }
    } catch (error) {
      console.error(error);
      alert('Profile ပြင်ဆင်ရာတွင် အမှားတစ်ခု ရှိနေပါသည်: ' + error.message);
    }
  });
}

// ၃။ Password ပြောင်းလဲခြင်း (Firebase Security အတွက် Re-authentication အရင်လုပ်သည်)
if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const currentPass = currentPasswordInput.value;
    const newPass = newPasswordInput.value;

    if (!currentPass || !newPass) {
      alert('Current Password နှင့် New Password နှစ်ခုစလုံး ဖြည့်သွင်းပေးပါ။');
      return;
    }

    if (newPass.length < 6) {
      alert('Password အသစ်သည် အနည်းဆုံး စာလုံး ၆ လုံး ရှိရပါမည်။');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      // Password မပြောင်းမီ လက်ရှိ Password မှန်မမှန် Re-authenticate လုပ်ခြင်း
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      // Password သစ် ပြောင်းလဲခြင်း
      await updatePassword(user, newPass);
      alert('Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!');

      // Form များကို ပြန်ရှင်းခြင်း
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        alert('လက်ရှိ Password မှားယွင်းနေပါသည်။');
      } else {
        alert('Password ပြောင်းလဲရာတွင် အမှားရှိနေပါသည်: ' + error.message);
      }
    }
  });
}