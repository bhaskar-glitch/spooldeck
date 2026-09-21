# SpoolDeck

**Tablet filament tracker for the Bambu Lab A1 external spool holder.**

SpoolDeck runs as a local web app on your laptop and is designed to be used from a tablet mounted near your printer. It automatically tracks filament usage by listening to your A1's live telemetry over MQTT — no AMS required.

## Features

- 🎯 **Auto-deduct** — When a print finishes, SpoolDeck automatically subtracts the slicer-estimated grams from the loaded spool.
- ⚖️ **Optional scale precision** — Weigh a finished part or the whole spool on a kitchen scale to override slicer estimates.
- 📊 **Full audit ledger** — Every gram in, every gram out, tracked with timestamps.
- 🖨️ **Live telemetry** — Nozzle/bed temps, layer count, speed mode, and progress bar streamed from the A1.
- 📱 **Installable PWA** — Add to your Android/iPad home screen for a native app experience.
- 🔒 **100% local** — Your data stays on your machine. No cloud accounts required.

## Requirements

- **Node.js 22+**
- **Bambu Lab A1** (with external spool holder)
- A tablet or phone on the same Wi-Fi network
- *(Optional)* A kitchen scale for precision weighing

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/spooldeck.git
cd spooldeck

# 2. Install dependencies
npm install

# 3. Configure your printer
cp .env.example .env
# Edit .env with your printer's IP, serial number, and access code

# 4. Start the dev server
npm run dev
```

Open `http://YOUR_LAPTOP_IP:8080` on your tablet.

## Connecting to Your Printer

SpoolDeck supports three connection modes:

### LAN Mode (Recommended)
Direct MQTT connection to your A1 over your local network. Fastest telemetry updates.

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

## Running on Windows Startup

To run SpoolDeck silently in the background when your laptop boots:

1. Create a `.vbs` file in your Windows Startup folder (`Win+R` → `shell:startup`):
```vbs
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""C:\path\to\spooldeck\Start-SpoolDeck.bat""", 0, False
```

2. Use `Stop-SpoolDeck.bat` to gracefully shut down the server.

## Architecture

- **Frontend**: React 19 + TanStack Start/Router + Tailwind CSS v4
- **Backend**: Vite dev server with server functions (TanStack Start)
- **Database**: PGLite (embedded Postgres via WASM) — zero config, data stored in `.pglite/`
- **Printer Communication**: MQTT over TLS (port 8883) to the A1's LAN interface
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
