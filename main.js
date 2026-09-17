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
const gear = document.querySelector('.gear')
const togetherBox = document.querySelector('.together')

let mode = 'login'
let counterTimer = null
let relationshipStartAt = null

// Demo starting moment:
// 11 June 2024, 12:00 PM local/device time
const DEMO_START_AT = '2024-06-11T12:00:00'

// =====================================================
// AUTH
// =====================================================

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

  message(
    mode === 'login'
      ? 'Logging in…'
      : 'Creating account…'
  )

  try {
    if (mode === 'signup') {

      const { data, error } =
        await supabase.auth.signUp({
          email: email.value.trim(),
          password: password.value
        })

      if (error) throw error

      if (data.session) {
        message('Account created. Opening your world…')
      } else {
        message(
          'Account created! Check your email and confirm it, then log in. 💗'
        )

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


// =====================================================
// HEADER — SETTINGS + LOGOUT FIX
// =====================================================

if (gear && logout) {

  const top = document.querySelector('.top')

  const actions =
    document.createElement('div')

  actions.className = 'top-actions-fixed'

  gear.replaceWith(actions)

  actions.appendChild(gear)
  actions.appendChild(logout)

  Object.assign(actions.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    flexShrink: '0'
  })

  Object.assign(logout.style, {
    position: 'static',
    right: 'auto',
    top: 'auto',
    zIndex: 'auto',
    margin: '0'
  })

  if (top) {
    top.style.display = 'flex'
    top.style.alignItems = 'center'
    top.style.justifyContent = 'space-between'
    top.style.gap = '10px'
  }
}


// =====================================================
// DATE HELPERS
// =====================================================

function parseStoredStart(value) {

  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function clampMonthDate(
  date,
  year,
  month
) {

  const day = date.getDate()

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    ).getDate()

  return new Date(
    year,
    month,
    Math.min(day, lastDay),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  )
}


// =====================================================
// EXACT CALENDAR ELAPSED TIME
// =====================================================

function elapsedCalendar(start, end) {

  if (end < start) {

    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  }

  let cursor = new Date(start)

  // YEARS
  let years =
    end.getFullYear() -
    cursor.getFullYear()

  let anniversary =
    new Date(cursor)

  anniversary.setFullYear(
    cursor.getFullYear() + years
  )

  if (anniversary > end) {

    years -= 1

    anniversary =
      new Date(cursor)

    anniversary.setFullYear(
      cursor.getFullYear() + years
    )
  }

  cursor = anniversary


  // MONTHS
  let months =
    end.getMonth() -
    cursor.getMonth()

  if (months < 0) {
    months += 12
  }

  let monthPoint =
    clampMonthDate(
      cursor,
      cursor.getFullYear(),
      cursor.getMonth() + months
    )

  if (monthPoint > end) {

    months -= 1

    monthPoint =
      clampMonthDate(
        cursor,
        cursor.getFullYear(),
        cursor.getMonth() + months
      )
  }

  cursor = monthPoint


  // REMAINING TIME
  let remaining =
    Math.max(
      0,
      end.getTime() -
      cursor.getTime()
    )

  const SECOND = 1000
  const MINUTE = 60 * SECOND
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  const days =
    Math.floor(
      remaining / DAY
    )

  remaining %= DAY

  const hours =
    Math.floor(
      remaining / HOUR
    )

  remaining %= HOUR

  const minutes =
    Math.floor(
      remaining / MINUTE
    )

  remaining %= MINUTE

  const seconds =
    Math.floor(
      remaining / SECOND
    )

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds
  }
}


// =====================================================
// LIVE TOGETHER COUNTER
// =====================================================

function updateTogetherCounter() {

  if (!togetherBox ||
      !relationshipStartAt) {
    return
  }

  const start =
    parseStoredStart(
      relationshipStartAt
    )

  if (!start) return

  const now = new Date()

  const e =
    elapsedCalendar(
      start,
      now
    )

  const years =
    `${e.years} ${
      e.years === 1
        ? 'Year'
        : 'Years'
    }`

  const months =
    `${e.months} ${
      e.months === 1
        ? 'Month'
        : 'Months'
    }`

  const days =
    `${e.days} ${
      e.days === 1
        ? 'Day'
        : 'Days'
    }`

  const hours =
    String(e.hours)
      .padStart(2, '0')

  const minutes =
    String(e.minutes)
      .padStart(2, '0')

  const seconds =
    String(e.seconds)
      .padStart(2, '0')


  togetherBox.innerHTML = `
    <b>
      ${years} · ${months} · ${days}
    </b>

    <span>
      ${hours}h · ${minutes}m · ${seconds}s
      &nbsp;•&nbsp; together 💗
    </span>
  `
}

function startTogetherCounter() {

  if (counterTimer) {
    clearInterval(counterTimer)
  }

  updateTogetherCounter()

  counterTimer =
    setInterval(
      updateTogetherCounter,
      1000
    )
}


// =====================================================
// DATETIME INPUT
// =====================================================

function localDateTimeValue(date) {

  const pad =
    n => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`
}


function makeLocalDate(value) {

  if (!value) return null

  const [datePart, timePart = '00:00'] =
    value.split('T')

  const [year, month, day] =
    datePart
      .split('-')
      .map(Number)

  const [hours, minutes] =
    timePart
      .split(':')
      .map(Number)

  if (
    ![
      year,
      month,
      day,
      hours,
      minutes
    ].every(Number.isFinite)
  ) {
    return null
  }

  return new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  )
}


// =====================================================
// SETTINGS MODAL
// =====================================================

function showSettingsModal() {

  const old =
    document.getElementById(
      'relationshipSettingsModal'
    )

  if (old) old.remove()

  const current =
    parseStoredStart(
      relationshipStartAt
    ) ||
    new Date(DEMO_START_AT)


  const modal =
    document.createElement('div')

  modal.id =
    'relationshipSettingsModal'


  modal.innerHTML = `

    <div class="rs-backdrop"></div>

    <div
      class="rs-card"
      role="dialog"
      aria-modal="true"
    >

      <button
        class="rs-close"
        type="button"
        aria-label="Close"
      >
        ×
      </button>

      <div class="rs-kicker">
        OUR LITTLE WORLD 💗
      </div>

      <h2>
        Our Starting Moment
      </h2>

      <p>
        यहाँ अपनी असली starting date और exact time डाल सकते हो।
        अभी demo date लगी हुई है।
      </p>

      <label>
        We started on

        <input
          id="relationshipStartInput"
          type="datetime-local"
          value="${localDateTimeValue(current)}"
        >
      </label>

      <div
        class="rs-preview"
        id="rsPreview"
      ></div>

      <button
        class="rs-save"
        id="saveRelationshipStart"
        type="button"
      >
        Save Starting Moment ❤️
      </button>

      <div
        class="rs-status"
        id="rsStatus"
      ></div>

    </div>
  `


  document.body.appendChild(modal)


  const input =
    modal.querySelector(
      '#relationshipStartInput'
    )

  const preview =
    modal.querySelector(
      '#rsPreview'
    )

  const statusEl =
    modal.querySelector(
      '#rsStatus'
    )


  function previewCounter() {

    const date =
      makeLocalDate(
        input.value
      )

    if (!date) {

      preview.textContent = ''

      return
    }

    const e =
      elapsedCalendar(
        date,
        new Date()
      )

    preview.textContent =
      `${e.years}y ${e.months}m ${e.days}d · ` +
      `${String(e.hours).padStart(2, '0')}h ` +
      `${String(e.minutes).padStart(2, '0')}m ` +
      `${String(e.seconds).padStart(2, '0')}s`
  }


  input.addEventListener(
    'input',
    previewCounter
  )

  previewCounter()


  const close =
    () => modal.remove()

  modal
    .querySelector('.rs-close')
    .addEventListener(
      'click',
      close
    )

  modal
    .querySelector('.rs-backdrop')
    .addEventListener(
      'click',
      close
    )


  // SAVE
  modal
    .querySelector(
      '#saveRelationshipStart'
    )
    .addEventListener(
      'click',
      async () => {

        const local =
          makeLocalDate(
            input.value
          )

        if (!local) {

          statusEl.textContent =
            'Please choose a valid date and time.'

          return
        }


        // Convert device local time
        // into a real timestamp.
        const iso =
          local.toISOString()


        const button =
          modal.querySelector(
            '#saveRelationshipStart'
          )

        button.disabled = true

        statusEl.textContent =
          'Saving…'


        try {

          const {
            error
          } =
            await supabase.rpc(
              'save_our_settings',
              {
                p_relationship_start_at:
                  iso,

                p_special_date:
                  null,

                p_special_date_title:
                  null
              }
            )


          if (error) {
            throw error
          }


          relationshipStartAt =
            iso

          localStorage.setItem(
            'us_relationship_start_at',
            iso
          )


          startTogetherCounter()


          statusEl.textContent =
            'Saved successfully! 💗'


          setTimeout(
            close,
            600
          )

        } catch (error) {

          // Local fallback
          localStorage.setItem(
            'us_relationship_start_at',
            iso
          )

          relationshipStartAt =
            iso

          startTogetherCounter()


          statusEl.textContent =
            'Saved on this device. 💗'
        }


        button.disabled = false
      }
    )
}


// =====================================================
// LOAD RELATIONSHIP START
// =====================================================

async function loadRelationshipStart() {

  try {

    const {
      data,
      error
    } =
      await supabase.rpc(
        'get_our_settings'
      )


    if (
      !error &&
      data
    ) {

      const row =
        Array.isArray(data)
          ? data[0]
          : data


      if (
        row &&
        row.relationship_start_at
      ) {

        relationshipStartAt =
          row.relationship_start_at

        localStorage.setItem(
          'us_relationship_start_at',
          row.relationship_start_at
        )

        startTogetherCounter()

        return
      }
    }

  } catch (_) {
    // Use fallback below.
  }


  const local =
    localStorage.getItem(
      'us_relationship_start_at'
    )


  relationshipStartAt =
    local ||
    DEMO_START_AT


  startTogetherCounter()
}


// =====================================================
// SETTINGS BUTTON
// =====================================================

if (gear) {

  gear.removeAttribute('onclick')

  gear.addEventListener(
    'click',
    showSettingsModal
  )
}


// =====================================================
// SHOW / HIDE APP
// =====================================================

function showApp(session) {

  const loggedIn =
    !!session

  gate.style.display =
    loggedIn
      ? 'none'
      : 'grid'

  logout.style.display =
    loggedIn
      ? 'block'
      : 'none'

  document.body.classList.toggle(
    'auth-loading',
    !loggedIn
  )


  if (loggedIn) {

    loadRelationshipStart()

  } else {

    if (counterTimer) {

      clearInterval(
        counterTimer
      )

      counterTimer = null
    }
  }
}


// =====================================================
// INITIAL SESSION
// =====================================================

const {
  data: {
    session
  }
} =
  await supabase.auth.getSession()


showApp(session)


supabase.auth.onAuthStateChange(
  (_event, nextSession) => {
    showApp(nextSession)
  }
)


window.supabaseClient =
  supabase
// ==========================================
// FORCE SETTINGS BUTTON CLICK FIX
// ==========================================

setTimeout(() => {
  const settingsBtn = document.querySelector('.gear')

  if (!settingsBtn) return

  settingsBtn.style.position = 'relative'
  settingsBtn.style.zIndex = '9999'
  settingsBtn.style.pointerEvents = 'auto'
  settingsBtn.style.cursor = 'pointer'

  settingsBtn.onclick = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (typeof showSettingsModal === 'function') {
      showSettingsModal()
    }
  }
}, 300)
