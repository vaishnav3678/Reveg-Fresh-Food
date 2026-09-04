import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useInquiryRealtime } from '../../context/InquiryRealtimeContext';
import { configureSupabaseCredentials, getSupabaseConfig } from '../../lib/supabase';
import { AdminTab } from './AdminLayout';

interface InquiryRealtimeBannerProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const InquiryRealtimeBanner: React.FC<InquiryRealtimeBannerProps> = ({ onNavigateTab }) => {
  const {
    realtimeStatus,
    lastSyncedAt,
    lastEventAt,
    supabaseConfigured,
    newInquiryAlert,
    dismissNewInquiryAlert,
    reconnectRealtime,
  } = useInquiryRealtime();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(() => getSupabaseConfig().url);
  const [inputKey, setInputKey] = useState('');
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || !inputKey) {
      setConfigMessage({ type: 'error', text: 'Please provide both Supabase URL and Anon Key.' });
      return;
    }
    const success = configureSupabaseCredentials(inputUrl, inputKey);
    if (success) {
      setConfigMessage({ type: 'success', text: 'Supabase credentials saved! Connecting Realtime...' });
      reconnectRealtime();
      setTimeout(() => {
        setShowConfigModal(false);
        setConfigMessage(null);
      }, 1200);
    } else {
      setConfigMessage({ type: 'error', text: 'Invalid Supabase URL or Key format.' });
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- Enable Supabase Realtime Publication for Inquiries
ALTER TABLE public.reveg_inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_inquiries;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <>
      {/* Realtime Status Indicator Pill in Admin Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfigModal(true)}
          className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            realtimeStatus === 'connected'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting'
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
          }`}
          title={
            realtimeStatus === 'connected'
              ? `Realtime Live: Listening to PostgreSQL changes. Last sync: ${
                  lastSyncedAt ? lastSyncedAt.toLocaleTimeString('en-IN') : 'Just now'
                }`
              : 'Realtime is connecting or configuring. Click to view status & Supabase settings.'
          }
        >
          <span className="relative flex h-2 w-2">
            {realtimeStatus === 'connected' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            {realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting' ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            ) : null}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                realtimeStatus === 'connected'
                  ? 'bg-emerald-500'
                  : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            ></span>
          </span>

          <span className="hidden sm:inline">
            {realtimeStatus === 'connected'
              ? 'Realtime: Live'
              : realtimeStatus === 'connecting'
              ? 'Realtime: Connecting...'
              : realtimeStatus === 'reconnecting'
              ? 'Realtime: Reconnecting...'
              : 'Realtime: Offline'}
          </span>
          <span className="sm:hidden">
            {realtimeStatus === 'connected' ? 'Live' : 'Offline'}
          </span>
        </button>

        {realtimeStatus !== 'connected' && (
          <button
            onClick={reconnectRealtime}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            title="Attempt manual Realtime reconnection"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Real-Time Floating Toast Notification on Actual Database INSERT */}
      {newInquiryAlert && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
        >
          <div className="bg-[#083E1B] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#F5A800] flex items-start gap-3.5">
            <div className="p-2 bg-[#F5A800] text-[#083E1B] rounded-xl shrink-0 mt-0.5 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#F5A800]">
                  ⚡ Real-Time New Inquiry
                </span>
                <span className="text-[10px] text-white/70">
                  {new Date(newInquiryAlert.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white truncate mt-0.5">
                {newInquiryAlert.customerName}
              </h4>

              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                {newInquiryAlert.product || 'Order Inquiry'}{' '}
                {newInquiryAlert.quantity ? `• ${newInquiryAlert.quantity}` : ''}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    dismissNewInquiryAlert();
                    onNavigateTab('inquiries');
                  }}
                  className="bg-[#E8590C] hover:bg-[#CC4B04] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>Open Inquiry Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={dismissNewInquiryAlert}
                  className="text-xs text-white/70 hover:text-white px-2 py-1.5 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={dismissNewInquiryAlert}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
              aria-label="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Supabase Realtime Configuration & Diagnostic Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#D5E8DA] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
                    Supabase PostgreSQL & Realtime
                  </h3>
                  <p className="text-xs text-[#557060]">
                    Real-time CRM data pipeline configuration & diagnostics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Status Card */}
            <div className="mt-5 p-4 rounded-2xl bg-[#F4F7F5] border border-[#D5E8DA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#11311D]">Realtime Subscription:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    realtimeStatus === 'connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      realtimeStatus === 'connected'
                        ? 'bg-emerald-600'
                        : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  />
                  {realtimeStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#557060]">
                <span>Tables Monitored:</span>
                <span className="font-mono text-[11px] font-semibold text-[#11311D]">
                  public.inquiries, public.reveg_inquiries
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#557060]">
                <span>Last Synchronized:</span>
                <span className="font-semibold text-[#11311D]">
                  {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('en-IN') : 'Never'}
                </span>
              </div>
              {lastEventAt && (
                <div className="flex items-center justify-between text-xs text-[#557060]">
                  <span>Last Event Received:</span>
                  <span className="font-semibold text-emerald-700">
                    {lastEventAt.toLocaleTimeString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Enablement SQL Snippet Helper */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#11311D]">
                  Database Realtime Publication SQL:
                </label>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#11311D] text-emerald-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
                <code>ALTER TABLE public.inquiries REPLICA IDENTITY FULL;</code>
                <br />
                <code>ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;</code>
              </div>
              <p className="text-[11px] text-[#557060]">
                Run this once in your Supabase SQL Editor if Realtime is not yet enabled for the table.
              </p>
            </div>

            {/* Supabase Credentials Form */}
            <form onSubmit={handleSaveConfig} className="mt-5 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#11311D]">
                Custom Supabase Connection
              </h4>

              {configMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    configMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {configMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{configMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#11311D] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5E8DA] focus:ring-2 focus:ring-[#083E1B] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11311D] mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5E8DA] focus:ring-2 focus:ring-[#083E1B] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#083E1B] hover:bg-[#062c13] rounded-xl shadow-sm transition"
                >
                  Save & Connect Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
