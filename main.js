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
const settingsBtn = document.getElementById('settingsBtn')
const togetherBox = document.querySelector('.together')

let mode = 'login'
let relationshipStartAt = null
let counterTimer = null

const DEMO_START_AT = '2024-06-11T12:00:00+05:30'

document.body.classList.add('auth-loading')


// =====================================================
// AUTH
// =====================================================

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
// REAL NAVIGATION
// =====================================================

window.showScreen = function(screenName) {

  const home =
    document.querySelector('.page')

  const screens =
    document.querySelectorAll('.app-screen')

  const navButtons =
    document.querySelectorAll('#mainNav button')

  // Hide all app screens
  screens.forEach(screen => {
    screen.classList.remove('active')
  })

  // Home
  if (screenName === 'home') {

    home.style.display = ''

  } else {

    home.style.display = 'none'

    const target =
      document.getElementById(
        `screen-${screenName}`
      )

    if (target) {
      target.classList.add('active')
    }
  }

  // Active navigation button
  navButtons.forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.screen === screenName
    )
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}


// =====================================================
// SETTINGS BUTTON
// =====================================================

if (settingsBtn) {

  settingsBtn.addEventListener('click', (event) => {

    event.preventDefault()
    event.stopPropagation()

    showScreen('settings')

  })
}


// =====================================================
// EXACT LIVE TOGETHER COUNTER
// =====================================================

function parseDate(value) {

  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function monthPoint(date, monthsToAdd) {

  const result = new Date(date)

  const originalDay =
    result.getDate()

  result.setDate(1)

  result.setMonth(
    result.getMonth() + monthsToAdd
  )

  const lastDay =
    new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0
    ).getDate()

  result.setDate(
    Math.min(
      originalDay,
      lastDay
    )
  )

  return result
}

function calculateElapsed(start, end) {

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

  let cursor =
    new Date(start)

  // YEARS
  let years =
    end.getFullYear() -
    cursor.getFullYear()

  let yearPoint =
    new Date(cursor)

  yearPoint.setFullYear(
    cursor.getFullYear() + years
  )

  if (yearPoint > end) {

    years--

    yearPoint =
      new Date(cursor)

    yearPoint.setFullYear(
      cursor.getFullYear() + years
    )
  }

  cursor = yearPoint


  // MONTHS
  let months =
    end.getMonth() -
    cursor.getMonth()

  if (months < 0) {
    months += 12
  }

  let mPoint =
    monthPoint(
      cursor,
      months
    )

  if (mPoint > end) {

    months--

    mPoint =
      monthPoint(
        cursor,
        months
      )
  }

  cursor = mPoint


  // REMAINING DAYS / TIME
  let remaining =
    end.getTime() -
    cursor.getTime()

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

function updateTogetherCounter() {

  if (!togetherBox) return

  const start =
    parseDate(
      relationshipStartAt ||
      DEMO_START_AT
    )

  if (!start) return

  const elapsed =
    calculateElapsed(
      start,
      new Date()
    )

  const pad =
    number =>
      String(number).padStart(2, '0')

  togetherBox.innerHTML = `
    <b>
      ${elapsed.years} Years ·
      ${elapsed.months} Months ·
      ${elapsed.days} Days
    </b>

    <span>
      ${pad(elapsed.hours)}h ·
      ${pad(elapsed.minutes)}m ·
      ${pad(elapsed.seconds)}s
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
// LOAD RELATIONSHIP DATE FROM SUPABASE
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

    if (!error && data) {

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

        const display =
          document.getElementById(
            'relationshipDateDisplay'
          )

        if (display) {

          const date =
            new Date(
              row.relationship_start_at
            )

          display.textContent =
            date.toLocaleString(
              'en-IN',
              {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }
            )
        }

        startTogetherCounter()

        return
      }
    }

  } catch (error) {

    console.log(
      'Relationship settings not loaded yet:',
      error
    )
  }

  // Demo fallback
  relationshipStartAt =
    localStorage.getItem(
      'us_relationship_start_at'
    ) ||
    DEMO_START_AT

  startTogetherCounter()
}


// =====================================================
// APP SHOW / HIDE
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

    showScreen('home')

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
// START
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
