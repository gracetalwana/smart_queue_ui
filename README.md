# 🎨 Smart Queue UI

> React frontend for the **Smart Queuing System** — a real-time appointment and queue management interface.

This project is designed as a **learning resource** for students studying frontend web development with **React, Material-UI, and Vite**.

---

## 📚 What You Will Learn

| Concept | Where to look |
| --- | --- |
| **React Components** — functional components, props, state | Every file in `pages/` and `components/` |
| **React Hooks** — useState, useEffect, useCallback | All page files |
| **Custom Hooks** — encapsulating reusable logic | `hooks/useToast.js`, `hooks/useSocket.js` |
| **React Router** — SPA navigation, protected routes | `AppRouter.jsx` |
| **Material-UI (MUI)** — professional UI components | All page files |
| **MUI Theming** — custom colors, component overrides | `theme.js` |
| **API Integration** — fetch with JWT, error handling | `utils/api.js` |
| **JWT on the Client** — storing tokens, decoding payloads | `AppRouter.jsx`, `utils/api.js` |
| **Socket.IO Client** — real-time event listeners | `hooks/useSocket.js`, `QueueDashboard.jsx` |
| **Data Visualization** — ApexCharts (donut, bar, line) | `Dashboard.jsx`, `Reports.jsx` |
| **Responsive Design** — mobile-first, breakpoints | `ModernLayout.jsx` |

---

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| [React 19](https://react.dev/) | Component-based UI library |
| [Vite 6](https://vitejs.dev/) | Lightning-fast dev server and build tool (replaces Create React App) |
| [Material-UI (MUI) v7](https://mui.com/) | Pre-built, customizable React components following Material Design |
| [React Router v7](https://reactrouter.com/) | Client-side routing — navigate without full page reloads |
| [ApexCharts](https://apexcharts.com/) + react-apexcharts | Beautiful interactive charts |
| [Socket.IO Client](https://socket.io/docs/v4/client-api/) | Real-time communication with the backend |

---

## 📂 Project Structure

```text
smart_queue_ui/
│
├── index.html                # 📄 The single HTML page (React mounts into <div id="root">)
├── vite.config.js            # ⚙️  Vite configuration
├── package.json              # 📦 Dependencies and npm scripts
├── eslint.config.js          # 🔍 Linting rules for code quality
│
├── public/                   # 🌐 Static assets (favicon, images) — served as-is
│
└── src/                      # 📁 ALL source code lives here
    │
    ├── main.jsx              # 🚪 ENTRY POINT — renders <App /> into the DOM
    │                         #    Also applies the MUI ThemeProvider
    │
    ├── App.jsx               # 🏠 Root component — wraps everything in <AppRouter />
    ├── App.css               # 🎨 Global styles (minimal — MUI handles most styling)
    ├── index.css              # 🎨 Base CSS resets
    │
    ├── AppRouter.jsx          # 🛤️  ROUTING — defines all pages and navigation
    │                         #    Contains ProtectedRoute component for auth guards
    │                         #    Decodes JWT to get user info without a library
    │
    ├── theme.js              # 🎨 THEME — brand colors, component style overrides
    │                         #    This file controls the look of the entire app
    │
    ├── assets/               # 🖼️  Images, icons, etc.
    │
    ├── components/           # 🧩 REUSABLE COMPONENTS — used across multiple pages
    │   └── Toast.jsx         #    Notification toast (success, error, warning, info)
    │
    ├── hooks/                # 🪝 CUSTOM HOOKS — encapsulate reusable stateful logic
    │   ├── useToast.js       #    Hook to show/hide toast notifications
    │   └── useSocket.js      #    Hook to connect to Socket.IO and listen for events
    │
    ├── layouts/              # 📐 LAYOUTS — page structure (sidebar, header, content area)
    │   ├── ModernLayout.jsx  #    Main app layout: dark sidebar + content area
    │   └── MainLayout.jsx    #    Alternative layout (legacy)
    │
    ├── pages/                # 📄 PAGES — one component per route
    │   ├── Login.jsx         #    Login form with JWT token storage
    │   ├── Register.jsx      #    Registration form
    │   ├── Dashboard.jsx     #    KPI cards, charts, recent appointments
    │   ├── Users.jsx         #    User management table (admin)
    │   ├── Reports.jsx       #    Analytics: service rates, trends, charts
    │   ├── BookSlot.jsx      #    Students browse and book time slots
    │   ├── QueueDashboard.jsx #   Students track their queue position in real-time
    │   ├── AdminSlots.jsx    #    Admins create and manage time slots
    │   └── AdminQueue.jsx    #    Admins manage the live queue (serve, skip, no-show)
    │
    └── utils/                # 🔧 UTILITIES — helper functions
        ├── api.js            #    All API calls (login, getUsers, bookSlot, etc.)
        │                     #    Handles JWT tokens, Authorization headers, error handling
        └── format.js         #    Date/time formatting helpers (fmtDate, fmtTime, fmtDateTime)
```

### How the Frontend Architecture Works

```text
┌──────────────────────────────────────────────────────────┐
│  main.jsx                                                │
│  └── ThemeProvider (theme.js)                            │
│      └── App.jsx                                         │
│          └── AppRouter.jsx                               │
│              ├── /login ──────────> Login.jsx             │
│              ├── /register ───────> Register.jsx          │
│              │                                           │
│              └── ProtectedRoute ──> ModernLayout.jsx     │
│                   (checks JWT)      ├── Sidebar           │
│                                     └── Content Area      │
│                                         ├── /dashboard    │
│                                         ├── /users        │
│                                         ├── /reports      │
│                                         ├── /book-slot    │
│                                         ├── /my-queue     │
│                                         ├── /admin/slots  │
│                                         └── /admin/queue  │
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ Getting Started — Step by Step

### Prerequisites

1. **Node.js** (v18 or later) — [Download here](https://nodejs.org/)

   ```bash
   node --version   # Should show v18.x.x or higher
   npm --version    # Should show 9.x.x or higher
   ```

2. **The Smart Queue API** must be running on `http://localhost:3000`
   See the `smart_queue_api/readme.md` for setup instructions.

---

### Step 1 — Navigate to the UI folder

```bash
cd smart_queue_ui
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

> 📖 **What this does:** Downloads React, MUI, Vite, and all other packages listed in `package.json` into the `node_modules/` folder.

---

### Step 3 — Start the Development Server

```bash
npm run dev
```

You should see:

```text
  VITE v6.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open **http://localhost:5173** in your browser.

> 📖 **Vite HMR (Hot Module Replacement):** When you save a file, the page updates instantly without a full reload. This makes development much faster than traditional tools.

---

### Step 4 — Log In

Use one of the seed accounts (created by the API's seed script):

| Username | Password | Role |
| --- | --- | --- |
| `superadmin` | `Admin@1234` | SUPER_ADMIN |
| `admin1` | `Admin@1234` | ADMIN |
| `alice` | `Student@123` | STUDENT |

> 💡 **Tip:** Log in as `admin1` first to see all features. Then log in as `alice` in a different browser (or incognito window) to see the student view.

---

## 🎨 Theme System

The look and feel of the entire app is controlled by a single file: `src/theme.js`.

### Brand Colors

| Token | Color | Hex | Used for |
| --- | --- | --- | --- |
| `primary` | Sky Blue | `#0EA5E9` | Buttons, links, active states |
| `accent` | Violet | `#8B5CF6` | Highlights, badges, gradients |
| `sidebarBg` | Slate 900 | `#0F172A` | Sidebar background |
| `cardBg` | White | `#FFFFFF` | Card backgrounds |
| `pageBg` | Slate 50 | `#F8FAFC` | Page background |
| `success` | Emerald | `#10B981` | Success states |
| `warning` | Amber | `#F59E0B` | Warning states |
| `error` | Red | `#EF4444` | Error states |
| `info` | Blue | `#3B82F6` | Info states |

### How Theming Works

```text
theme.js exports:
├── brand = { primary, accent, sidebarBg, ... }   ← raw color tokens
└── theme = createTheme({                           ← MUI theme object
        palette: { ... },                           ← maps brand to MUI palette
        components: {                               ← global component overrides
            MuiButton: { gradient style },
            MuiPaper: { no elevation, border },
            MuiTableHead: { uppercase headers },
            ...
        }
    })
```

> 📖 **Want to change the entire app's color scheme?** Edit the `brand` object in `theme.js`. Every page imports `brand` for inline styles, and MUI components use the `theme` automatically.

---

## 🔑 Key Concepts Explained

### 1. How React Routing Works (`AppRouter.jsx`)

This app is a **Single Page Application (SPA)** — the browser loads `index.html` once, and React Router handles "page" changes in JavaScript without full page reloads.

```jsx
// Simplified example from AppRouter.jsx:
<Routes>
  <Route path="/login" element={<Login />} />

  {/* Protected: user must be logged in */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
  </Route>
</Routes>
```

`ProtectedRoute` checks if there's a valid JWT in `localStorage`. If not, it redirects to `/login`.

### 2. How API Calls Work (`utils/api.js`)

Every function in `api.js` uses the Fetch API to talk to the backend:

```javascript
// Simplified example:
export const getUsers = async () => {
  const token = localStorage.getItem('token');       // Get stored JWT
  const response = await fetch('http://localhost:3000/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`,            // Attach JWT to request
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed');
  return response.json();                            // Parse JSON response
};
```

> 📖 **Why JWT in localStorage?** After login, the API returns a token. We store it in the browser's `localStorage` so we can attach it to every subsequent request. The server checks this token to know who you are.

### 3. How Custom Hooks Work

A **custom hook** is a function that starts with `use` and can call other hooks (like `useState`, `useEffect`):

```javascript
// hooks/useToast.js — simplified:
export default function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, severity) => {
    setToast({ message, severity });
    setTimeout(() => setToast(null), 4000);  // Auto-hide after 4s
  };

  return { toast, showToast };
}

// Usage in a page:
const { toast, showToast } = useToast();
showToast('Saved successfully!', 'success');
```

> 📖 **Why custom hooks?** They let you reuse stateful logic across multiple pages without duplicating code.

### 4. How Socket.IO Client Works

The `useSocket` hook connects to the server and listens for real-time events:

```text
Browser (React)                          Server (Express)
    │                                         │
    │  useSocket connects on mount            │
    ├────── io("http://localhost:3000") ─────>│
    │                                         │
    │  Join a slot room                       │
    ├────── emit("join_slot", slotId) ──────>│
    │                                         │
    │  Server pushes updates                  │
    │<────── on("queue_update", data) ────────┤  When queue changes
    │                                         │
    │  Component re-renders with new data     │
```

---

## 📄 Page Guide

| Page | Route | Role | Description |
| --- | --- | --- | --- |
| Login | `/login` | All | Authenticate and receive a JWT |
| Register | `/register` | All | Create a new student account |
| Dashboard | `/dashboard` | All | KPI cards, charts, recent appointments |
| Users | `/users` | Admin | Create, edit, delete user accounts |
| Reports | `/reports` | Admin | Analytics: service rates, no-show rates, trends |
| Book Slot | `/book-slot` | Student | Browse available time slots, book an appointment |
| My Queue | `/my-queue` | Student | Track your queue position and appointment status |
| Admin Slots | `/admin/slots` | Admin | Create, edit, delete time slots |
| Admin Queue | `/admin/queue` | Admin | Live queue console: serve, skip, mark no-show |

---

## 🛠 NPM Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (http://localhost:5173) with HMR |
| `npm run build` | Build for production → outputs to `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code quality issues |

---

## 🐛 Troubleshooting

| Problem | Solution |
| --- | --- |
| Blank page after login | Make sure the API is running on port 3000 |
| `Network Error` or `Failed to fetch` | The API server isn't running. Start it with `npm start` in `smart_queue_api/` |
| Login fails with valid credentials | Make sure you ran `npm run seed` in the API project |
| `Module not found` | Run `npm install` to install dependencies |
| Port 5173 already in use | Kill the process: `lsof -ti:5173 \| xargs kill -9` |
| Changes not appearing | Vite HMR should auto-update. Try hard-refreshing: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) |
| Charts not rendering | Make sure `apexcharts` and `react-apexcharts` are installed (`npm install`) |

---

## 📝 Tips for Students

1. **Start with `AppRouter.jsx`** — it shows every page in the app and how routing works.
2. **Read `theme.js`** — understanding how the theme works helps you customize any component.
3. **Open two browsers** — log in as admin in one and as a student in another to see both perspectives.
4. **Use React DevTools** — install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools) to inspect component state and props.
5. **Check the Network tab** — open Chrome DevTools → Network tab to see every API request and response.
6. **Look at `api.js`** — every backend call is here. This is where frontend meets backend.
7. **Modify a color in `theme.js`** — change `primary` to a different hex code and watch the entire app update.
8. **Add a new page** — create a file in `pages/`, add a route in `AppRouter.jsx`, add a sidebar link in `ModernLayout.jsx`. That's it!

---

## 📄 License

This project is for educational purposes.
