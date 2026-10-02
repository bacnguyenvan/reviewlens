import { CreditCard } from 'lucide-react';
import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
}

function InputField({ label, value, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences.</p>
      </div>

      <SettingsSection title="Profile" description="Update your personal information.">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Change avatar</button>
            <p className="text-xs text-slate-400 mt-0.5">JPG, GIF or PNG. Max size 2MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="First name" value="Alex" />
          <InputField label="Last name" value="Morgan" />
          <div className="col-span-2">
            <InputField label="Email" value="alex@example.com" type="email" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            Save changes
          </button>
          <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Configure how you receive alerts.">
        <div className="space-y-3">
          {[
            { label: 'New insight detected', description: 'When AI finds a new pattern in your reviews', enabled: true },
            { label: 'Weekly summary', description: 'A weekly digest of your app\'s review performance', enabled: true },
            { label: 'Negative spike alert', description: 'When negative review volume increases sharply', enabled: false },
          ].map(({ label, description, enabled }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Plan" description="Manage your subscription.">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Free Plan</p>
              <p className="text-xs text-slate-500">500 reviews/month · 1 app</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
