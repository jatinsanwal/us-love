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
