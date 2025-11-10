import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import './App.css';

type RequestType = 'Fetch/XHR' | 'Socket';

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  response_time: number;
  headers: {
    request: Record<string, string>;
    response: Record<string, string>;
  };
  response: string;
  type: RequestType;
}

interface ConsoleLog {
  level: string;
  message: string;
}

type DetailTab = 'General' | 'Headers' | 'Response';
type FilterType = 'All' | RequestType;

function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState('network');
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [expandedLogIndices, setExpandedLogIndices] = useState<Set<number>>(new Set());
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('General');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [urlFilter, setUrlFilter] = useState<string>('');
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [logMessageFilter, setLogMessageFilter] = useState<string>('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };

  useEffect(() => {
    const unlistenNetwork = listen<NetworkRequest>('network-log', (event) => {
      setNetworkRequests((prev) => [event.payload, ...prev]);
    });

    const unlistenConsole = listen<ConsoleLog>('console-log', (event) => {
      setConsoleLogs((prev) => [event.payload, ...prev]);
    });

    return () => {
      unlistenNetwork.then(f => f());
      unlistenConsole.then(f => f());
    };
  }, []);

  const generateMockData = async () => {
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Server': 'MockServer/1.0',
      'Date': new Date().toUTCString(),
    };
    if (Math.random() > 0.5) {
      responseHeaders['Access-Control-Allow-Origin'] = '*';
    }

    const mockNetworkRequest: NetworkRequest = {
      id: Math.random().toString(36).substring(7),
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      url: `https://api.example.com/users/${Math.floor(Math.random() * 100)}`,
      status: [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)],
      response_time: Math.floor(Math.random() * 500) + 50,
      headers: {
        request: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token-12345',
          'User-Agent': 'DevLens/1.0',
        },
        response: responseHeaders,
      },
      response: JSON.stringify({
        userId: Math.floor(Math.random() * 100),
        name: 'Mock User',
        email: 'mock.user@example.com',
      }, null, 2),
      type: Math.random() > 0.5 ? 'Fetch/XHR' : 'Socket',
    };

    const mockConsoleLog: ConsoleLog = {
      level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
      message: `This is a mock ${['info', 'warning', 'error'][Math.floor(Math.random() * 3)]} message from ${new Date().toISOString()}`,
    };

    try {
      await invoke('log_network', { request: { ...mockNetworkRequest, request_type: mockNetworkRequest.type } });
      await invoke('log_console', { log: mockConsoleLog });
    } catch (e) {
      console.error("Error invoking command:", e);
    }
  };

  const toggleRequestDetails = (id: string) => {
    if (expandedRequestId === id) {
      setExpandedRequestId(null);
    } else {
      setExpandedRequestId(id);
      setActiveDetailTab('General');
    }
  };

  const renderDetailView = (req: NetworkRequest) => {
    const detailTabs: { key: DetailTab; label: string }[] = [
      { key: 'General', label: t('general') },
      { key: 'Headers', label: t('headers') },
      { key: 'Response', label: t('response') },
    ];
    return (
      <div className="p-4 bg-base-200">
        <div role="tablist" className="tabs tabs-bordered">
          {detailTabs.map(tab => (
            <a
              key={tab.key}
              role="tab"
              className={`tab outline-none ${activeDetailTab === tab.key ? 'tab-active' : ''}`}
              onClick={() => setActiveDetailTab(tab.key)}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <div className="mt-4">
          {activeDetailTab === 'General' && (
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
              <span className="font-semibold opacity-70">{t('requestUrl')}:</span>
              <span className="font-mono text-sm break-all">{req.url}</span>
              <span className="font-semibold opacity-70">{t('requestMethod')}:</span>
              <span className="badge badge-primary">{req.method}</span>
              <span className="font-semibold opacity-70">{t('statusCode')}:</span>
              <span className={`badge ${req.status >= 400 ? 'badge-error' : 'badge-success'}`}>{req.status}</span>
              <span className="font-semibold opacity-70">{t('type')}:</span>
              <span className="badge badge-outline">{req.type}</span>
            </div>
          )}
          {activeDetailTab === 'Headers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3 opacity-70">{t('requestHeaders')}</h3>
                {renderHeaders(req.headers.request)}
              </div>
              <div className="divider my-4"></div>
              <div>
                <h3 className="text-sm font-bold mb-3 opacity-70">{t('responseHeaders')}</h3>
                {renderHeaders(req.headers.response)}
              </div>
            </div>
          )}
          {activeDetailTab === 'Response' && (
            <div className="bg-base-300 rounded-lg p-4">
              <pre className="text-xs font-mono overflow-x-auto">
                <code>{req.response ? JSON.stringify(JSON.parse(req.response), null, 2) : ''}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHeaders = (headers: Record<string, string>) => (
    <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
      {Object.entries(headers).map(([key, value]) => (
        <React.Fragment key={key}>
          <span className="font-semibold opacity-70 truncate">{key}:</span>
          <span className="break-all font-mono text-xs">{value}</span>
        </React.Fragment>
      ))}
    </div>
  );

  const filteredRequests = networkRequests.filter(req => {
    const typeMatch = filterType === 'All' || req.type === filterType;
    const urlMatch = req.url.toLowerCase().includes(urlFilter.toLowerCase());
    return typeMatch && urlMatch;
  });

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="App Icon" className="w-8 h-8 text-red-50" />
            <span className="text-xl font-bold">{t('appName')}</span>
          </div>
        </div>
        <div className="navbar-center">
          <div role="tablist" className="tabs tabs-boxed">
            <a
              role="tab"
              className={`tab outline-none ${activeTab === 'network' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('network')}
            >
              {t('network')}
            </a>
            <a
              role="tab"
              className={`tab outline-none ${activeTab === 'console' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              {t('console')}
            </a>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <button
            className="btn btn-ghost btn-sm btn-circle outline-none"
            onClick={toggleTheme}
            title={t('theme')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            className="btn btn-ghost btn-sm outline-none"
            onClick={toggleLanguage}
            title={t('language')}
          >
            {i18n.language === 'zh' ? 'EN' : '中'}
          </button>
          <button
            className="btn btn-error btn-sm outline-none"
            onClick={() => {
              if (activeTab === 'network') {
                setNetworkRequests([]);
                setExpandedRequestId(null);
              } else {
                setConsoleLogs([]);
              }
            }}
            title={t('clearAll')}
          >
            {t('clear')}
          </button>
          <button className="btn btn-success btn-sm outline-none" onClick={generateMockData}>
            {t('generateMockData')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="grow p-4 overflow-y-auto">
        {activeTab === 'network' && (
          <div className="flex flex-col h-full gap-4">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
              <input
                type="text"
                placeholder={t('filterByUrl')}
                className="input input-sm grow bg-base-200 border-base-300 outline-none focus:outline-none focus:border-primary"
                value={urlFilter}
                onChange={(e) => setUrlFilter(e.target.value)}
              />
              <div className="join">
                {(['All', 'Fetch/XHR', 'Socket'] as FilterType[]).map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm join-item outline-none ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'All' ? t('all') : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Network Requests */}
            <div className="grow overflow-hidden bg-base-100 rounded-lg border border-base-300">
              <div className="h-full overflow-y-auto">
                {filteredRequests.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-base-content opacity-50">{t('noRequests')}</p>
                  </div>
                ) : (
                  <div>
                    {filteredRequests.map((req) => (
                      <div key={req.id} className="border-b border-base-300 last:border-b-0">
                        <div
                          onClick={() => toggleRequestDetails(req.id)}
                          className="grid grid-cols-[100px_1fr_80px_100px] items-center p-4 hover:bg-base-200 cursor-pointer transition-colors"
                        >
                          <span className="badge badge-primary font-mono">{req.method}</span>
                          <span className="truncate text-sm">{req.url}</span>
                          <span className={`badge ${req.status >= 400 ? 'badge-error' : 'badge-success'} font-bold`}>
                            {req.status}
                          </span>
                          <span className="font-mono text-sm text-right opacity-70">{req.response_time}ms</span>
                        </div>
                        {expandedRequestId === req.id && renderDetailView(req)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="flex flex-col h-full gap-4">
            {/* Console Filters */}
            <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
              <input
                type="text"
                placeholder={t('filterByMessage')}
                className="input input-sm grow bg-base-200 border-base-300 outline-none focus:outline-none focus:border-primary"
                value={logMessageFilter}
                onChange={(e) => setLogMessageFilter(e.target.value)}
              />
              <div className="join">
                {(['all', 'info', 'warn', 'error'] as const).map(level => (
                  <button
                    key={level}
                    className={`btn btn-sm join-item outline-none ${logLevelFilter === level ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setLogLevelFilter(level)}
                  >
                    {level === 'all' ? t('all') : level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grow overflow-hidden bg-base-100 rounded-lg border border-base-300">
              <div className="h-full overflow-y-auto">
                {consoleLogs.filter(log => {
                  const levelMatch = logLevelFilter === 'all' || log.level === logLevelFilter;
                  const messageMatch = log.message.toLowerCase().includes(logMessageFilter.toLowerCase());
                  return levelMatch && messageMatch;
                }).length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-base-content opacity-50">
                      {consoleLogs.length === 0 ? t('waitingForLogs') : t('noLogsMatch')}
                    </p>
                  </div>
                ) : (
                  <div>
                    {consoleLogs
                      .map((log, index) => ({ log, index }))
                      .filter(({ log }) => {
                        const levelMatch = logLevelFilter === 'all' || log.level === logLevelFilter;
                        const messageMatch = log.message.toLowerCase().includes(logMessageFilter.toLowerCase());
                        return levelMatch && messageMatch;
                      })
                      .map(({ log, index }) => {
                      const isExpanded = expandedLogIndices.has(index);
                      const lines = log.message.split('\n');
                      const shouldTruncate = lines.length > 3;
                      const displayMessage = !isExpanded && shouldTruncate
                        ? lines.slice(0, 3).join('\n')
                        : log.message;

                      return (
                        <div
                          key={index}
                          className={`p-4 border-b border-base-300 last:border-b-0 ${
                            log.level === 'error'
                              ? 'bg-error bg-opacity-10'
                              : log.level === 'warn'
                              ? 'bg-warning bg-opacity-10'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`badge badge-sm shrink-0 ${
                                log.level === 'error'
                                  ? 'badge-error'
                                  : log.level === 'warn'
                                  ? 'badge-warning'
                                  : 'badge-info'
                              }`}
                            >
                              {log.level.toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {shouldTruncate && (
                                  <button
                                    className="btn btn-ghost btn-xs outline-none"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedLogIndices);
                                      if (isExpanded) {
                                        newExpanded.delete(index);
                                      } else {
                                        newExpanded.add(index);
                                      }
                                      setExpandedLogIndices(newExpanded);
                                    }}
                                  >
                                    {isExpanded
                                      ? `▲ ${t('showLess')}`
                                      : `▼ ${t('showMore')} (${lines.length - 3} ${t('moreLines')})`}
                                  </button>
                                )}
                                <button
                                  className="btn btn-ghost btn-xs outline-none"
                                  onClick={() => {
                                    navigator.clipboard.writeText(log.message);
                                  }}
                                  title={t('copy')}
                                >
                                  📋 {t('copy')}
                                </button>
                              </div>
                              <pre className="font-mono text-sm whitespace-pre-wrap break-all m-0">
                                {displayMessage}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
