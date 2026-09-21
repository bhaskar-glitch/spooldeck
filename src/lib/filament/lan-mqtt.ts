import mqtt from "mqtt";
import dgram from "dgram";
import type { SyncEvent } from "./printer";

export type LanCreds = {
  host: string;
  serial: string;
  accessCode: string;
};

type LanHandle = {
  client: mqtt.MqttClient | null;
  key: string;
  connected: boolean;
  error: string | null;
  events: SyncEvent[];
  onPrint: ((print: Record<string, unknown>) => void) | null;
  lastConnectAttempt: number;
  discoveredHost?: string;
};

const globalRef = globalThis as typeof globalThis & { __spooldeckLan?: LanHandle };

function slot(): LanHandle {
  globalRef.__spooldeckLan ??= {
    client: null,
    key: "",
    connected: false,
    error: null,
    events: [],
    onPrint: null,
    lastConnectAttempt: 0,
  };
  return globalRef.__spooldeckLan;
}

export function lanStatus() {
  const s = slot();
  return { connected: s.connected, error: s.error };
}

export function drainLanEvents(): SyncEvent[] {
  const s = slot();
  const events = s.events.splice(0, s.events.length);
  return events;
}

export function pushLanEvents(events: SyncEvent[]) {
  if (events.length === 0) return;
  slot().events.push(...events);
}

export function stopLanMqtt() {
  const s = slot();
  if (s.client) {
    s.client.removeAllListeners();
    s.client.on("error", () => {}); // Prevent unhandled error crashes during teardown
    s.client.end(true);
  }
  s.client = null;
  s.key = "";
  s.connected = false;
  s.error = null;
}

import net from "net";

let discovering = false;

function discoverPrinterIP(fallbackHost: string, callback: (ip: string) => void) {
  if (discovering) return;
  discovering = true;

  const parts = fallbackHost.split(".");
  if (parts.length !== 4) {
    discovering = false;
    return;
  }
  const subnet = `${parts[0]}.${parts[1]}.${parts[2]}.`;
  let pending = 254;
  let found = false;

  for (let i = 1; i <= 254; i++) {
    if (found) break;
    const ip = subnet + i;
    const socket = new net.Socket();
    socket.setTimeout(800);

    const done = () => {
      socket.destroy();
      pending--;
      if (pending === 0 && !found) discovering = false;
    };

    socket.on("connect", () => {
      if (!found) {
        found = true;
        discovering = false;
        callback(ip);
      }
      done();
    });

    socket.on("timeout", done);
    socket.on("error", done);

    socket.connect(8883, ip);
  }
}

export function ensureLanMqtt(
  creds: LanCreds,
  onPrint: (print: Record<string, unknown>) => void,
) {
  const s = slot();
  s.onPrint = onPrint;
  const host = creds.host.trim();
  const serial = creds.serial.trim().toUpperCase();
  // We include discoveredHost in the key so we don't unnecessarily reconnect if we are already using the discovered host
  const key = `${host}|${serial}|${creds.accessCode}`;
  
  const stuckOffline = s.client && !s.connected && (Date.now() - s.lastConnectAttempt > 15000);
  if (s.client && s.key === key && !stuckOffline) {
    return;
  }

  const previouslyDiscovered = s.discoveredHost;
  stopLanMqtt();
  const next = slot();
  next.key = key;
  next.onPrint = onPrint;
  next.error = "Connecting to A1 on your Wi-Fi…";
  next.connected = false;
  next.lastConnectAttempt = Date.now();
  next.discoveredHost = previouslyDiscovered;

  const connectWithHost = (targetHost: string) => {
    if (next.client) return; // already connected or connecting
    const client = mqtt.connect(`mqtts://${targetHost}:8883`, {
      username: "bblp",
      password: creds.accessCode,
      clientId: `spooldeck${Math.random().toString(16).slice(2, 10)}`,
      rejectUnauthorized: false,
      keepalive: 15,
      reconnectPeriod: 4000,
      connectTimeout: 8000,
      protocolVersion: 4,
      clean: true,
    });
    next.client = client;

    const topic = `device/${serial}/report`;
    const request = `device/${serial}/request`;

    client.on("connect", () => {
      next.connected = true;
      next.error = null;
      client.subscribe(topic, { qos: 0 });
      client.publish(
        request,
        JSON.stringify({ pushing: { sequence_id: "1", command: "pushall" } }),
      );
    });

    client.on("message", (_t, buf) => {
      try {
        const msg = JSON.parse(buf.toString()) as { print?: Record<string, unknown> };
        if (msg.print && next.onPrint) next.onPrint(msg.print);
      } catch {
        /* ignore malformed printer payloads */
      }
    });

    client.on("error", (err) => {
      next.connected = false;
      next.error = err.message || "LAN MQTT error";
    });

    client.on("close", () => {
      next.connected = false;
    });
  };

  if (stuckOffline || (!host && !next.discoveredHost)) {
    next.error = "Scanning local network for printer IP...";
    discoverPrinterIP(host, (foundIp) => {
      next.discoveredHost = foundIp;
      connectWithHost(foundIp);
    });
    setTimeout(() => {
      if (!next.client && (host || next.discoveredHost)) {
        connectWithHost(next.discoveredHost || host);
      } else if (!next.client) {
        next.error = "Could not find printer on network.";
      }
    }, 3200);
  } else {
    connectWithHost(next.discoveredHost || host);
  }
}