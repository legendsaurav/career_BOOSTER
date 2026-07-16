function addEducation() {
    const section = document.getElementById('education-section');
    const idx = section.children.length;
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <input type="text" name="edu_degree_${idx}" placeholder="Degree (e.g. B.Tech)" required />
        <input type="text" name="edu_institute_${idx}" placeholder="Institute/Board" required />
        <input type="text" name="edu_score_${idx}" placeholder="CGPA/Percentage" />
        <input type="text" name="edu_year_${idx}" placeholder="Year" />
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
        <hr />
    `;
    section.appendChild(div);
}
// JavaScript for dynamic form sections and preview
function addExperience() {
    const section = document.getElementById('experience-section');
    const idx = section.children.length;
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <input type="text" name="exp_title_${idx}" placeholder="Title/Role" required />
        <input type="text" name="exp_org_${idx}" placeholder="Organization" required />
        <input type="text" name="exp_dates_${idx}" placeholder="Dates (e.g. Jan 2024 - Present)" />
        <input type="text" name="exp_loc_${idx}" placeholder="Location" />
        <textarea name="exp_desc_${idx}" placeholder="Description (bullets, comma separated)" rows="2"></textarea>
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
        <hr />
    `;
    section.appendChild(div);
}

function addProject() {
    const section = document.getElementById('projects-section');
    const idx = section.children.length;
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <input type="text" name="proj_name_${idx}" placeholder="Project Name" required />
        <input type="text" name="proj_role_${idx}" placeholder="Role" />
        <input type="text" name="proj_year_${idx}" placeholder="Year" />
        <input type="url" name="proj_link_${idx}" placeholder="Website Link" />
        <textarea name="proj_desc_${idx}" placeholder="Description (bullets, comma separated)" rows="2"></textarea>
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
        <hr />
    `;
    section.appendChild(div);
}

function addSkillGroup() {
    const section = document.getElementById('skills-section');
    const idx = section.children.length;
    const div = document.createElement('div');
    div.className = 'skills-group';
    div.innerHTML = `
        <input type="text" name="skill_group_${idx}" placeholder="Skill Group (e.g. Programming Languages)" required />
        <input type="text" name="skills_${idx}" placeholder="Skills (comma separated)" required />
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
        <hr />
    `;
    section.appendChild(div);
}

function addCourseGroup() {
    const section = document.getElementById('courses-section');
    const idx = section.children.length;
    const div = document.createElement('div');
    div.className = 'skills-group';
    div.innerHTML = `
        <input type="text" name="course_group_${idx}" placeholder="Course Group (e.g. Core Physics Courses)" required />
        <input type="text" name="courses_${idx}" placeholder="Courses (comma separated)" required />
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
        <hr />
    `;
    section.appendChild(div);
}

function addPosition() {
    const section = document.getElementById('positions-section');
    const idx = section.children.length;
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="text" name="pos_org_${idx}" placeholder="Organization" required />
        <input type="text" name="pos_role_${idx}" placeholder="Role" required />
        <input type="text" name="pos_dates_${idx}" placeholder="Dates" />
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    section.appendChild(li);
}

const CV_LOGO_URL = new URL('converted_image.png', window.location.href).toString();

const userForm = document.getElementById('userForm');
if (userForm) {
    userForm.onsubmit = function(e) {
    e.preventDefault();
    const data = new FormData(this);
    let html = `<div class='resume'>`;
    // Header
    html += `<header class='resume__header'><div class='brand'><img src='${CV_LOGO_URL}' class='brand__logo' /><div><h1>${data.get('name')||''}</h1><p>${data.get('degree')||''}</p><p>${data.get('institute')||''}</p></div></div><div class='contact'><p>${data.get('phone')||''}</p><p>${data.get('email')||''}</p><p>${data.get('github')||''}</p><p>${data.get('linkedin')||''}</p></div></header>`;
    // Education (static table with user input)
    html += `<section class='section'><div class='section__header'><h2>Education</h2></div>`;
    html += `<div class='table'>
        <div class='table__row table__row--head'>
            <span>DEGREE</span>
            <span>INSTITUTE/BOARD</span>
            <span>CGPA/PERCENTAGE</span>
            <span>YEAR</span>
        </div>
        <div class='table__row'>
            <span>Bachelor of Technology</span>
            <span>Indian Institute of Technology, Ropar</span>
            <span>${data.get('btech_cgpa')||''}</span>
            <span>${data.get('btech_year')||''}</span>
        </div>
        <div class='table__row'>
            <span>Senior Secondary</span>
            <span>Central Board of Secondary Education</span>
            <span>${data.get('senior_cgpa')||''}</span>
            <span>${data.get('senior_year')||''}</span>
        </div>
        <div class='table__row'>
            <span>Secondary</span>
            <span>Central Board of Secondary Education</span>
            <span>${data.get('secondary_cgpa')||''}</span>
            <span>${data.get('secondary_year')||''}</span>
        </div>
    </div>`;
    // Experience
    html += `<section class='section'><div class='section__header'><h2>Experience</h2></div>`;
    for(let i=0; data.get(`exp_title_${i}`); i++) {
        html += `<article class='item'><div class='item__row'><div><h3>${data.get(`exp_title_${i}`)} — ${data.get(`exp_org_${i}`)}</h3></div><div class='item__meta'><p>${data.get(`exp_dates_${i}`)||''}</p><p>${data.get(`exp_loc_${i}`)||''}</p></div></div><ul>`;
        (data.get(`exp_desc_${i}`)||'').split(',').forEach(b=>{if(b.trim()) html+=`<li>${b.trim()}</li>`});
        html += `</ul></article>`;
    }
    html += `</section>`;
    // Projects
    html += `<section class='section'><div class='section__header'><h2>Projects</h2></div>`;
    for(let i=0; data.get(`proj_name_${i}`); i++) {
        html += `<article class='item'><div class='item__row'><div><h3>${data.get(`proj_name_${i}`)}</h3><p class='item__sub'>${data.get(`proj_role_${i}`)||''}</p></div><div class='item__meta'><p>${data.get(`proj_year_${i}`)||''}</p><p>${data.get(`proj_link_${i}`)?`<a href='${data.get(`proj_link_${i}`)}' target='_blank'>Website</a>`:''}</p></div></div><ul>`;
        (data.get(`proj_desc_${i}`)||'').split(',').forEach(b=>{if(b.trim()) html+=`<li>${b.trim()}</li>`});
        html += `</ul></article>`;
    }
    html += `</section>`;
    // Skills
    html += `<section class='section'><div class='section__header'><h2>Technical Skills</h2></div>`;
    for(let i=0; data.get(`skill_group_${i}`); i++) {
        html += `<div class='skills-group'><p><strong>${data.get(`skill_group_${i}`)}</strong></p><ul>`;
        (data.get(`skills_${i}`)||'').split(',').forEach(s=>{if(s.trim()) html+=`<li>${s.trim()}</li>`});
        html += `</ul></div>`;
    }
    html += `</section>`;
    // Courses
    html += `<section class='section'><div class='section__header'><h2>Key Courses Taken</h2></div>`;
    for(let i=0; data.get(`course_group_${i}`); i++) {
        html += `<div class='skills-group'><p><strong>${data.get(`course_group_${i}`)}</strong></p><ul>`;
        (data.get(`courses_${i}`)||'').split(',').forEach(c=>{if(c.trim()) html+=`<li>${c.trim()}</li>`});
        html += `</ul></div>`;
    }
    html += `</section>`;
    // Positions
    html += `<section class='section'><div class='section__header'><h2>Positions of Responsibility</h2></div><ul>`;
    for(let i=0; data.get(`pos_org_${i}`); i++) {
        html += `<li>${data.get(`pos_org_${i}`)} — ${data.get(`pos_role_${i}`)} &middot; ${data.get(`pos_dates_${i}`)||''}</li>`;
    }
    html += `</ul></section>`;

    // Miscellaneous
    const miscRaw = (data.get('miscellaneous') || '').toString().trim();
    if (miscRaw) {
        const miscLines = miscRaw
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean);

        html += `<section class='section'><div class='section__header'><h2>MISCELLANEOUS</h2></div>`;

        if (miscLines.length > 1) {
            html += `<ul>`;
            miscLines.forEach(line => {
                const cleaned = line.replace(/^[-*•]\s*/, '').trim();
                if (cleaned) html += `<li>${cleaned}</li>`;
            });
            html += `</ul>`;
        } else {
            html += `<p>${miscLines[0]}</p>`;
        }

        html += `</section>`;
    }

    html += `</div>`;
    const previewEl = document.getElementById('preview');
    if (previewEl) previewEl.innerHTML = html;
    };
}

// Add print functionality
function printResume() {
    const preview = document.getElementById('preview');
    if (!preview.innerHTML.trim()) {
        alert('Please generate your resume preview first.');
        return;
    }
    const printWindow = window.open('', '', 'width=900,height=900');
    printWindow.document.write('<html><head><title>Print Resume</title>');
    // Copy styles
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(el => el.outerHTML).join('');
    printWindow.document.write(styles);
    printWindow.document.write('</head><body>');
    printWindow.document.write(preview.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
}

// Add print button after preview
window.addEventListener('DOMContentLoaded', function() {
    const preview = document.getElementById('preview');
    if (!preview || !preview.parentNode) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Print Resume';
    btn.style = 'margin: 18px 0 0 0; background: #0f0f0f; color: #fff; border: none; border-radius: 3px; padding: 8px 18px; font-size: 15px; cursor: pointer;';
    btn.onclick = printResume;
    preview.parentNode.insertBefore(btn, preview.nextSibling);
});

// Gemini AI API integration
const GEMINI_API_KEY = 'AIzaSyBZLZWwe83GKzIvwo9OgoaWuTCDx_6BtbA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;

async function enhanceWithGeminiAI(text, mode = 'bullets') {
    if (!text.trim()) return '';
    // Use Gemini API for enhancement
    const prompt = mode === 'bullets'
        ? `Convert the following paragraph into concise bullet points:\n${text}`
        : text;
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        return text;
    } catch (err) {
        alert('Gemini AI enhancement failed. Using original text.');
        return text;
    }
}

// Add Gemini AI button to all textarea fields
function addGeminiButtons() {
    document.querySelectorAll('textarea').forEach(textarea => {
        if (textarea.nextSibling && textarea.nextSibling.className === 'gemini-btn') return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Enhance with Gemini AI';
        btn.className = 'gemini-btn';
        btn.style = 'margin-bottom:8px;background:#4c4c4c;color:#fff;border:none;border-radius:3px;padding:5px 12px;font-size:13px;cursor:pointer;';
        btn.onclick = async function() {
            btn.disabled = true;
            btn.textContent = 'Enhancing...';
            const enhanced = await enhanceWithGeminiAI(textarea.value, 'bullets');
            textarea.value = enhanced;
            btn.disabled = false;
            btn.textContent = 'Enhance with Gemini AI';
        };
        textarea.parentNode.insertBefore(btn, textarea.nextSibling);
    });
}

// Re-add Gemini buttons when new fields are added
['addExperience','addProject','addSkillGroup','addCourseGroup','addPosition'].forEach(fn => {
    const orig = window[fn];
    window[fn] = function() {
        orig.apply(this, arguments);
        setTimeout(addGeminiButtons, 100);
    };
});

window.addEventListener('DOMContentLoaded', function() {
    addGeminiButtons();
});
