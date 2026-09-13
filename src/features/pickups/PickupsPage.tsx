import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import type { PickupRequest } from '../../types';
import { fetchPickupOperations, updatePickupRequest } from '../../services/supabaseOperations';

export const PickupsPage: React.FC = () => {
  const [rows, setRows] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setRows(await fetchPickupOperations()); } catch (e) { toast.error(e instanceof Error ? e.message : 'Unable to load pickups'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const transition = async (row: PickupRequest, status: PickupRequest['status']) => { try { await updatePickupRequest(row.id, status, status === 'FAILED' ? 'Pickup was not completed by carrier' : undefined); toast.success(`Pickup marked ${status.replace(/_/g, ' ').toLowerCase()}`); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Pickup update failed'); } };
  return <div className="space-y-5">
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between"><div><h1 className="font-black text-xl flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-indigo-600"/>Pickup Operations</h1><p className="text-xs text-slate-500 mt-1">Carrier handover schedule, package count and pickup exceptions</p></div><Button size="sm" variant="outline" onClick={() => void load()} leftIcon={<RefreshCw className="w-4 h-4"/>}>Refresh</Button></div>
    <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-600"><tr>{['Reference','Date','Courier','Packages','Status','Action'].map(x=><th key={x} className="p-4 text-left uppercase tracking-wide">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row=><tr key={row.id}><td className="p-4 font-mono font-bold">{row.pickup_reference || row.id.slice(0,8)}</td><td className="p-4">{new Date(row.pickup_date).toLocaleDateString('en-IN')}</td><td className="p-4 font-bold">{row.courier_name || 'Courier partner'}</td><td className="p-4">{row.expected_package_count || 0}</td><td className="p-4 font-bold">{row.status.replace(/_/g,' ')}</td><td className="p-4 flex gap-2">{['REQUESTED','SCHEDULED'].includes(row.status) && <><Button size="sm" onClick={()=>void transition(row,'PICKED_UP')} leftIcon={<CheckCircle2 className="w-3.5 h-3.5"/>}>Confirm handover</Button><Button size="sm" variant="outline" onClick={()=>void transition(row,'FAILED')}>Report failure</Button></>}</td></tr>)}{!loading && !rows.length && <tr><td colSpan={6} className="p-12 text-center text-slate-500"><Truck className="w-8 h-8 mx-auto mb-2"/>No pickups scheduled yet.</td></tr>}</tbody></table></div>
  </div>;
};
