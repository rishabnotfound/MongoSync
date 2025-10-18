# MongoSync

<img width="1919" height="951" alt="image" src="https://github.com/user-attachments/assets/8beff637-d7bc-4af4-8c76-2e9a5c27c315" />

Modern MongoDB management dashboard built with Next.js 14, TypeScript, and TailwindCSS.

- Next.js
- TypeScript
- MongoDB

## Features

**Connection Management**
- Multiple connections with status monitoring • Auto-reconnect • Connection pooling • localStorage persistence

**Database & Collections**
- Tree explorer with auto-expand • Create/delete databases & collections • Real-time stats (size, count) • Collapsible sidebar

**Document Operations**
- CRUD with JSON validation • Pagination (10/20/50/100) • Query filtering • Copy to clipboard • Syntax-highlighted JSON preview • Bulk operations

**UI/UX**
- Dark/Light/System themes • Command palette (. + K) • Multi-tab browsing • Close all tabs • Progress bar • Responsive design • Framer Motion animations • PWA support

**Advanced**
- Aggregation pipeline execution • Collection statistics • ObjectId conversion • No-cache API headers • State persistence with Zustand

## Tech Stack

**Frontend:** Next.js 14 • React 18 • TypeScript 5 • TailwindCSS 3
**State:** Zustand • localStorage persistence
**UI:** Framer Motion • Lucide Icons • cmdk • NProgress
**Database:** MongoDB Node.js Driver 6
**Build:** next-pwa • PostCSS • Autoprefixer

## Installation

```bash
git clone https://github.com/rishabnotfound/MongoSync
cd MongoSync
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/mongodb/connect` | POST | Test connection & list databases |
| `/api/mongodb/databases` | POST | List all databases |
| `/api/mongodb/collections` | POST | List collections in database |
| `/api/mongodb/documents` | POST/PUT/PATCH/DELETE | CRUD operations |
| `/api/mongodb/stats` | POST | Collection statistics |
| `/api/mongodb/aggregate` | POST | Execute aggregation pipeline |
| `/api/mongodb/manage-database` | POST/DELETE | Create/delete database |
| `/api/mongodb/manage-collection` | POST/DELETE | Create/delete collection |

All routes return: `{ success: boolean, data?: any, error?: string }`
All routes include no-cache headers to prevent CDN caching.

## Project Structure

```
MongoDB-Web/
├── app/
│   ├── api/mongodb/          # 8 API routes
│   ├── layout.tsx            # Root layout with PWA, theme, progress bar
│   ├── page.tsx              # Dashboard with footer
│   └── globals.css           # Tailwind + theme variables + NProgress styles
├── components/
│   ├── dashboard/            # Header, Sidebar, Tabs, Tables, Editors, Command Palette
│   ├── ui/                   # Button, Modal, Input, Toast, ConfirmDialog
│   └── ProgressBar.tsx       # NProgress wrapper with helpers
├── lib/
│   ├── store.ts              # Zustand state (connections, tabs, theme)
│   └── utils.ts              # Formatting, validation, clipboard utilities
├── services/
│   └── mongodb.ts            # MongoDB service layer with connection pooling
├── types/index.ts            # TypeScript definitions
├── public/                   # PWA manifest, logos, security scripts
└── config.js                 # App metadata (name, description, links)
```

## Usage

**Connect:** Add MongoDB URI (mongodb:// or mongodb+srv://) → Auto-saves to localStorage
**Browse:** Expand databases → Click collection → Opens in new tab
**Query:** Use MongoDB syntax: `{"status": "active"}` • Filter → Paginate → Sort
**Edit:** Click edit icon → Modify JSON → Save (validates before update)
**Create:** Add button → Enter JSON → Insert
**Delete:** Trash icon → Confirm → Remove
**Tabs:** Multiple collections open • Close individual or all tabs • Auto-switches connection
**Command Palette:** Ctrl+K → Switch connections, tabs, theme, refresh databases

## Keyboard Shortcuts

`. + K` - Command Palette • Arrow keys - Navigate palette

## Configuration

**App Config** Edit `config.js`

## Build & Deploy

```bash
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
```

## Security

- Connections stored in localStorage (client-side)
- Dev tools detector & anti-cheat scripts
- No credentials in code/env by default
- API routes return proper error messages without exposing internals

## Credits

Made with ❤️ by [R](https://github.com/rishabnotfound)
[GitHub Repository](https://github.com/rishabnotfound/MongoSync)

## License

MIT License - See LICENSE file for details
