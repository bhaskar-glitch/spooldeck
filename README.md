# SpoolDeck

**Universal filament tracker for Bambu Lab printers (A1, A1 Mini, P1 & X1 series).**

SpoolDeck is a local-first web app that tracks your filament usage without needing an AMS. It runs as a lightweight background server on any machine on your network (Windows PC, Mac, Linux, Raspberry Pi, or NAS) and can be accessed from any phone, tablet, or browser. It automatically tracks usage by listening to your printer's live telemetry over MQTT.

## Features

- 🎯 **Smart Auto-Deduct** — Automatically subtracts slicer-estimated grams from the loaded spool when a print finishes. If a print fails halfway, it calculates the partial extrusion and deducts only that amount.
- 📡 **Auto-Healing IP Discovery** — If your router changes your printer's IP address, SpoolDeck automatically sweeps your local network (port 8883), finds the new IP, and reconnects seamlessly.
- 🛡️ **Indestructible JSON Backups** — Every inventory change is instantly backed up to a local JSON file. If a sudden power outage ever corrupts the primary database, the server automatically resurrects your spools on the next boot.
- ⚡ **Ultra-Fast Local Telemetry** — Uses local MQTT to stream nozzle/bed temperatures, layer counts, and progress data instantly, without relying on Bambu Cloud servers or internet access.
- 📱 **True Native Fullscreen PWA** — Generates its own local HTTPS certificates so it can be installed on Android/iOS tablets as a true native app, completely hiding the browser UI for a distraction-free workshop screen.
- ⚖️ **Optional Scale Precision** — Weigh a finished part or the whole spool on a kitchen scale to override slicer estimates.
- 📦 **Bulk CSV Import** — Quickly migrate your existing filament library into SpoolDeck by pasting a comma-separated list of your spools.
- 📊 **Full Audit Ledger** — Every gram in, every gram out, tracked immutably with timestamps.

## Requirements

- **Node.js 22+** installed on your host machine (the server)
- **Any Bambu Lab Printer** (A1, A1 Mini, P1P, P1S, or X1C)
- Any device with a web browser to access the dashboard
- *(Optional)* A kitchen scale for precision weighing

## Quick Start

```bash
# 1. Clone the repo to your server machine
git clone https://github.com/YOUR_USERNAME/spooldeck.git
cd spooldeck

# 2. Install dependencies
npm install

# 3. Configure your printer
cp .env.example .env
# Edit .env with your printer's IP, serial number, and access code

# 4. Start the server
npm run dev
```

Open `http://YOUR_SERVER_IP:8080` on your phone, tablet, or PC.

## Connecting to Your Printer

SpoolDeck supports three connection modes:

### LAN Mode (Recommended)
Direct MQTT connection to your printer over your local network. Fastest telemetry updates.

You need three values from **Bambu Studio → Device → Settings**:
- **IP Address** — Your printer's local IP (e.g. `192.168.1.50`)
- **Serial Number** — Found in Device Info
- **LAN Access Code** — 8-character code from the printer's screen

Add these to your `.env` file:
```env
BAMBU_LAN_HOST=192.168.1.50
BAMBU_SERIAL=YOUR_SERIAL_HERE
BAMBU_ACCESS_CODE=YOUR_CODE_HERE
```

### Cloud Mode
Uses the Bambu Cloud API. Requires a cloud token from your MakerWorld/Bambu account.

### Demo Mode
Simulates a printer with fake telemetry. Great for trying SpoolDeck without hardware.

## HTTPS Setup (for PWA Installation)

Android and iOS require HTTPS to install web apps. SpoolDeck includes a certificate generator for your local network:

```bash
# Generate certificates (auto-detects your LAN IP)
node generate-certs.mjs

# Or specify an IP manually
node generate-certs.mjs 192.168.1.100
```

This creates `rootCA.crt`, `server.crt`, and `server.key`. Install `rootCA.crt` as a trusted certificate on your tablet, then access SpoolDeck via `https://YOUR_IP:8080`.

## Running as a Background Server

For the best experience, SpoolDeck should run continuously in the background so it can always catch finishing prints. 

### On Windows

To run SpoolDeck silently in the background when your PC boots:
1. Create a `.vbs` file in your Windows Startup folder (`Win+R` → `shell:startup`):
```vbs
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""C:\path\to\spooldeck\Start-SpoolDeck.bat""", 0, False
```
2. Use the included `Stop-SpoolDeck.bat` to gracefully shut down the server when needed.

### On Linux, macOS, or Raspberry Pi

Use a process manager like `pm2` or a `systemd` service:
```bash
npm install -g pm2
pm2 start "npm run dev" --name spooldeck
pm2 save
```

## Architecture

- **Frontend**: React 19 + TanStack Start/Router + Tailwind CSS v4
- **Backend**: Vite dev server with server functions (TanStack Start)
- **Database**: PGLite (embedded Postgres via WASM) — zero config, data stored in `.pglite/`
- **Printer Communication**: MQTT over TLS (port 8883) to the printer's LAN interface
- **Cloud Fallback**: Bambu Cloud REST API for print weight data

## Project Structure

```
├── src/
│   ├── components/     # React UI components
│   ├── routes/         # TanStack file-based routes
│   └── lib/
│       └── filament/   # Core business logic
│           ├── actions.ts    # Server functions (CRUD, sync)
│           ├── lan-mqtt.ts   # MQTT client & auto-discovery
│           ├── printer.ts    # Telemetry parsing & cloud API
│           ├── catalog.ts    # Filament brand/color presets
│           └── types.ts      # TypeScript domain models
├── migrations/         # SQL schema (auto-applied on startup)
├── generate-certs.mjs  # HTTPS certificate generator
├── Start-SpoolDeck.bat # Windows startup script
└── Stop-SpoolDeck.bat  # Graceful shutdown script
```

## License

[MIT](LICENSE)
