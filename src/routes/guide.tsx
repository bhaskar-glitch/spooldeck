import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({ component: GuidePage });

function GuidePage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">How the A1 automates this</h1>
      <p className="mt-3 text-muted">
        A Bambu Lab A1 without AMS cannot weigh the roll. Remaining grams are bookkept. What the
        printer <em>does</em> publish — print start, progress, finish, fail, and Studio’s used grams —
        is enough to run the ledger with the tablet left open next to the machine.
      </p>

      <ol className="mt-8 space-y-6">
        <li className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">1 · Load once</p>
          <h2 className="mt-1 text-lg font-semibold">Tell the tablet which roll is on the holder</h2>
          <p className="mt-2 text-sm text-muted">
            No RFID without AMS, so this tap is the only required manual step. After that, SpoolDeck
            assumes every job the A1 reports belongs to the loaded spool.
          </p>
        </li>
        <li className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">2 · Network</p>
          <h2 className="mt-1 text-lg font-semibold">Listen while you print</h2>
          <p className="mt-2 text-sm text-muted">
            Leave the Deck open on the tablet. SpoolDeck polls Bambu Cloud every few seconds (or runs
            the live demo here). When Studio sends a job, a print row opens. When the A1 reports
            FINISH, slicer grams are deducted. Failed prints take a percentage of that estimate. Jobs
            that finished in the last 45 minutes while the tablet was asleep are imported on the next
            poll so nothing is dropped.
          </p>
        </li>
        <li className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">3 · Optional precision</p>
          <h2 className="mt-1 text-lg font-semibold">Weigh only when you care</h2>
          <p className="mt-2 text-sm text-muted">
            Kitchen-scale the finished part to overwrite Studio’s number, or weigh the whole spool
            (minus empty spool weight) to snap remaining back to ground truth. Skip both — the
            automated estimate is what “will this print fit?” needs.
          </p>
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-semibold">What the A1 can and cannot say</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Signal</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Used for</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="px-3 py-2">RUNNING / FINISH / FAILED</td>
              <td className="px-3 py-2 text-muted">Printer status</td>
              <td className="px-3 py-2 text-muted">Open and close the job</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Studio used_g / task weight</td>
              <td className="px-3 py-2 text-muted">Cloud task / 3MF</td>
              <td className="px-3 py-2 text-muted">Grams to deduct</td>
            </tr>
            <tr>
              <td className="px-3 py-2">External tray type / colour</td>
              <td className="px-3 py-2 text-muted">vt_tray</td>
              <td className="px-3 py-2 text-muted">Confirm the loaded spool</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Remaining grams</td>
              <td className="px-3 py-2 text-danger">Not published without AMS</td>
              <td className="px-3 py-2 text-muted">Tracked here instead</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Cloud vs LAN</h2>
      <p className="mt-2 text-sm text-muted">
        Host SpoolDeck on the laptop that shares Wi-Fi with the A1. Open the A1 badge → LAN, paste
        printer IP, serial (Settings → Device), and access code. Username is always{" "}
        <span className="font-mono">bblp</span>, port 8883. That is the same MQTT feed Studio uses,
        so Retry / Print again on the printer screen shows on the tablet.
      </p>
      <p className="mt-3 text-sm text-muted">
        Cloud token is optional: it lists jobs sent from Studio/Handy but often misses screen
        retries. Demo mode on this page still simulates a send, progress, and auto-deduct without a
        printer.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Why not the open-source stack?</h2>
      <p className="mt-2 text-sm text-muted">
        Those projects are excellent if you have AMS or Home Assistant. They are a poor fit for a
        naked A1 plus a spare tablet.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Project</th>
              <th className="px-3 py-2 font-medium">Needs</th>
              <th className="px-3 py-2 font-medium">A1, no AMS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="px-3 py-2">Spoolman</td>
              <td className="px-3 py-2 text-muted">Docker on Windows</td>
              <td className="px-3 py-2 text-muted">Inventory only, no A1 automation</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Bambu-Filament-Tracker</td>
              <td className="px-3 py-2 text-muted">Cloud MQTT + AMS</td>
              <td className="px-3 py-2 text-danger">No remain data without AMS</td>
            </tr>
            <tr>
              <td className="px-3 py-2">bambulab-ams-spoolman</td>
              <td className="px-3 py-2 text-muted">LAN MQTT + AMS</td>
              <td className="px-3 py-2 text-danger">A1 AMS Lite is read-only / unsupported</td>
            </tr>
            <tr>
              <td className="px-3 py-2">FilamentIQ / SpoolmanSync</td>
              <td className="px-3 py-2 text-muted">Home Assistant</td>
              <td className="px-3 py-2 text-muted">Overkill for one external holder</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Bambuddy</td>
              <td className="px-3 py-2 text-muted">Windows + printer LAN</td>
              <td className="px-3 py-2 text-muted">Built around AMS slots</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}