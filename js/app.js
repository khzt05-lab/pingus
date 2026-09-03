let allHangouts=[];
let selectedCategory="All";
let unsubscribeHangouts=null;

const categories=["All","Study","Gaming","Sports","Food","Art","Music","Other"];
// Navigation Tab Switcher (Sidebar Links များ နှိပ်ပါက စာမျက်နှာ ပြောင်းလဲပေးရန်)
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".side-nav .nav-item");
  
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");
      
      // internal link (#) ဖြစ်ပါက အောက်ပါအတိုင်း Tab ပြောင်းမည်
      if (href && href.startsWith("#")) {
        e.preventDefault();
        
        // Active class ပြောင်းရန်
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");
        
        const targetId = href.substring(1); // 'notifications', 'my-hangouts', 'explore'
        
        // Notification Tab နှိပ်လိုက်လျှင်
        if (targetId === "notifications") {
          showNotificationsTab();
        } else if (targetId === "my-hangouts") {
          showMyHangoutsTab();
        } else if (targetId === "explore") {
          showExploreTab();
        }
      }
    });
  });
});

// Notifications Tab ဖော်ပြပေးသည့် Function
function showNotificationsTab() {
  const hangoutGrid = document.getElementById("hangoutGrid");
  const notificationsPanel = document.getElementById("notificationsPanel");
  
  if (hangoutGrid) hangoutGrid.classList.add("hidden");
  
  if (!notificationsPanel) {
    // HTML ထဲတွင် notificationsPanel မရှိသေးပါက အသစ်ဖန်တီးပေးမည်
    const mainContent = document.querySelector(".main-content");
    const panel = document.createElement("section");
    panel.id = "notificationsPanel";
    panel.className = "notifications-panel";
    panel.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="margin-bottom: 15px; font-size: 20px;">🔔 Notifications</h2>
        <div id="notificationsList">
          <p style="color: #666; font-size: 14px;">No new notifications yet.</p>
        </div>
      </div>
    `;
    mainContent.appendChild(panel);
  } else {
    notificationsPanel.classList.remove("hidden");
  }
}

// Home / Explore သို့ ပြန်သွားသည့် Function
function showExploreTab() {
  const hangoutGrid = document.getElementById("hangoutGrid");
  const notificationsPanel = document.getElementById("notificationsPanel");
  
  if (hangoutGrid) hangoutGrid.classList.remove("hidden");
  if (notificationsPanel) notificationsPanel.classList.add("hidden");
}

// My Hangouts ဖော်ပြပေးသည့် Function
function showMyHangoutsTab() {
  showExploreTab();
  if (auth.currentUser && Array.isArray(allHangouts)) {
    const myEvents = allHangouts.filter(h => h.creatorId === auth.currentUser.uid || (h.attendees && h.attendees[auth.currentUser.uid]));
    // My Hangouts သီးသန့် ရွေးထုတ်ပြသခြင်း
    renderFilteredHangouts(myEvents);
  }
}

function renderFilteredHangouts(list) {
  const grid = document.getElementById("hangoutGrid");
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = `<p style="padding: 20px; color: #666;">No hangouts found here.</p>`;
    return;
  }
  grid.innerHTML = list.map(h => hangoutCard(h, auth.currentUser ? auth.currentUser.uid : null)).join("");
}
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("categoryBar").innerHTML=categories.map(c=>`<button class="category-chip ${c==="All"?"active":""}" data-cat="${c}">${categoryIcons[c]||"◉"} ${c}</button>`).join("");
  document.querySelectorAll(".category-chip").forEach(b=>b.addEventListener("click",()=>{
    selectedCategory=b.dataset.cat;
    document.querySelectorAll(".category-chip").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    renderFeed();
  }));
  document.getElementById("searchInput")?.addEventListener("input",syncSearch);
  document.getElementById("mobileSearch")?.addEventListener("input",e=>{
    document.getElementById("searchInput").value=e.target.value; renderFeed();
  });
  document.getElementById("sortSelect")?.addEventListener("change",renderFeed);

  auth.onAuthStateChanged(user=>{
    updateAuthArea(user);
    loadUserProfile(user);
    renderFeed();
  });

  unsubscribeHangouts=db.collection("hangouts").orderBy("createdAt","desc").onSnapshot(snapshot=>{
    allHangouts=snapshot.docs.map(d=>({id:d.id,...d.data()}));
    renderFeed();
    renderUpcoming(auth.currentUser);
    renderPopularCategories();
  }, err=>{
    console.error(err);
    showToast("Could not load hangouts. Check Firebase setup/rules.",true);
  });
});

function syncSearch(e){
  document.getElementById("mobileSearch").value=e.target.value;
  renderFeed();
}
function renderFeed(){
  const q=(document.getElementById("searchInput")?.value||"").toLowerCase().trim();
  const sort=document.getElementById("sortSelect")?.value||"newest";
  let list=allHangouts.filter(h=>{
    const categoryOK=selectedCategory==="All"||h.category===selectedCategory;
    const text=`${h.title} ${h.description||""} ${h.location} ${h.category} ${h.creatorName||""}`.toLowerCase();
    return categoryOK && text.includes(q);
  });
  if(sort==="soonest")list.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  if(sort==="popular")list.sort((a,b)=>Object.keys(b.attendees||{}).length-Object.keys(a.attendees||{}).length);
  if(sort==="newest")list.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  document.getElementById("hangoutGrid").innerHTML=list.map(h=>hangoutCard(h,auth.currentUser)).join("");
  document.getElementById("resultCount").textContent=`${list.length} hangout${list.length===1?"":"s"}`;
  document.getElementById("emptyState").classList.toggle("hidden",list.length!==0);
  document.querySelectorAll("[data-action='join']").forEach(b=>b.addEventListener("click",()=>toggleJoin(b.dataset.id)));
  document.querySelectorAll("[data-action='edit']").forEach(b=>b.addEventListener("click",()=>editHangout(b.dataset.id)));
document.querySelectorAll("[data-action='delete']").forEach(b=>b.addEventListener("click",()=>deleteHangout(b.dataset.id)));
}

async function toggleJoin(id){
  if(!requireLogin())return;
  const ref=db.collection("hangouts").doc(id);
  try{
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);
      if(!snap.exists)throw new Error("Hangout no longer exists.");
      const h=snap.data();
      const attendees={...(h.attendees||{})};
      const names={...(h.attendeeNames||{})};
      const uid=auth.currentUser.uid, name=auth.currentUser.displayName||auth.currentUser.email;
      const joined=Object.keys(attendees).length;
      if(attendees[uid]){
        delete attendees[uid];
        delete names[uid];
      }else{
        if(joined >= Number(h.maxPeople)) throw new Error("This hangout is full.");
        attendees[uid]=true;
        names[uid]=name;
      }
      tx.update(ref,{attendees,attendeeNames:names,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    });
    showToast("Hangout updated!");
  }catch(e){showToast(e.message||"Could not update hangout.",true);}
}

function editHangout(id){
  const h=allHangouts.find(x=>x.id===id);
  if(!h)return;
  if(!auth.currentUser){location.href="login.html";return;}
  if(h.creatorId !== auth.currentUser.uid){showToast("Only the creator can edit this hangout.",true);return;}
  const title=prompt("Edit hangout title:",h.title);
  if(title===null)return;
  const location=prompt("Edit location:",h.location);
  if(location===null)return;
  const description=prompt("Edit description:",h.description||"");
  if(description===null)return;
  db.collection("hangouts").doc(id).update({title:title.trim(),location:location.trim(),description:description.trim(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})
    .then(()=>showToast("Hangout edited for everyone!"))
    .catch(e=>showToast(e.message,true));
}
async function deleteHangout(id){
  if(!requireLogin()) return;

  const h = allHangouts.find(x => x.id === id);

  if(!h){
    showToast("Hangout not found.", true);
    return;
  }

  // Only the creator can delete
  if(h.creatorId !== auth.currentUser.uid){
    showToast("Only the creator can delete this hangout.", true);
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete "${h.title}"?`
  );

  if(!confirmed) return;

  try{
    await db.collection("hangouts").doc(id).delete();

    showToast("Hangout deleted successfully!");
  }catch(e){
    console.error(e);
    showToast("Could not delete hangout.", true);
  }
}

async function loadUserProfile(user){
  const panel=document.getElementById("profilePanel");
  if(!panel)return;
  if(!user){panel.innerHTML=profileHTML(null,{});return;}
  const stats={created:0,joined:0};
  try{
    const snap=await db.collection("hangouts").get();
    snap.forEach(d=>{const h=d.data();if(h.creatorId===user.uid)stats.created++;if(h.attendees && h.attendees[user.uid])stats.joined++;});
  }catch(e){}
  panel.innerHTML=profileHTML(user,stats);
  document.getElementById("logoutBtn")?.addEventListener("click",()=>auth.signOut());
  document.getElementById("welcomeTitle").textContent=`Hello, ${(user.displayName||"there").split(" ")[0]}! 👋`;
}
function renderUpcoming(user){
  const box=document.getElementById("upcomingList"); if(!box)return;
  const list=user?allHangouts.filter(h=>h.attendees && h.attendees[user.uid]).slice(0,3):allHangouts.slice(0,3);
  box.innerHTML=list.length?list.map(h=>`<div class="upcoming"><img src="${esc(getImage(h))}" onerror="this.src='${imageFallbacks.Other}'"><div><strong>${esc(h.title)}</strong><small>${formatDate(h.date)} · ${esc(h.time)}</small></div></div>`).join(""):`<p class="muted small">Nothing yet. Join a hangout!</p>`;
}
function renderPopularCategories(){
  const counts={};allHangouts.forEach(h=>counts[h.category]=(counts[h.category]||0)+Object.keys(h.attendees||{}).length);
  const list=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  document.getElementById("popularCategories").innerHTML=list.map(([c,n])=>`<div class="popular-row"><span>${categoryIcons[c]} ${c}</span><strong>${n}</strong></div>`).join("");
}
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash) {
    const targetLink = document.querySelector(`a[href="${hash}"]`);
    if (targetLink) {
      targetLink.click();
    }
  }
});
// Sidebar navigation active state ပြောင်းလဲပေးရန်
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // ၁။ link အားလုံးမှ active class ကို ခဏဖြုတ်လိုက်မည်
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // ၂။ နှိပ်လိုက်သည့် link တစ်ခုတည်းကိုပဲ active class ထည့်မည်
      this.classList.add('active');
    });
  });
});