import React, { useState } from 'react';
import { 
  Truck, Printer, CalendarCheck, Search, Download, XCircle, FileText, CheckCircle2, PackageCheck, Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Shipment } from '../../types';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const ShipmentsListPage: React.FC = () => {
  const { shipments, warehouses, schedulePickup, generateManifest } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [labelModalShipment, setLabelModalShipment] = useState<Shipment | null>(null);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [pickupCourier, setPickupCourier] = useState('c-delhivery');
  const [pickupWarehouse, setPickupWarehouse] = useState(warehouses[0]?.id || 'wh-mumbai');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [flippedAwb, setFlippedAwb] = useState<string | null>(null);

  const filteredShipments = shipments.filter((shp) => {
    const matchesSearch = 
      shp.awb_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shp.order_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || shp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    toast.success(`AWB ${awb} copied to clipboard!`);
  };

  const handlePrintLabel = (awb: string, format: 'A4' | 'THERMAL_4X6') => {
    toast.success(`Downloading label for AWB ${awb} in ${format} format!`);
    window.open('https://pdfobject.com/pdf/sample.pdf', '_blank');
  };

  const handleSchedulePickup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pickup = schedulePickup(pickupCourier, pickupWarehouse, pickupDate, filteredShipments.length || 1);
      toast.success(`Pickup scheduled successfully! Ref: ${pickup.pickup_reference}`);
      setPickupModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to schedule pickup');
    }
  };

  const handleGenerateManifest = () => {
    const shpIds = filteredShipments.map((s) => s.id);
    if (shpIds.length === 0) {
      toast.error('No shipments available for manifest generation');
      return;
    }
    const manifest = generateManifest(pickupCourier, pickupWarehouse, shpIds);
    toast.success(`Manifest ${manifest.manifest_number} generated! Ready for courier handover.`);
    setManifestModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 font-display">Shipments, Labels &amp; Manifests</h2>
          <p className="text-xs text-slate-500 font-medium">Track active AWBs, download 4x6 thermal shipping labels &amp; generate handover manifests</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" leftIcon={<CalendarCheck className="w-4 h-4" />} onClick={() => setPickupModalOpen(true)}>
            Schedule Pickup
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Layers className="w-4 h-4" />} onClick={() => setManifestModalOpen(true)}>
            Create Manifest
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={() => handlePrintLabel('BULK-ALL', 'THERMAL_4X6')}>
            Batch Print Labels (PDF)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search AWB Number or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Shipment Statuses' },
            { value: 'CREATED', label: 'Created' },
            { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'NDR', label: 'NDR' },
            { value: 'RTO_INITIATED', label: 'RTO Initiated' },
          ]}
        />
      </div>

      {/* Shipments Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Active Shipments Log</h3>
          <span className="text-xs text-slate-500 font-semibold">{filteredShipments.length} Total Shipments</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">AWB Number</th>
                <th className="p-3.5">Courier Carrier</th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Freight Cost</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No shipments found. Ship an order to generate your first AWB & label!
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold">
                      <button
                        onClick={() => handleCopyAWB(shp.awb_number)}
                        title="Click to copy AWB"
                        className="block text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {shp.awb_number}
                        <span className="text-[9px] font-mono text-indigo-400 bg-indigo-50 border border-indigo-200 px-1 rounded">
                          Copy
                        </span>
                      </button>
                      <span className="text-[10px] text-slate-500 font-sans">{shp.id}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{shp.courier_name || 'Delhivery Direct'}</td>
                    <td className="p-3.5 font-mono text-slate-700">{shp.order_id}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">₹{(shp.shipping_cost || 68).toFixed(2)}</td>
                    <td className="p-3.5"><StatusBadge status={shp.status} /></td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button size="sm" variant="outline" className="text-xs" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => setLabelModalShipment(shp)}>
                        Label
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handlePrintLabel(shp.awb_number, 'A4')}>
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label Print Options Modal with 4x6 Preview Flip */}
      <Modal
        isOpen={!!labelModalShipment}
        onClose={() => {
          setLabelModalShipment(null);
          setFlippedAwb(null);
        }}
        title={`Shipping Label — AWB ${labelModalShipment?.awb_number}`}
        subtitle="Hover or click preview to inspect thermal barcode before printing"
      >
        <div className="space-y-4">
          {/* Thermal Label Flip Card Visual Preview */}
          <div
            onClick={() => setFlippedAwb(flippedAwb ? null : labelModalShipment?.awb_number || null)}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-xs space-y-3 cursor-pointer transition-all hover:border-indigo-500 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-extrabold text-indigo-400">EXPRESS AIR • 4x6 THERMAL</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                {labelModalShipment?.courier_name?.toUpperCase() || 'DELHIVERY'}
              </span>
            </div>

            <div className="py-2 text-center bg-white text-slate-950 p-2 rounded-lg font-black tracking-widest text-base font-mono">
              ||||||| | ||||| |||| ||||| |||||||
              <span className="block text-xs font-bold text-slate-700">{labelModalShipment?.awb_number}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block">DESTINATION PINCODE</span>
                <strong className="text-white">411001 (PUNE)</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">PAYMENT MODE</span>
                <strong className="text-emerald-400">PREPAID (₹799.00)</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                handlePrintLabel(labelModalShipment!.awb_number, 'THERMAL_4X6');
                setLabelModalShipment(null);
              }}
              className="p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-center space-y-1 cursor-pointer transition-all shadow-lg"
            >
              <Printer className="w-6 h-6 text-white mx-auto" />
              <span className="block font-bold text-xs">Print 4x6 Thermal Roll</span>
            </button>

            <button
              onClick={() => {
                handlePrintLabel(labelModalShipment!.awb_number, 'A4');
                setLabelModalShipment(null);
              }}
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center space-y-1 cursor-pointer transition-all"
            >
              <FileText className="w-6 h-6 text-slate-300 mx-auto" />
              <span className="block font-bold text-xs">Download A4 Invoice PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Schedule Pickup Modal */}
      <Modal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        title="Schedule Courier Pickup"
        subtitle="Request courier pickup executive visit at your warehouse"
      >
        <form onSubmit={handleSchedulePickup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Warehouse</label>
            <select
              value={pickupWarehouse}
              onChange={(e) => setPickupWarehouse(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} — {wh.city} ({wh.pincode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Courier Partner</label>
            <select
              value={pickupCourier}
              onChange={(e) => setPickupCourier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="c-delhivery">Delhivery Direct</option>
              <option value="c-xpressbees">Xpressbees Express</option>
              <option value="c-ecom">Ecom Express</option>
              <option value="c-shadowfax">Shadowfax Local</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setPickupModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Confirm Pickup Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Handover Manifest Modal */}
      <Modal
        isOpen={manifestModalOpen}
        onClose={() => setManifestModalOpen(false)}
        title="Generate Handover Manifest"
        subtitle="Create official courier handover document for ready shipments"
      >
        <div className="space-y-4 text-slate-300 text-sm">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Packages:</span>
              <strong className="text-white">{filteredShipments.length} AWBs</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Pickup Warehouse:</span>
              <strong className="text-white">{warehouses[0]?.name || 'Bhiwandi Hub'}</strong>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setManifestModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleGenerateManifest}>
              Generate & Download Manifest PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
