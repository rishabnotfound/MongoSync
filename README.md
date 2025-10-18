# MongoDB Web Dashboard

A modern, full-stack MongoDB management dashboard built with Next.js, TypeScript, and TailwindCSS. This application provides a developer-friendly interface for managing MongoDB databases, browsing collections, and performing CRUD operations.

![MongoDB Dashboard](https://img.shields.io/badge/MongoDB-Dashboard-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## Features

### Core Functionality

- **Connection Management**
  - Add multiple MongoDB connections (mongodb:// or mongodb+srv://)
  - Persistent storage in localStorage
  - Connection status monitoring
  - Easy switching between connections

- **Database & Collection Explorer**
  - Sidebar with expandable databases
  - Browse all collections
  - Multiple open tabs (browser-style)
  - Real-time collection loading

- **Document Management**
  - Paginated table view (10/20/50/100 per page)
  - JSON view toggle
  - Filter with MongoDB query syntax
  - CRUD operations (Create, Read, Update, Delete)
  - Copy documents to clipboard
  - Export capabilities

- **Modern UI/UX**
  - Dark/Light theme toggle
  - Responsive design
  - Smooth animations with Framer Motion
  - Clean, professional interface
  - Command Palette (Ctrl/Cmd + K)

### Advanced Features (Implemented)

- **State Management**: Zustand for global state
- **Command Palette**: Quick navigation and actions (Ctrl+K)
- **Theme Persistence**: Saved preferences across sessions
- **Tab Management**: Multiple collections open simultaneously
- **Keyboard Shortcuts**: Fast workflow navigation

### Architecture

```
MongoDB-Web/
├── app/
│   ├── api/
│   │   └── mongodb/          # API routes for MongoDB operations
│   │       ├── connect/      # Connection testing
│   │       ├── databases/    # Database listing
│   │       ├── collections/  # Collection operations
│   │       ├── documents/    # CRUD operations
│   │       ├── stats/        # Collection statistics
│   │       └── aggregate/    # Aggregation pipeline
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main dashboard page
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/            # Dashboard components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── CollectionTabs.tsx
│   │   ├── DocumentTable.tsx
│   │   ├── ConnectionManager.tsx
│   │   ├── MainView.tsx
│   │   └── CommandPalette.tsx
│   └── ui/                   # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── store.ts              # Zustand state management
│   └── utils.ts              # Utility functions
├── services/
│   └── mongodb.ts            # MongoDB service layer
├── types/
│   └── index.ts              # TypeScript type definitions
└── public/                   # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MongoDB-Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. When you first open the application, you'll see a connection manager modal
2. Click "Add Connection"
3. Enter your connection details:
   - **Connection Name**: A friendly name (e.g., "Local MongoDB")
   - **Connection URI**: Your MongoDB connection string
     - Local: `mongodb://localhost:27017`
     - Atlas: `mongodb+srv://username:password@cluster.mongodb.net`
4. Click "Connect" to test and save the connection

## Usage

### Managing Connections

- **Add Connection**: Click the "Add Connection" button in the connection manager
- **Switch Connections**: Use the dropdown in the header or Command Palette (Ctrl+K)
- **Delete Connection**: Click the trash icon next to a connection

### Browsing Data

1. Select a connection from the header dropdown
2. Wait for the connection to establish (green checkmark)
3. Expand databases in the sidebar
4. Click a collection to open it in a new tab
5. Browse, filter, and edit documents

### Document Operations

- **View**: Documents are displayed in a paginated table or JSON view
- **Filter**: Use MongoDB query syntax in the filter input (e.g., `{"status": "active"}`)
- **Edit**: Click the edit icon on any document
- **Delete**: Click the trash icon (confirmation required)
- **Copy**: Click the copy icon to copy document JSON to clipboard
- **Add**: Click the "Add" button to insert a new document

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Open Command Palette
- `Esc`: Close modals/palette
- Arrow keys: Navigate command palette

### Command Palette

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette for:
- Quick connection switching
- Navigate to open tabs
- Toggle theme
- Search across connections and collections

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database Driver**: MongoDB Node.js Driver
- **Command Interface**: cmdk

## API Routes

All API routes are located in `app/api/mongodb/`:

- `POST /api/mongodb/connect` - Test connection and get databases
- `POST /api/mongodb/databases` - List all databases
- `POST /api/mongodb/collections` - List collections in a database
- `POST /api/mongodb/documents` - Query documents
- `PUT /api/mongodb/documents` - Insert document
- `PATCH /api/mongodb/documents` - Update document
- `DELETE /api/mongodb/documents` - Delete document
- `POST /api/mongodb/stats` - Get collection statistics
- `POST /api/mongodb/aggregate` - Execute aggregation pipeline

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory (optional):

```env
# No environment variables required for basic functionality
# Connections are managed through the UI and stored in localStorage
```

### Customization

#### Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --background: 0 0% 100%;
  /* ... more variables */
}
```

#### Default Page Size

Edit `components/dashboard/DocumentTable.tsx`:

```typescript
const [pageSize, setPageSize] = useState(20); // Change default
```

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Security Considerations

- Connection URIs are stored in localStorage (client-side only)
- Never commit `.env` files with sensitive credentials
- Use environment variables for production deployments
- Consider implementing authentication for multi-user scenarios

## Future Enhancements

Planned features for future releases:

- [ ] Query Builder UI
- [ ] Aggregation Pipeline Playground
- [ ] Import/Export (JSON/CSV)
- [ ] Index management
- [ ] User authentication
- [ ] Real-time data updates
- [ ] Schema visualization
- [ ] Performance metrics
- [ ] Backup/Restore functionality

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MongoDB Node.js Driver team
- Next.js team at Vercel
- TailwindCSS team
- Framer Motion team
- All open-source contributors

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues before creating new ones

---

Built with ❤️ using Next.js, TypeScript, and TailwindCSS
