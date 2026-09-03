const categoryIcons = {
  Study:"📚", Gaming:"🎮", Sports:"🏀", Food:"🍜", Art:"🎨", Music:"🎵", Other:"✨"
};
const imageFallbacks = {
  Gaming:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
  Study:"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  Sports:"https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
  Food:"https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80",
  Art:"https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
  Music:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  Other:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
};
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function formatDate(value){
  if(!value) return "TBA";
  const d = value.toDate ? value.toDate() : new Date(value);
  return d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
}
function getImage(h){ return h.imageUrl || imageFallbacks[h.category] || imageFallbacks.Other; }
function showToast(message, error=false){
  const t=document.getElementById("toast"); if(!t)return;
  t.textContent=message; t.className=`toast show ${error?"error":""}`;
  setTimeout(()=>t.className="toast",3000);
}
function requireLogin(){
  if(!auth.currentUser){ location.href="login.html"; return false; }
  return true;
}
function userAvatar(name){ return (name||"U").trim().slice(0,1).toUpperCase(); }

function hangoutCard(h, currentUser){
  const attendeeIds = h.attendees && typeof h.attendees === "object" && !Array.isArray(h.attendees)
    ? Object.keys(h.attendees) : [];
  const joined = attendeeIds.length;
  const isJoined = currentUser && attendeeIds.includes(currentUser.uid);
  const attendeeNames = h.attendeeNames && typeof h.attendeeNames === "object" && !Array.isArray(h.attendeeNames)
    ? Object.values(h.attendeeNames) : [];
  const canEdit = currentUser && h.creatorId === currentUser.uid;
  const full = joined >= Number(h.maxPeople||1);
  return `<article class="hangout-card">
    <div class="card-image-wrap">
      <img class="card-image" src="${esc(getImage(h))}" alt="" onerror="this.src='${imageFallbacks.Other}'">
      <span class="category-badge">${categoryIcons[h.category]||"✨"} ${esc(h.category||"Other")}</span>
      <button class="bookmark" title="Bookmark">♡</button>
    </div>
    <div class="card-body">
      <h3>${esc(h.title)} ${categoryIcons[h.category]||""}</h3>
      <div class="card-meta"><div>▣ ${formatDate(h.date)} · ${esc(h.time||"")}</div><div>⌖ ${esc(h.location)}</div></div>
      <div class="card-footer">
        <div class="avatar-stack">${attendeeNames.slice(0,3).map(n=>`<span>${userAvatar(n)}</span>`).join("")}<small>${joined} / ${h.maxPeople} joined</small></div>
        <div class="card-actions">
          ${currentUser ? `<button class="join-btn ${isJoined?"joined":""}" data-action="join" data-id="${h.id}" ${full&&!isJoined?"disabled":""}>${isJoined?"Leave":"Join"}</button>`:"<a class='join-btn' href='login.html'>Login</a>"}
          ${canEdit ? `
  <button class="more-btn" data-action="edit" data-id="${h.id}">
    ✎ Edit
  </button>

  <button class="more-btn" data-action="delete" data-id="${h.id}">
    🗑 Delete
  </button>
` : ""}
        </div>
      </div>
    </div>
  </article>`;
}

function profileHTML(user, stats){
  if(!user) return `<div class="profile-login"><div class="profile-avatar">?</div><h3>Join PingUs</h3><p>Log in to create and join hangouts.</p><a class="primary-btn full" href="login.html">Log in / Sign up</a></div>`;
  return `<div class="profile-cover"></div><div class="profile-main"><div class="profile-avatar">${userAvatar(user.displayName||user.email)}</div><h2>${esc(user.displayName||"PingUs User")}</h2><p class="handle">@${esc((user.email||"user").split("@")[0])}</p><p class="profile-bio">Campus explorer · Making plans happen ✨</p><div class="stats"><div><strong>${stats.created}</strong><span>Created</span></div><div><strong>${stats.joined}</strong><span>Joined</span></div></div><button id="logoutBtn" class="secondary-btn full">Log out</button></div>`;
}

function updateAuthArea(user){
  const area=document.getElementById("authArea"); if(!area)return;
  area.innerHTML=user ? `<span class="hello-user">Hi, ${esc((user.displayName||"there").split(" ")[0])}</span><button id="logoutTop" class="profile-btn">Log out</button>` : `<a class="profile-btn" href="login.html">👤 Log in</a>`;
  document.getElementById("logoutTop")?.addEventListener("click",()=>auth.signOut());
}