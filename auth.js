let mode="login";
const form=document.getElementById("authForm");
const nameField=document.getElementById("nameField");
const submit=document.getElementById("authSubmit");
const error=document.getElementById("authError");
const loginTab=document.getElementById("loginTab");
const signupTab=document.getElementById("signupTab");
const switchText=document.getElementById("authSwitch");

function setMode(newMode){
  mode=newMode;
  const signup=mode==="signup";
  loginTab.classList.toggle("active",!signup);signupTab.classList.toggle("active",signup);
  nameField.classList.toggle("hidden",!signup);
  document.getElementById("nameInput").required=signup;
  submit.textContent=signup?"Create account":"Log in";
  switchText.innerHTML=signup?`Already have an account? <button type="button">Log in</button>`:`Don't have an account? <button type="button">Sign up</button>`;
  switchText.querySelector("button").onclick=()=>setMode(signup?"login":"signup");
  error.textContent="";
}
loginTab.onclick=()=>setMode("login");signupTab.onclick=()=>setMode("signup");

form.addEventListener("submit",async e=>{
  e.preventDefault();error.textContent="";
  const email=document.getElementById("emailInput").value.trim();
  const password=document.getElementById("passwordInput").value;
  try{
    if(mode==="signup"){
      const name=document.getElementById("nameInput").value.trim();
      const cred=await auth.createUserWithEmailAndPassword(email,password);
      await cred.user.updateProfile({displayName:name});
      await db.collection("users").doc(cred.user.uid).set({displayName:name,email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      location.href="index.html";
    }else{
      await auth.signInWithEmailAndPassword(email,password);
      location.href="index.html";
    }
  }catch(e){
    const map={"auth/email-already-in-use":"That email is already registered.","auth/invalid-email":"Please enter a valid email.","auth/weak-password":"Password must be at least 6 characters.","auth/invalid-credential":"Email or password is incorrect."};
    error.textContent=map[e.code]||e.message;
  }
});

auth.onAuthStateChanged(user=>{if(user && location.pathname.endsWith("login.html"))location.href="index.html";});
