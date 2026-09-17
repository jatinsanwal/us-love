import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const gate = document.getElementById('authGate')
const form = document.getElementById('authForm')
const email = document.getElementById('authEmail')
const password = document.getElementById('authPassword')
const submit = document.getElementById('authSubmit')
const status = document.getElementById('authStatus')
const loginTab = document.getElementById('loginTab')
const signupTab = document.getElementById('signupTab')
const logout = document.getElementById('logoutBtn')

let mode = 'login'

document.body.classList.add('auth-loading')

function setMode(next) {
  mode = next
  const login = mode === 'login'

  loginTab.classList.toggle('active', login)
  signupTab.classList.toggle('active', !login)

  submit.textContent = login
    ? 'Login to Our World ❤️'
    : 'Create Our Account ❤️'

  password.autocomplete = login
    ? 'current-password'
    : 'new-password'

  status.textContent = ''
  status.className = 'auth-status'
}

function message(text, error = false) {
  status.textContent = text
  status.className = error
    ? 'auth-status error'
    : 'auth-status'
}

loginTab.addEventListener('click', () => setMode('login'))
signupTab.addEventListener('click', () => setMode('signup'))

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  submit.disabled = true
  message(mode === 'login'
    ? 'Logging in…'
    : 'Creating account…'
  )

  try {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value
      })

      if (error) throw error

      if (data.session) {
        message('Account created. Opening your world…')
      } else {
        message('Account created! Please log in. 💗')
        setMode('login')
      }
    } else {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.value.trim(),
          password: password.value
        })

      if (error) throw error

      message('Login successful. Opening your world…')
    }
  } catch (error) {
    message(
      error.message ||
      'Something went wrong. Please try again.',
      true
    )
  } finally {
    submit.disabled = false
  }
})

logout.addEventListener('click', async () => {
  await supabase.auth.signOut()
})

function showApp(session) {
  const loggedIn = !!session

  gate.style.display = loggedIn ? 'none' : 'grid'
  logout.style.display = loggedIn ? 'block' : 'none'

  document.body.classList.toggle(
    'auth-loading',
    !loggedIn
  )
}

/* REAL COUPLE PROFILE DATA */
async function loadCoupleProfiles() {
  const { data, error } =
    await supabase.rpc('get_my_couple_profiles')

  if (error) {
    console.error('Profile loading error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No couple profile found yet.')
    return
  }

  console.log('Real couple profiles:', data)

  const me = data[0]
  const partner = data[1]

  /* Home heading */
  const homeTitle = document.querySelector('.hero h1')

  if (homeTitle) {
    if (me && partner) {
      homeTitle.textContent =
        `${me.name || 'You'} & ${partner.name || 'Partner'}`
    } else if (me) {
      homeTitle.textContent =
        me.name || 'Your World'
    }
  }

  /* Home avatars */
  const avatars =
    document.querySelectorAll('.person')

  if (me && me.photo_url && avatars[0]) {
    const img = avatars[0].querySelector('img')
    if (img) {
      img.src = me.photo_url
    }
  }

  if (partner && partner.photo_url && avatars[1]) {
    const img = avatars[1].querySelector('img')
    if (img) {
      img.src = partner.photo_url
    }
  }
}

async function initializeApp(session) {
  showApp(session)

  if (session) {
    await loadCoupleProfiles()
  }
}

/* Restore login session */
const {
  data: { session }
} = await supabase.auth.getSession()

await initializeApp(session)

/* Watch login/logout */
supabase.auth.onAuthStateChange(
  async (_event, nextSession) => {
    await initializeApp(nextSession)
  }
)

/* Keep Supabase available */
window.supabaseClient = supabase
/* =========================================
   STEP 15 — REAL RELATIONSHIP DATES
========================================= */

const togetherNumber = document.querySelector('.together b')
const togetherText = document.querySelector('.together span')
const settingsButton = document.querySelector('.gear')

let ourSettings = null
let myProfile = null
let partnerProfile = null

function formatDate(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function daysBetween(startDate) {
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()

  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return Math.max(
    0,
    Math.floor(
      (today - start) / (1000 * 60 * 60 * 24)
    )
  )
}

function updateTogetherCounter() {
  if (!ourSettings?.relationship_start_date) return

  const start =
    ourSettings.relationship_start_date

  const days = daysBetween(start)

  if (!togetherNumber || !togetherText) return

  const startDate =
    new Date(start + 'T00:00:00')

  const today = new Date()

  let years =
    today.getFullYear() -
    startDate.getFullYear()

  const anniversaryThisYear =
    new Date(
      today.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    )

  if (today < anniversaryThisYear) {
    years--
  }

  if (years >= 1) {
    togetherNumber.textContent = years
    togetherText.textContent =
      years === 1
        ? 'beautiful year together'
        : 'beautiful years together'
  } else {
    togetherNumber.textContent = days
    togetherText.textContent =
      'beautiful days together'
  }
}

async function loadOurSettings() {
  const { data, error } =
    await supabase.rpc('get_our_settings')

  if (error) {
    console.error(
      'Settings loading error:',
      error
    )
    return
  }

  ourSettings = data?.[0] || null

  updateTogetherCounter()
}

async function loadMyProfile() {
  const { data, error } =
    await supabase.rpc(
      'get_my_couple_profiles'
    )

  if (error) {
    console.error(
      'Profile loading error:',
      error
    )
    return
  }

  if (!data || data.length === 0) return

  myProfile = data.find(
    p => p.id === sessionUserId
  )

  partnerProfile =
    data.find(
      p => p.id !== sessionUserId
    ) || null
}

let sessionUserId = null

async function openRelationshipSettings() {

  const { data: { session } } =
    await supabase.auth.getSession()

  if (!session) return

  sessionUserId = session.user.id

  await loadOurSettings()
  await loadMyProfile()

  const old = document.getElementById(
    'relationshipSettings'
  )

  if (old) old.remove()

  const modal =
    document.createElement('div')

  modal.id = 'relationshipSettings'

  modal.innerHTML = `
    <div class="rs-overlay">
      <div class="rs-card">

        <div class="rs-head">
          <div>
            <div class="rs-title">
              💗 Our Dates
            </div>
            <div class="rs-sub">
              ये dates बाद में भी बदल सकते हो
            </div>
          </div>

          <button id="rsClose">×</button>
        </div>

        <label>
          💕 Relationship Start Date
        </label>

        <input
          id="rsStart"
          type="date"
          value="${
            ourSettings?.relationship_start_date || ''
          }"
        >

        <label>
          ✨ Special Date
        </label>

        <input
          id="rsSpecial"
          type="date"
          value="${
            ourSettings?.special_date || ''
          }"
        >

        <label>
          📝 Special Date Name
        </label>

        <input
          id="rsSpecialTitle"
          type="text"
          placeholder="Our Anniversary"
          value="${
            ourSettings?.special_date_title || ''
          }"
        >

        <label>
          🎂 My Birthday
        </label>

        <input
          id="rsBirthday"
          type="date"
          value="${
            myProfile?.birthday || ''
          }"
        >

        <button
          id="rsSave"
          class="rs-save"
        >
          Save Our Dates 💗
        </button>

        <div id="rsStatus"></div>

      </div>
    </div>
  `

  document.body.appendChild(modal)

  document.getElementById(
    'rsClose'
  ).onclick = () => modal.remove()

  document.getElementById(
    'rsSave'
  ).onclick = async () => {

    const start =
      document.getElementById(
        'rsStart'
      ).value

    const special =
      document.getElementById(
        'rsSpecial'
      ).value || null

    const title =
      document.getElementById(
        'rsSpecialTitle'
      ).value.trim()

    const birthday =
      document.getElementById(
        'rsBirthday'
      ).value || null

    if (!start) {
      document.getElementById(
        'rsStatus'
      ).textContent =
        'Relationship start date डालो 💗'

      return
    }

    const saveButton =
      document.getElementById('rsSave')

    saveButton.disabled = true
    saveButton.textContent =
      'Saving… 💗'

    const { error } =
      await supabase.rpc(
        'save_our_settings',
        {
          p_relationship_start_date:
            start,

          p_special_date:
            special,

          p_special_date_title:
            title,

          p_my_birthday:
            birthday
        }
      )

    if (error) {

      document.getElementById(
        'rsStatus'
      ).textContent =
        error.message

      saveButton.disabled = false
      saveButton.textContent =
        'Save Our Dates 💗'

      return
    }

    ourSettings = {
      ...ourSettings,
      relationship_start_date:
        start,
      special_date:
        special,
      special_date_title:
        title
    }

    updateTogetherCounter()

    document.getElementById(
      'rsStatus'
    ).textContent =
      'Dates saved successfully 💗'

    saveButton.textContent =
      'Saved ✓'

    setTimeout(() => {
      modal.remove()
    }, 900)
  }
}

/* Open settings from the existing ⚙ button */
if (settingsButton) {
  settingsButton.onclick =
    openRelationshipSettings
}

/* Add settings styles */
const rsStyle =
  document.createElement('style')

rsStyle.textContent = `
#relationshipSettings{
  position:fixed;
  inset:0;
  z-index:10000;
}

.rs-overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  background:rgba(55,30,48,.28);
  backdrop-filter:blur(8px);
}

.rs-card{
  width:min(620px,100%);
  max-height:90vh;
  overflow:auto;
  background:#fff8fc;
  border-radius:28px 28px 0 0;
  padding:22px 18px 30px;
  box-shadow:0 -18px 60px rgba(70,35,60,.22);
  animation:rsUp .28s ease-out;
}

@keyframes rsUp{
  from{
    transform:translateY(40px);
    opacity:0;
  }
  to{
    transform:none;
    opacity:1;
  }
}

.rs-head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:18px;
}

.rs-title{
  font-size:20px;
  font-weight:900;
  color:#482b3f;
}

.rs-sub{
  margin-top:4px;
  color:#927486;
  font-size:11px;
}

.rs-head button{
  border:0;
  width:36px;
  height:36px;
  border-radius:12px;
  background:#f1e8ee;
  font-size:22px;
  color:#67465a;
}

.rs-card label{
  display:block;
  margin:13px 0 6px;
  color:#67465a;
  font-size:12px;
  font-weight:800;
}

.rs-card input{
  width:100%;
  padding:13px;
  border:1px solid #ead7e3;
  border-radius:14px;
  background:#fff;
  color:#5f4052;
  font:inherit;
  outline:none;
}

.rs-card input:focus{
  border-color:#ff69a9;
  box-shadow:0 0 0 3px rgba(255,105,169,.10);
}

.rs-save{
  width:100%;
  margin-top:20px;
  padding:14px;
  border:0;
  border-radius:15px;
  color:#fff;
  font-weight:900;
  font-size:15px;
  background:linear-gradient(100deg,#ff4c98,#9e82ff);
}

.rs-save:disabled{
  opacity:.65;
}

#rsStatus{
  text-align:center;
  margin-top:10px;
  color:#76566a;
  font-size:12px;
}
`

document.head.appendChild(rsStyle)
