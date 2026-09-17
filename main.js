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
        await ensureCoupleConnection()
      } else {
        message(
          'Account created! You can now log in. 💗'
        )
        setMode('login')
      }
    } else {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.value.trim(),
          password: password.value
        })

      if (error) throw error

      message('Login successful. Opening your world…')

      await ensureCoupleConnection(data.session)
    }
  } catch (error) {
    console.error(error)

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

  gate.style.display = loggedIn
    ? 'none'
    : 'grid'

  logout.style.display = loggedIn
    ? 'block'
    : 'none'

  document.body.classList.toggle(
    'auth-loading',
    !loggedIn
  )
}

/* -------------------------------------------------
   COUPLE SETUP UI
------------------------------------------------- */

function addCoupleSetupStyles() {
  if (document.getElementById('coupleSetupStyles')) return

  const style = document.createElement('style')
  style.id = 'coupleSetupStyles'

  style.textContent = `
    #coupleSetup {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,.9), transparent 35%),
        linear-gradient(135deg, #ffe7f3, #eee4ff 55%, #dff2ff);
      font-family: inherit;
    }

    .couple-card {
      width: min(440px, 100%);
      padding: 28px 22px;
      border-radius: 30px;
      background: rgba(255,255,255,.78);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,.9);
      box-shadow: 0 20px 60px rgba(112,74,120,.18);
      text-align: center;
    }

    .couple-heart {
      font-size: 46px;
      margin-bottom: 8px;
    }

    .couple-card h2 {
      margin: 0;
      color: #4d2948;
      font-size: 28px;
    }

    .couple-card p {
      color: #80667c;
      line-height: 1.5;
      margin: 8px 0 22px;
    }

    .couple-option {
      width: 100%;
      border: 0;
      border-radius: 18px;
      padding: 15px 16px;
      margin-top: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(135deg, #f2389b, #9c62ee);
      box-shadow: 0 10px 25px rgba(210,65,160,.2);
    }

    .couple-option.secondary {
      color: #62465e;
      background: rgba(255,255,255,.9);
      border: 1px solid #ead9ea;
      box-shadow: none;
    }

    .couple-panel {
      margin-top: 18px;
      text-align: left;
    }

    .couple-panel label {
      display: block;
      margin: 12px 0 6px;
      color: #62465e;
      font-weight: 600;
      font-size: 14px;
    }

    .couple-panel input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ead9ea;
      background: rgba(255,255,255,.9);
      border-radius: 14px;
      padding: 13px 14px;
      font-size: 16px;
      outline: none;
    }

    .couple-message {
      min-height: 22px;
      margin-top: 12px;
      text-align: center;
      color: #80667c;
      font-size: 14px;
    }

    .couple-message.error {
      color: #c43f65;
    }

    .couple-code {
      margin: 18px 0;
      padding: 16px;
      border-radius: 18px;
      background: linear-gradient(135deg, #ffe2f1, #eee3ff);
      color: #5b3157;
      font-size: 27px;
      font-weight: 800;
      letter-spacing: 3px;
    }

    .hidden {
      display: none !important;
    }
  `

  document.head.appendChild(style)
}

function createCoupleSetup() {
  addCoupleSetupStyles()

  const existing = document.getElementById('coupleSetup')
  if (existing) return existing

  const wrapper = document.createElement('div')
  wrapper.id = 'coupleSetup'

  wrapper.innerHTML = `
    <div class="couple-card">

      <div class="couple-heart">💗</div>

      <h2>Welcome to Our World</h2>

      <p>
        Let's connect the two accounts and create
        your private little world.
      </p>

      <div id="coupleChoice">

        <button id="createWorldBtn" class="couple-option">
          ✨ Create Our World
        </button>

        <button id="joinWorldBtn" class="couple-option secondary">
          💞 Join Our World
        </button>

      </div>

      <div id="createPanel" class="couple-panel hidden">

        <label>Your name</label>

        <input
          id="createName"
          type="text"
          maxlength="40"
          placeholder="Enter your name"
        />

        <button id="createConfirmBtn" class="couple-option">
          Create Couple ❤️
        </button>

        <div id="createMessage" class="couple-message"></div>

      </div>

      <div id="joinPanel" class="couple-panel hidden">

        <label>Your name</label>

        <input
          id="joinName"
          type="text"
          maxlength="40"
          placeholder="Enter your name"
        />

        <label>Couple Code</label>

        <input
          id="joinCode"
          type="text"
          maxlength="9"
          placeholder="US-XXXXXX"
          style="text-transform:uppercase"
        />

        <button id="joinConfirmBtn" class="couple-option">
          Join Our World 💗
        </button>

        <div id="joinMessage" class="couple-message"></div>

      </div>

      <div id="successPanel" class="couple-panel hidden">

        <p>
          Your couple world has been created! 🎉
        </p>

        <div id="generatedCode" class="couple-code"></div>

        <p>
          Share this code with your partner.
          They can use <b>Join Our World</b>.
        </p>

        <button id="continueBtn" class="couple-option">
          Enter Our World ❤️
        </button>

      </div>

    </div>
  `

  document.body.appendChild(wrapper)

  const choice = wrapper.querySelector('#coupleChoice')
  const createPanel = wrapper.querySelector('#createPanel')
  const joinPanel = wrapper.querySelector('#joinPanel')
  const successPanel = wrapper.querySelector('#successPanel')

  wrapper.querySelector('#createWorldBtn')
    .addEventListener('click', () => {
      choice.classList.add('hidden')
      createPanel.classList.remove('hidden')
    })

  wrapper.querySelector('#joinWorldBtn')
    .addEventListener('click', () => {
      choice.classList.add('hidden')
      joinPanel.classList.remove('hidden')
    })

  wrapper.querySelector('#createConfirmBtn')
    .addEventListener('click', async () => {

      const name =
        wrapper.querySelector('#createName').value.trim()

      const msg =
        wrapper.querySelector('#createMessage')

      if (!name) {
        msg.textContent = 'Please enter your name.'
        msg.className = 'couple-message error'
        return
      }

      msg.textContent = 'Creating your world…'
      msg.className = 'couple-message'

      const { data, error } =
        await supabase.rpc(
          'create_our_couple',
          {
            p_name: name
          }
        )

      if (error) {
        console.error(error)

        msg.textContent =
          error.message ||
          'Could not create your world.'

        msg.className = 'couple-message error'
        return
      }

      const result = Array.isArray(data)
        ? data[0]
        : data

      if (!result?.couple_id) {
        msg.textContent =
          'Couple was not created correctly.'

        msg.className = 'couple-message error'
        return
      }

      window.currentCoupleId = result.couple_id

      wrapper.querySelector('#generatedCode')
        .textContent = result.couple_code

      createPanel.classList.add('hidden')
      successPanel.classList.remove('hidden')
    })

  wrapper.querySelector('#joinConfirmBtn')
    .addEventListener('click', async () => {

      const name =
        wrapper.querySelector('#joinName').value.trim()

      const code =
        wrapper.querySelector('#joinCode')
          .value.trim()
          .toUpperCase()

      const msg =
        wrapper.querySelector('#joinMessage')

      if (!name || !code) {
        msg.textContent =
          'Please enter your name and Couple Code.'

        msg.className = 'couple-message error'
        return
      }

      msg.textContent = 'Joining your world…'
      msg.className = 'couple-message'

      const { data, error } =
        await supabase.rpc(
          'join_our_couple',
          {
            p_code: code,
            p_name: name
          }
        )

      if (error) {
        console.error(error)

        msg.textContent =
          error.message ||
          'Could not join this world.'

        msg.className = 'couple-message error'
        return
      }

      const result = Array.isArray(data)
        ? data[0]
        : data

      if (!result?.couple_id) {
        msg.textContent =
          'Something went wrong. Please check the Couple Code.'

        msg.className = 'couple-message error'
        return
      }

      window.currentCoupleId = result.couple_id

      msg.textContent =
        'Joined successfully! Opening your world… 💗'

      setTimeout(() => {
        wrapper.remove()
        location.reload()
      }, 700)
    })

  wrapper.querySelector('#continueBtn')
    .addEventListener('click', () => {
      wrapper.remove()
    })

  return wrapper
}

/* -------------------------------------------------
   FIXED EXISTING COUPLE CHECK
------------------------------------------------- */

async function ensureCoupleConnection() {

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  const { data, error } =
    await supabase.rpc('get_my_couple')

  if (error) {
    console.error(
      'get_my_couple error:',
      error
    )

    createCoupleSetup()
    return
  }

  const result = Array.isArray(data)
    ? data[0]
    : data

  /* Existing couple found */
  if (result?.couple_id) {

    window.currentCoupleId =
      result.couple_id

    window.currentProfile = {
      id: result.profile_id,
      name: result.profile_name,
      couple_id: result.couple_id,
      couple_code: result.couple_code
    }

    const setup =
      document.getElementById('coupleSetup')

    if (setup) setup.remove()

    console.log(
      'Existing couple found:',
      result.couple_code
    )

    return
  }

  /* No couple yet */
  createCoupleSetup()
}

/* -------------------------------------------------
   START APP
------------------------------------------------- */

const {
  data: { session }
} = await supabase.auth.getSession()

showApp(session)

if (session) {
  await ensureCoupleConnection()
}

supabase.auth.onAuthStateChange(
  async (_event, nextSession) => {

    showApp(nextSession)

    if (nextSession) {
      await ensureCoupleConnection()
    }
  }
)

window.supabaseClient = supabase
