# Pixel Wind Letter

A static, backend-free website for generating and sharing animated pixel-art letters.
Built with HTML, CSS, and Vanilla JavaScript.

## Features
- **Wind-First Animation**: Procedural pixel wind and rose animation.
- **No Backend**: All data is stored in the URL (Base64 encoded).
- **Mobile First**: Optimized for small screens.
- **Randomized**: Each letter has a unique visual seed.

## How to Run Locally
Because this project uses ES Modules (`import`/`export`), you cannot simply double-click `index.html`. You must serve it over HTTP.

### Option 1: Python
```bash
# Run in the project directory
python3 -m http.server
# Open http://localhost:8000
```

### Option 2: Node/NPM (if available)
```bash
npx serve .
```

### Option 3: VS Code
Use the "Live Server" extension.

## Deployment
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Select `main` branch as Source.
4. Your site is live!

## data Structure
The URL parameter `l` contains a Base64 encoded JSON object:
```json
{
  "to": "Name",
  "from": "Name",
  "msg1": "Message...",
  "msg2": "Message 2...",
  "seed": 0.12345
}
```
