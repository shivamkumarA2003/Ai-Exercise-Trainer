"use client";

import { AppShell } from "@/components/AppShell";
import { useTrainerStore } from "@/store/trainer-store";

export default function SettingsPage() {
  const { settings, updateSettings } = useTrainerStore();
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-semibold text-ink">Settings</h1>
      <section className="grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex items-center justify-between gap-4">
          <span>Voice assistant</span>
          <input type="checkbox" checked={settings.voiceEnabled} onChange={(event) => updateSettings({ voiceEnabled: event.target.checked })} />
        </label>
        <label>
          <span className="mb-2 block">Speech speed: {settings.speechRate.toFixed(2)}x</span>
          <input className="w-full" type="range" min="0.7" max="1.3" step="0.05" value={settings.speechRate} onChange={(event) => updateSettings({ speechRate: Number(event.target.value) })} />
        </label>
        <label>
          <span className="mb-2 block">Difficulty</span>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={settings.difficulty} onChange={(event) => updateSettings({ difficulty: event.target.value as typeof settings.difficulty })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block">Sensitivity: {settings.sensitivity}</span>
          <input className="w-full" type="range" min="0.3" max="0.95" step="0.05" value={settings.sensitivity} onChange={(event) => updateSettings({ sensitivity: Number(event.target.value) })} />
        </label>
        <label>
          <span className="mb-2 block">Units</span>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={settings.units} onChange={(event) => updateSettings({ units: event.target.value as typeof settings.units })}>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>
      </section>
    </AppShell>
  );
}
