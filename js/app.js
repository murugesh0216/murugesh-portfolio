const $ = id => document.getElementById(id);
const GMAIL_RECEIVER_EMAIL = "rmurugesh126@gmail.com";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function scrollToId(id) {
  $(id)?.scrollIntoView({ behavior: "smooth" });
}

function firstMetric() {
  const r = data.results[0];
  return r ? r.value : "";
}

function renderVideoEmbed(url) {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = url.includes('youtu.be') ? url.split('/').pop().split('?')[0] : (url.split('v=')[1] || '').split('&')[0];
    return `<iframe src="https://www.youtube.com/embed/${esc(videoId)}" allowfullscreen></iframe>`;
  } else if (url.includes('vimeo.com')) {
    let videoId = url.split('/').pop().split('?')[0];
    return `<iframe src="https://player.vimeo.com/video/${esc(videoId)}" allowfullscreen></iframe>`;
  }
  return `<video controls src="${esc(url)}">Your browser does not support video playback.</video>`;
}

const CREATIVE_ICON = { video: "▶", image: "❑", carousel: "▤" };
function creativeTypeClass(t) { return (t || "").toLowerCase(); }

function render() {
  const p = data.profile;
  $("heroTitle").textContent = p.title;
  $("heroSummary").textContent = p.summary;
  $("aboutText").textContent = p.about;
  $("heroPills").innerHTML = data.pills.map(x => `<span class="pill">${esc(x)}</span>`).join("");
  $("footerName").innerHTML = esc(p.name) + ' <span class="dot"></span>';
  $("emailLink").href = "mailto:" + p.email;
  $("linkedinLink").href = p.linkedin;
  $("footerEmail").href = "mailto:" + p.email;
  $("footerLinkedin").href = p.linkedin;
  $("badgeMetric").textContent = firstMetric();

  // Profile photo
  const img = $("profileImg");
  if (p.photo) {
    img.src = p.photo;
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }

  $("stats").innerHTML = data.results.slice(0, 4).map(r =>
    `<div class="stat"><b>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`
  ).join("");

  $("resultsGrid").innerHTML = data.results.map(r =>
    `<div class="card result-card"><span class="tag">${esc(r.detail)}</span><div class="rv">${esc(r.value)}</div><b>${esc(r.label)}</b></div>`
  ).join("");

  $("servicesGrid").innerHTML = data.services.map(s =>
    `<article class="card"><div class="icon">↗</div><h3>${esc(s.title)}</h3><p class="muted">${esc(s.desc)}</p></article>`
  ).join("");

  $("projectsGrid").innerHTML = data.projects.map(p => {
    const results = (p.results || "").split("·").filter(x => x.trim()).slice(0, 3);
    const creatives = Array.isArray(p.creatives) ? p.creatives.filter(c => c.url) : [];
    const chips = creatives.map(c => {
      const t = creativeTypeClass(c.type);
      return `<a class="chip ${t}" href="${esc(c.url)}" target="_blank" rel="noopener">${CREATIVE_ICON[t] || "◆"} ${esc(c.label || (t.charAt(0).toUpperCase() + t.slice(1)))}</a>`;
    }).join("");
    const banner = p.imageUrl
      ? `<img src="${esc(p.imageUrl)}" class="project-img" alt="${esc(p.client)}">`
      : `<div class="project-noimg">${esc((p.client || "P").charAt(0))}</div>`;
    return `
    <article class="card project">
      ${banner}
      <div class="project-body">
        <span class="tag">${esc(p.category)}</span>
        <h3>${esc(p.client)}</h3>
        <p class="muted">${esc(p.summary)}</p>
        ${results.length ? `<div class="result-row">${results.map(x => `<span class="result">${esc(x.trim())}</span>`).join("")}</div>` : ""}
        ${chips ? `<div class="creative-chips">${chips}</div>` : ""}
        <div class="project-footer">
          <span class="ch">${esc(p.channels)}</span>
          <button class="text-btn" onclick="openProject(${p.id})">Full case study →</button>
        </div>
      </div>
    </article>`;
  }).join("");

  $("processGrid").innerHTML = data.process.map((p, i) => `
    <div class="time">
      <span class="step">Step ${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(p.title)}</h3>
      <p class="muted">${esc(p.desc)}</p>
    </div>`
  ).join("");
}

function openProject(id) {
  const p = data.projects.find(x => x.id === id);
  if (!p) return;
  const isGoliSoda = /South Asian Food Corporation|GoliSoda/i.test(p.client);
  const creatives = Array.isArray(p.creatives) ? p.creatives.filter(c => c.url) : [];
  const grouped = { video: [], image: [], carousel: [] };
  creatives.forEach(c => {
    const t = creativeTypeClass(c.type);
    if (grouped[t]) grouped[t].push(c);
  });
  function linkGroup(list) {
    return list.map(c => `<a href="${esc(c.url)}" target="_blank" rel="noopener">↗ ${esc(c.label || 'Open')}</a>`).join("");
  }

  $("modalContent").innerHTML = `
    <span class="tag">${esc(p.category)}</span>
    <h2>${esc(p.client)}</h2>
    <p class="muted"><b>Channels:</b> ${esc(p.channels)}</p>
    ${p.imageUrl ? `<div class="media-container"><img src="${esc(p.imageUrl)}" alt="Project showcase"></div>` : ''}
    ${p.videoUrl ? `<div class="media-container">${renderVideoEmbed(p.videoUrl)}</div>` : ''}
    <hr class="rule">
    <h3>Overview</h3><p>${esc(p.summary)}</p>
    <h3>The challenge</h3><p>${esc(p.challenge)}</p>
    <h3>Strategy & approach</h3><p>${esc(p.approach)}</p>
    <h3>Key responsibilities</h3><p>${esc(p.responsibilities)}</p>
    <h3>Key performance results</h3><p><b>${esc(p.results)}</b></p>
    ${creatives.length ? `
      <hr class="rule">
      <h3>Creative we ran</h3>
      ${grouped.video.length ? `<div class="media-label">▶ Video</div><div class="creative-links">${linkGroup(grouped.video)}</div>` : ''}
      ${grouped.image.length ? `<div class="media-label">❑ Image</div><div class="creative-links">${linkGroup(grouped.image)}</div>` : ''}
      ${grouped.carousel.length ? `<div class="media-label">▤ Carousel</div><div class="creative-links">${linkGroup(grouped.carousel)}</div>` : ''}
    ` : ''}
    ${isGoliSoda ? `
      <hr class="rule">
      <h3>Channel execution details</h3>
      <div class="channel-buttons">
        <button class="btn small secondary" onclick="openChannel('meta')">Meta Ads</button>
        <button class="btn small secondary" onclick="openChannel('google')">Google Ads</button>
        <button class="btn small secondary" onclick="openChannel('linkedin')">LinkedIn</button>
      </div>` : ''}
  `;
  $("modal").classList.add("open");
}

function openChannel(key) {
  const c = goliSodaDetails[key];
  if (!c) return;
  $("modalContent").innerHTML = `
    <span class="tag">${esc(c.title)}</span>
    <h2>${esc(c.subtitle)}</h2>
    <div class="channel-tabs">${c.tabs.map((t, i) => `<button class="btn small secondary ${i === 0 ? 'active' : ''}" onclick="showChannelTab('${key}',${i},this)">${esc(t[0])}</button>`).join('')}</div>
    <div id="channelBody" class="channel-content">${esc(c.tabs[0][1])}</div>
    ${c.campaigns ? `<h3>Key campaign types</h3><div class="channel-campaigns">${c.campaigns.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
  `;
  $("modal").classList.add("open");
}

function showChannelTab(key, i, btn) {
  document.querySelectorAll(".channel-tabs button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  $("channelBody").textContent = goliSodaDetails[key].tabs[i][1];
}

function closeModal() {
  $("modal").classList.remove("open");
}

function submitLead(e) {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit], button:last-of-type");
  const originalText = btn ? btn.textContent : "";
  const formName = $("leadName").value.trim();
  const formBusiness = $("leadBusiness").value.trim();
  const formBudget = $("leadBudget").value;
  const formMessage = $("leadMessage").value.trim();
  const recipientEmail = GMAIL_RECEIVER_EMAIL || data.profile.email;

  if (!formName || !formMessage) {
    alert("Please enter your name and project details before sending.");
    return;
  }

  const emailSubject = encodeURIComponent("Performance Marketing Inquiry — " + formName);
  const emailBody = encodeURIComponent(
    `Name: ${formName}\nBusiness / Website: ${formBusiness || "Not provided"}\nBudget: ${formBudget || "Not provided"}\n\nProject goals / questions:\n${formMessage}`
  );

  // If EmailJS is not configured yet, open the user's Gmail compose window directly.
  if (
    typeof EMAILJS_SERVICE_ID === "undefined" ||
    EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
    typeof EMAILJS_TEMPLATE_ID === "undefined" ||
    EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
  ) {
    if (btn) {
      btn.textContent = "Opening Gmail…";
      btn.disabled = true;
    }
    window.location.href = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;
    setTimeout(() => {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }, 1500);
    return;
  }

  // Show loading state
  if (btn) { btn.textContent = "Sending…"; btn.disabled = true; }

  const templateParams = {
    from_name:    formName,
    business:     formBusiness,
    budget:       formBudget,
    message:      formMessage,
    reply_to:     recipientEmail,
    to_email:     recipientEmail,
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      e.target.reset();
      if (btn) { btn.textContent = "✓ Message sent!"; btn.disabled = false; }
      setTimeout(() => { if (btn) btn.textContent = originalText; }, 4000);
    })
    .catch((err) => {
      console.error("EmailJS error:", err);
      if (btn) { btn.textContent = "Send failed — try again"; btn.disabled = false; }
      setTimeout(() => { if (btn) btn.textContent = originalText; }, 4000);
    });
}

// Modal event listeners
document.addEventListener("DOMContentLoaded", () => {
  $("modal")?.addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
});
