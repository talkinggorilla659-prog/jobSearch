import { useState } from 'react';
import { ProfileSettings } from './ProfileSettings';
import { ApiKeySettings } from './ApiKeySettings';
import { DataSettings } from './DataSettings';

type Tab = 'profile' | 'api' | 'data';

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'api', label: 'API Keys' },
    { id: 'data', label: 'Data' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'api' && <ApiKeySettings />}
      {activeTab === 'data' && <DataSettings />}

      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">JobHunt v1.0.0</p>
          <p>
            Open source under{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MIT License
            </a>
          </p>
          <p className="mt-2">Built to help job seekers during tough times.</p>
        </div>
      </div>
    </div>
  );
}
