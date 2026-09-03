const form=document.getElementById("hangoutForm");
const preview=document.getElementById("preview");
const fields=["title","category","date","time","location","maxPeople","imageUrl","description"];

auth.onAuthStateChanged(user=>{
  if(!user)location.href="login.html";
  else { updatePreview(); }
});
fields.forEach(id=>document.getElementById(id)?.addEventListener("input",updatePreview));

function updatePreview(){
  const h={
    title:document.getElementById("title").value||"Your hangout title",
    category:document.getElementById("category").value,
    date:document.getElementById("date").value,
    time:document.getElementById("time").value||"Time",
    location:document.getElementById("location").value||"Location",
    maxPeople:document.getElementById("maxPeople").value||8,
    description:document.getElementById("description").value||"Your description will appear here.",
    imageUrl:document.getElementById("imageUrl").value
  };
  preview.innerHTML=hangoutCard(h,null);
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  const user=auth.currentUser;if(!user)return;
  const msg=document.getElementById("formMessage");msg.textContent="";
  const date=document.getElementById("date").value,time=document.getElementById("time").value;
  if(new Date(`${date}T${time}`)<=new Date()){msg.textContent="Please choose a future date and time.";return;}
  const data={
    title:document.getElementById("title").value.trim(),
    category:document.getElementById("category").value,
    date,time,
    location:document.getElementById("location").value.trim(),
    maxPeople:Number(document.getElementById("maxPeople").value),
    imageUrl:document.getElementById("imageUrl").value.trim(),
    description:document.getElementById("description").value.trim(),
    creatorId:user.uid,
    creatorName:user.displayName||user.email,
    attendees:{[user.uid]:true},
    attendeeNames:{[user.uid]:user.displayName||user.email},
    createdAt:firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  try{
    await db.collection("hangouts").add(data);
    showToast("Hangout published for everyone! 🎉");
    location.href="index.html";
  }catch(err){msg.textContent=err.message;}
});