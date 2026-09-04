import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CustomerInquiry, InquiryStatus, InquiryStats } from '../types';
import { getSupabaseClient, isSupabaseConfigured, bootstrapSupabaseFromBackend } from '../lib/supabase';
import {
  supabaseFetchInquiries,
  supabaseUpdateInquiryStatus,
  supabaseDeleteInquiry,
  inquiryFromDB,
} from '../services/supabaseService';

export type RealtimeConnectionState = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';

interface InquiryRealtimeContextValue {
  inquiries: CustomerInquiry[];
  stats: InquiryStats;
  isLoading: boolean;
  realtimeStatus: RealtimeConnectionState;
  lastSyncedAt: Date | null;
  lastEventAt: Date | null;
  supabaseConfigured: boolean;
  newInquiryAlert: CustomerInquiry | null;
  dismissNewInquiryAlert: () => void;
  refreshInquiries: () => Promise<void>;
  updateInquiryStatus: (id: string, newStatus: InquiryStatus) => Promise<boolean>;
  deleteInquiry: (id: string) => Promise<boolean>;
  reconnectRealtime: () => void;
}

const InquiryRealtimeContext = createContext<InquiryRealtimeContextValue | undefined>(undefined);

// Web Audio synthesizer for pleasant new-inquiry bell chime
const playInquiryChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant dual chime chord simulation: D5 (587.33Hz) -> A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio might be muted or blocked by browser before user interaction
  }
};

export const InquiryRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionState>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
  const [newInquiryAlert, setNewInquiryAlert] = useState<CustomerInquiry | null>(null);

  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const configured = isSupabaseConfigured();

  // Deduplication & Sorting helper (newest first)
  const mergeInquiries = useCallback((currentList: CustomerInquiry[], incomingItem: CustomerInquiry): CustomerInquiry[] => {
    const existingIndex = currentList.findIndex(
      (item) => item.id === incomingItem.id || item.inquiryId === incomingItem.inquiryId
    );

    let updatedList: CustomerInquiry[];
    if (existingIndex >= 0) {
      // Update existing item in place
      updatedList = [...currentList];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...incomingItem,
      };
    } else {
      // Add new item at the top
      updatedList = [incomingItem, ...currentList];
    }

    // Always sort by createdAt descending
    return updatedList.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  // Compute live statistics dynamically from inquiries list
  const stats: InquiryStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return {
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === 'new').length,
      pendingCount: inquiries.filter((i) => i.status === 'pending').length,
      contactedCount: inquiries.filter((i) => i.status === 'contacted').length,
      completedCount: inquiries.filter((i) => i.status === 'completed').length,
      cancelledCount: inquiries.filter((i) => i.status === 'cancelled').length,
      todayCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= todayStart).length,
      thisWeekCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= weekAgo).length,
      thisMonthCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= monthStart).length,
    };
  }, [inquiries]);

  // Sync latest inquiries from Supabase PostgreSQL & Server API
  const refreshInquiries = useCallback(async () => {
    try {
      // 1. Try Supabase direct fetch first if configured
      if (isSupabaseConfigured()) {
        const supaInquiries = await supabaseFetchInquiries();
        if (supaInquiries && supaInquiries.length > 0) {
          if (isMountedRef.current) {
            setInquiries((prev) => {
              // Merge all items to prevent loss of in-flight local modifications
              const map = new Map<string, CustomerInquiry>();
              supaInquiries.forEach((item) => map.set(item.id || item.inquiryId, item));
              prev.forEach((item) => {
                const key = item.id || item.inquiryId;
                if (!map.has(key)) {
                  map.set(key, item);
                }
              });
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
            setLastSyncedAt(new Date());
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Fetch from backend API
      const token = typeof window !== 'undefined' ? localStorage.getItem('reveg_admin_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-admin-token'] = token;
      }

      const res = await fetch('/api/inquiries', { headers });
      if (res.ok) {
        const data: CustomerInquiry[] = await res.json();
        if (isMountedRef.current) {
          setInquiries(data);
          setLastSyncedAt(new Date());
        }
      } else {
        // Fallback: try Supabase fetch
        const supaInquiries = await supabaseFetchInquiries();
        if (isMountedRef.current) {
          setInquiries(supaInquiries);
          setLastSyncedAt(new Date());
        }
      }
    } catch (err) {
      console.warn('Inquiry refresh notice:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Update inquiry status (propagates to Supabase PostgreSQL & API)
  const updateInquiryStatus = useCallback(
    async (id: string, newStatus: InquiryStatus): Promise<boolean> => {
      // 1. Optimistic update immediately so UI updates in 0ms
      const updatedAt = new Date().toISOString();
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id || inq.inquiryId === id ? { ...inq, status: newStatus, updatedAt } : inq
        )
      );

      // 2. Update Supabase PostgreSQL (fires Realtime UPDATE to all other connected sessions)
      let supaSuccess = false;
      try {
        const res = await supabaseUpdateInquiryStatus(id, newStatus);
        supaSuccess = res.success;
      } catch (err) {
        console.warn('Supabase status update error:', err);
      }

      // 3. Update Server API
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('reveg_admin_token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-admin-token'] = token;
        }

        const res = await fetch(`/api/inquiries/${id}/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok && !supaSuccess) {
          // Rollback on complete failure
          await refreshInquiries();
          return false;
        }
      } catch (err) {
        console.warn('API status update notice:', err);
      }

      return true;
    },
    [refreshInquiries]
  );

  // Delete inquiry
  const deleteInquiry = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic delete
      setInquiries((prev) => prev.filter((inq) => inq.id !== id && inq.inquiryId !== id));

      // Delete from Supabase
      try {
        await supabaseDeleteInquiry(id);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }

      // Delete from API
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('reveg_admin_token') : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-admin-token'] = token;
        }
        await fetch(`/api/inquiries/${id}`, { method: 'DELETE', headers });
      } catch (err) {
        console.warn('API delete warning:', err);
      }

      return true;
    },
    []
  );

  // Setup Supabase Realtime Subscription Lifecycle
  const setupRealtimeSubscription = useCallback(() => {
    const client = getSupabaseClient();
    if (!client) {
      setRealtimeStatus('disconnected');
      return;
    }

    setRealtimeStatus('connecting');

    // Clean up existing channel if any
    if (channelRef.current) {
      try {
        client.removeChannel(channelRef.current);
      } catch {
        // Ignored
      }
      channelRef.current = null;
    }

    try {
      // Single dedicated Realtime channel for inquiries
      const channelName = `reveg_crm_inquiries_${Date.now()}`;
      const channel = client.channel(channelName);

      // Handle Realtime INSERT
      const handleInsert = (payload: any) => {
        if (!payload.new) return;
        const newInquiry = inquiryFromDB(payload.new);

        setInquiries((prev) => {
          const exists = prev.some(
            (i) => i.id === newInquiry.id || i.inquiryId === newInquiry.inquiryId
          );
          if (exists) {
            return prev.map((i) =>
              i.id === newInquiry.id || i.inquiryId === newInquiry.inquiryId ? newInquiry : i
            );
          }
          return [newInquiry, ...prev];
        });

        setLastEventAt(new Date());

        // Play gentle audio chime and show notification toast
        playInquiryChime();
        setNewInquiryAlert(newInquiry);
      };

      // Handle Realtime UPDATE
      const handleUpdate = (payload: any) => {
        if (!payload.new) return;
        const updatedInquiry = inquiryFromDB(payload.new);

        setInquiries((prev) => {
          const index = prev.findIndex(
            (i) => i.id === updatedInquiry.id || i.inquiryId === updatedInquiry.inquiryId
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...updatedInquiry };
            return next;
          }
          // If not in list, add it
          return [updatedInquiry, ...prev];
        });

        setLastEventAt(new Date());
      };

      // Handle Realtime DELETE
      const handleDelete = (payload: any) => {
        const deletedId = payload.old?.id || payload.old?.inquiry_id;
        if (!deletedId) return;

        setInquiries((prev) =>
          prev.filter((i) => i.id !== deletedId && i.inquiryId !== deletedId)
        );
        setLastEventAt(new Date());
      };

      // Subscribe to both reveg_inquiries and standard inquiries tables
      channel
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'reveg_inquiries' },
          handleInsert
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'inquiries' },
          handleInsert
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'reveg_inquiries' },
          handleUpdate
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'inquiries' },
          handleUpdate
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'reveg_inquiries' },
          handleDelete
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'inquiries' },
          handleDelete
        )
        .subscribe((status: string, err?: any) => {
          if (!isMountedRef.current) return;

          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
            // Reconnected/subscribed: synchronize to catch any events that occurred while offline
            refreshInquiries();
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('reconnecting');
            console.warn(`Supabase Realtime ${status}:`, err);
            // Schedule auto-recovery reconnect
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setupRealtimeSubscription();
              }
            }, 5000);
          } else if (status === 'CLOSED') {
            setRealtimeStatus('disconnected');
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error('Failed to setup Supabase Realtime channel:', err);
      setRealtimeStatus('error');
    }
  }, [refreshInquiries]);

  // Initial load & subscription lifecycle
  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      if (!isSupabaseConfigured()) {
        await bootstrapSupabaseFromBackend();
      }
      if (isMountedRef.current) {
        refreshInquiries();
        setupRealtimeSubscription();
      }
    };

    init();

    // Listen to network online event to re-sync
    const handleOnline = () => {
      setupRealtimeSubscription();
      refreshInquiries();
    };

    window.addEventListener('online', handleOnline);

    // BroadcastChannel for instant zero-latency cross-tab & local notification sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('reveg_inquiries_realtime');
        bc.onmessage = (event) => {
          const data = event.data;
          if (data?.type === 'INQUIRY_INSERT' && data.inquiry) {
            setInquiries((prev) => {
              const exists = prev.some(
                (i) => i.id === data.inquiry.id || i.inquiryId === data.inquiry.inquiryId
              );
              if (exists) {
                return prev.map((i) =>
                  i.id === data.inquiry.id || i.inquiryId === data.inquiry.inquiryId
                    ? { ...i, ...data.inquiry }
                    : i
                );
              }
              return [data.inquiry, ...prev];
            });
            setLastEventAt(new Date());
            playInquiryChime();
            setNewInquiryAlert(data.inquiry);
          } else if (data?.type === 'INQUIRY_STATUS_UPDATE' && data.id) {
            setInquiries((prev) =>
              prev.map((i) =>
                i.id === data.id || i.inquiryId === data.id
                  ? { ...i, status: data.status, updatedAt: new Date().toISOString() }
                  : i
              )
            );
            setLastEventAt(new Date());
          }
        };
      } catch (e) {
        console.debug('BroadcastChannel not initialized:', e);
      }
    }

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      clearTimeout(reconnectTimeoutRef.current);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      const client = getSupabaseClient();
      if (client && channelRef.current) {
        try {
          client.removeChannel(channelRef.current);
        } catch {
          // Ignored
        }
      }
    };
  }, [refreshInquiries, setupRealtimeSubscription]);

  // Fallback synchronization interval (30s) only if Realtime is disconnected or reconnecting
  useEffect(() => {
    if (realtimeStatus === 'connected') return;

    const interval = setInterval(() => {
      if (realtimeStatus !== 'connected') {
        refreshInquiries();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [realtimeStatus, refreshInquiries]);

  const dismissNewInquiryAlert = useCallback(() => {
    setNewInquiryAlert(null);
  }, []);

  const reconnectRealtime = useCallback(() => {
    setupRealtimeSubscription();
    refreshInquiries();
  }, [setupRealtimeSubscription, refreshInquiries]);

  return (
    <InquiryRealtimeContext.Provider
      value={{
        inquiries,
        stats,
        isLoading,
        realtimeStatus,
        lastSyncedAt,
        lastEventAt,
        supabaseConfigured: configured,
        newInquiryAlert,
        dismissNewInquiryAlert,
        refreshInquiries,
        updateInquiryStatus,
        deleteInquiry,
        reconnectRealtime,
      }}
    >
      {children}
    </InquiryRealtimeContext.Provider>
  );
};

export const useInquiryRealtime = () => {
  const ctx = useContext(InquiryRealtimeContext);
  if (!ctx) {
    throw new Error('useInquiryRealtime must be used within an InquiryRealtimeProvider');
  }
  return ctx;
};
