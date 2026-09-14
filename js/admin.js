const STORAGE_KEY = "murugeshPortfolioPro";
let data = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultData);
    // migrate: ensure every project has a creatives array & photo exists
    saved.projects = (saved.projects || []).map(p => ({ ...p, creatives: Array.isArray(p.creatives) ? p.creatives : [] }));
    if (!saved.profile.photo) saved.profile.photo = DEFAULT_PHOTO;
    return saved;
  } catch (e) {
    return structuredClone(defaultData);
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    alert("Couldn't save — storage may be full (large images).");
  }
  render();
  renderAdmin();
}

function renderAdmin() {
  $("adminPills").innerHTML = data.pills.map((pill, idx) => `
    <div class="edit-row"><span>${esc(pill)}</span>
      <button class="btn small secondary" onclick="editPill(${idx})">Edit</button>
      <button class="btn small danger" onclick="deletePill(${idx})">Delete</button></div>`).join("");

  $("adminServices").innerHTML = data.services.map(s => `
    <div class="edit-row"><span>${esc(s.title)}</span>
      <button class="btn small secondary" onclick="editService(${s.id})">Edit</button>
      <button class="btn small danger" onclick="deleteItem('services',${s.id})">Delete</button></div>`).join("");

  $("adminProjects").innerHTML = data.projects.map(p => `
    <div class="edit-row"><span>${esc(p.client)}</span>
      <button class="btn small secondary" onclick="openProject(${p.id})">View</button>
      <button class="btn small secondary" onclick="editProject(${p.id})">Edit</button>
      <button class="btn small danger" onclick="deleteItem('projects',${p.id})">Delete</button></div>`).join("");

  $("adminResults").innerHTML = data.results.map(r => `
    <div class="edit-row"><span>${esc(r.value)} — ${esc(r.label)}</span>
      <button class="btn small secondary" onclick="editResult(${r.id})">Edit</button>
      <button class="btn small danger" onclick="deleteItem('results',${r.id})">Delete</button></div>`).join("");

  $("adminProcess").innerHTML = data.process.map(p => `
    <div class="edit-row"><span>${esc(p.title)}</span>
      <button class="btn small secondary" onclick="editProcess(${p.id})">Edit</button>
      <button class="btn small danger" onclick="deleteItem('process',${p.id})">Delete</button></div>`).join("");
}

let adminOpen = false;
function toggleAdmin() {
  adminOpen = !adminOpen;
  $("adminPanel").classList.toggle("open", adminOpen);
  $("photoTools").classList.toggle("show", adminOpen);
}

/* ---------- Profile ---------- */
function editProfile() {
  const p = data.profile;
  $("modalContent").innerHTML = `
    <h2>Edit profile</h2>
    <form class="form" onsubmit="saveProfile(event)">
      <div><label>Name</label><input id="fName" value="${esc(p.name)}"></div>
      <div><label>Hero headline</label><input id="fTitle" value="${esc(p.title)}"></div>
      <div><label>Hero summary</label><textarea id="fSummary">${esc(p.summary)}</textarea></div>
      <div><label>About narrative</label><textarea id="fAbout">${esc(p.about)}</textarea></div>
      <div><label>Email</label><input id="fEmail" value="${esc(p.email)}"></div>
      <div><label>LinkedIn URL</label><input id="fLinkedin" value="${esc(p.linkedin)}"></div>
      <hr class="rule">
      <h3 style="margin:0;">Profile photo</h3>
      <p class="modal-hint">Paste an image URL, or upload a file from your device.</p>
      <div><label>Photo URL</label><input id="fPhotoUrl" placeholder="https://example.com/photo.jpg" value="${p.photo && !p.photo.startsWith('data:') ? esc(p.photo) : ''}"></div>
      <div><label>Or upload file</label><input id="fPhotoFile" type="file" accept="image/*" onchange="handlePhotoUpload(event)"></div>
      <button class="btn primary">Save profile</button>
    </form>`;
  $("modal").classList.add("open");
}

let pendingPhoto = null;
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2.5 * 1024 * 1024) {
    alert("Please use an image under 2.5 MB.");
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { pendingPhoto = reader.result; };
  reader.readAsDataURL(file);
}

function saveProfile(e) {
  e.preventDefault();
  let photo = data.profile.photo;
  if (pendingPhoto) photo = pendingPhoto;
  else if ($("fPhotoUrl").value.trim()) photo = $("fPhotoUrl").value.trim();
  data.profile = {
    name: $("fName").value,
    title: $("fTitle").value,
    summary: $("fSummary").value,
    about: $("fAbout").value,
    email: $("fEmail").value,
    linkedin: $("fLinkedin").value,
    photo
  };
  pendingPhoto = null;
  save();
  closeModal();
}

function editPhoto() { editProfile(); }

function deletePhoto() {
  if (!confirm("Remove the profile photo?")) return;
  data.profile.photo = "";
  save();
}

/* ---------- Pills ---------- */
function pillForm(idx = -1) {
  const val = idx >= 0 ? data.pills[idx] : "";
  $("modalContent").innerHTML = `
    <h2>${idx >= 0 ? "Edit" : "Add"} skill</h2>
    <form class="form" onsubmit="savePill(event,${idx})">
      <div><label>Skill name</label><input id="pillVal" value="${esc(val)}" required></div>
      <button class="btn primary">Save skill</button>
    </form>`;
  $("modal").classList.add("open");
}
function addPill() { pillForm(); }
function editPill(idx) { pillForm(idx); }
function savePill(e, idx) {
  e.preventDefault();
  if (idx >= 0) data.pills[idx] = $("pillVal").value;
  else data.pills.push($("pillVal").value);
  save();
  closeModal();
}
function deletePill(idx) {
  if (!confirm("Delete this skill?")) return;
  data.pills.splice(idx, 1);
  save();
}

/* ---------- Services ---------- */
function serviceForm(s = {}) {
  $("modalContent").innerHTML = `
    <h2>${s.id ? "Edit" : "Add"} service</h2>
    <form class="form" onsubmit="saveService(event,${s.id || 0})">
      <div><label>Service title</label><input id="sTitle" value="${esc(s.title || "")}" required></div>
      <div><label>Description</label><textarea id="sDesc" required>${esc(s.desc || "")}</textarea></div>
      <button class="btn primary">Save service</button>
    </form>`;
  $("modal").classList.add("open");
}
function addService() { serviceForm(); }
function editService(id) { serviceForm(data.services.find(x => x.id === id)); }
function saveService(e, id) {
  e.preventDefault();
  const obj = { id: id || Date.now(), title: $("sTitle").value, desc: $("sDesc").value };
  if (id) data.services = data.services.map(x => x.id === id ? obj : x);
  else data.services.push(obj);
  save();
  closeModal();
}

/* ---------- Projects (with dynamic creative links) ---------- */
function creativeRowHtml(c = {}) {
  const t = (c.type || "video");
  return `
  <div class="cr-row">
    <select class="cr-type">
      <option value="video" ${t === 'video' ? 'selected' : ''}>Video</option>
      <option value="image" ${t === 'image' ? 'selected' : ''}>Image</option>
      <option value="carousel" ${t === 'carousel' ? 'selected' : ''}>Carousel</option>
    </select>
    <input class="cr-label" placeholder="Label (e.g. Reel 01)" value="${esc(c.label || "")}">
    <input class="cr-url" placeholder="https://link-to-creative" value="${esc(c.url || "")}">
    <button type="button" class="rm-btn" onclick="this.parentElement.remove()">×</button>
  </div>`;
}

function addCreativeRow() {
  const wrap = $("creativeRows");
  wrap.insertAdjacentHTML("beforeend", creativeRowHtml());
}

function projectForm(p = {}) {
  const creatives = Array.isArray(p.creatives) ? p.creatives : [];
  $("modalContent").innerHTML = `
    <h2>${p.id ? "Edit" : "Add"} case study</h2>
    <form class="form" onsubmit="saveProject(event,${p.id || 0})">
      <div><label>Client name</label><input id="pClient" value="${esc(p.client || "")}" required></div>
      <div><label>Category</label><input id="pCategory" value="${esc(p.category || "")}"></div>
      <div><label>Channels used</label><input id="pChannels" value="${esc(p.channels || "")}"></div>
      <div><label>Project banner image link (URL)</label><input id="pImageUrl" placeholder="https://example.com/banner.jpg" value="${esc(p.imageUrl || "")}"></div>
      <div><label>Main project video link (YouTube, Vimeo, or MP4)</label><input id="pVideoUrl" placeholder="https://youtube.com/watch?v=..." value="${esc(p.videoUrl || "")}"></div>
      <hr class="rule">
      <h3 style="margin:0;">Creative we ran</h3>
      <p class="modal-hint">Add each asset as a link — video, image, or carousel. These appear on the card and inside the case study.</p>
      <div class="creative-editor">
        <div id="creativeRows">${creatives.map(creativeRowHtml).join("")}</div>
        <button type="button" class="btn small secondary" style="margin-top:8px;" onclick="addCreativeRow()">＋ Add creative link</button>
      </div>
      <hr class="rule">
      <div><label>Summary</label><textarea id="pSummary">${esc(p.summary || "")}</textarea></div>
      <div><label>Challenge</label><textarea id="pChallenge">${esc(p.challenge || "")}</textarea></div>
      <div><label>Approach</label><textarea id="pApproach">${esc(p.approach || "")}</textarea></div>
      <div><label>Responsibilities</label><textarea id="pResponsibilities">${esc(p.responsibilities || "")}</textarea></div>
      <div><label>Key results (separate points with ·)</label><textarea id="pResults">${esc(p.results || "")}</textarea></div>
      <button class="btn primary">Save case study</button>
    </form>`;
  $("modal").classList.add("open");
}

function collectCreatives() {
  return Array.from(document.querySelectorAll("#creativeRows .cr-row")).map(row => ({
    type: row.querySelector(".cr-type").value,
    label: row.querySelector(".cr-label").value.trim(),
    url: row.querySelector(".cr-url").value.trim()
  })).filter(c => c.url);
}

function addProject() { projectForm(); }
function editProject(id) { projectForm(data.projects.find(x => x.id === id)); }
function saveProject(e, id) {
  e.preventDefault();
  const obj = {
    id: id || Date.now(),
    client: $("pClient").value,
    category: $("pCategory").value,
    channels: $("pChannels").value,
    imageUrl: $("pImageUrl").value,
    videoUrl: $("pVideoUrl").value,
    creatives: collectCreatives(),
    summary: $("pSummary").value,
    challenge: $("pChallenge").value,
    approach: $("pApproach").value,
    responsibilities: $("pResponsibilities").value,
    results: $("pResults").value
  };
  if (id) data.projects = data.projects.map(x => x.id === id ? obj : x);
  else data.projects.push(obj);
  save();
  closeModal();
}

/* ---------- Results ---------- */
function resultForm(r = {}) {
  $("modalContent").innerHTML = `
    <h2>${r.id ? "Edit" : "Add"} metric</h2>
    <form class="form" onsubmit="saveResult(event,${r.id || 0})">
      <div><label>Value (e.g. 35K+)</label><input id="rValue" value="${esc(r.value || "")}" required></div>
      <div><label>Label</label><input id="rLabel" value="${esc(r.label || "")}" required></div>
      <div><label>Detail / context</label><input id="rDetail" value="${esc(r.detail || "")}"></div>
      <button class="btn primary">Save metric</button>
    </form>`;
  $("modal").classList.add("open");
}
function addResult() { resultForm(); }
function editResult(id) { resultForm(data.results.find(x => x.id === id)); }
function saveResult(e, id) {
  e.preventDefault();
  const obj = { id: id || Date.now(), value: $("rValue").value, label: $("rLabel").value, detail: $("rDetail").value };
  if (id) data.results = data.results.map(x => x.id === id ? obj : x);
  else data.results.push(obj);
  save();
  closeModal();
}

/* ---------- Process ---------- */
function processForm(p = {}) {
  $("modalContent").innerHTML = `
    <h2>${p.id ? "Edit" : "Add"} process step</h2>
    <form class="form" onsubmit="saveProcess(event,${p.id || 0})">
      <div><label>Step title</label><input id="prTitle" value="${esc(p.title || "")}" required></div>
      <div><label>Step description</label><textarea id="prDesc" required>${esc(p.desc || "")}</textarea></div>
      <button class="btn primary">Save step</button>
    </form>`;
  $("modal").classList.add("open");
}
function addProcess() { processForm(); }
function editProcess(id) { processForm(data.process.find(x => x.id === id)); }
function saveProcess(e, id) {
  e.preventDefault();
  const obj = { id: id || Date.now(), title: $("prTitle").value, desc: $("prDesc").value };
  if (id) data.process = data.process.map(x => x.id === id ? obj : x);
  else data.process.push(obj);
  save();
  closeModal();
}

function deleteItem(type, id) {
  if (!confirm("Delete this item?")) return;
  data[type] = data[type].filter(x => x.id !== id);
  save();
}

function resetData() {
  if (!confirm("Reset all content back to the default portfolio?")) return;
  data = structuredClone(defaultData);
  save();
}

// Initial render
document.addEventListener("DOMContentLoaded", () => {
  render();
  renderAdmin();
});
