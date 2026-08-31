import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const ImportOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { bulkImportOrders, currentSeller, warehouses } = usePlatformStore();

  const [step, setStep] = useState<'UPLOAD' | 'MAP' | 'IMPORTING' | 'DONE'>('UPLOAD');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);

  const mockParsedRows = [
    { extId: '#CSV-901', name: 'Rohan Joshi', phone: '+91 98765 11111', pincode: '400001', amount: 1299, payment: 'PREPAID' as const, status: 'VALID' },
    { extId: '#CSV-902', name: 'Diya Kapoor', phone: '+91 98765 22222', pincode: '560001', amount: 899, payment: 'COD' as const, status: 'VALID' },
    { extId: '#CSV-903', name: 'Anish Sharma', phone: '+91 98765 33333', pincode: '00000', amount: 499, payment: 'PREPAID' as const, status: 'INVALID_PINCODE' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStep('MAP');
      toast.success(`Parsed ${file.name} successfully (3 sample records found)`);
    }
  };

  const startImporting = () => {
    setStep('IMPORTING');
    let current = 0;
    const interval = setInterval(() => {
      current += 25;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);

        const validRows = mockParsedRows.filter((r) => r.status === 'VALID');
        bulkImportOrders(
          validRows.map((r) => ({
            seller_id: currentSeller?.id || 's-101',
            warehouse_id: warehouses[0]?.id || 'wh-mumbai',
            customer_id: `cust-${Date.now()}`,
            external_order_id: r.extId,
            source: 'CSV',
            payment_type: r.payment,
            cod_amount: r.payment === 'COD' ? r.amount : 0,
            total_amount: r.amount,
            weight_kg: 0.5,
            shipping_address: {
              name: r.name,
              phone: r.phone,
              address_line1: 'CSV Imported Address Line 1',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: r.pincode,
            },
            current_status: 'NEW',
          }))
        );

        setStep('DONE');
        toast.success(`Import completed! ${validRows.length} valid orders imported into database.`);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <button onClick={() => navigate('/app/orders')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <h2 className="text-base font-extrabold text-slate-900 font-display">Bulk Import Orders (CSV / XLSX)</h2>
      </div>

      {step === 'UPLOAD' && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-4 cursor-pointer relative shadow-sm">
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <FileSpreadsheet className="w-12 h-12 text-indigo-600 mx-auto" />
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Click or drag &amp; drop CSV or Excel file</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Supports Shopify, WooCommerce, or Custom CSV export format</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs font-bold">
            Browse Files
          </Button>
        </div>
      )}

      {step === 'MAP' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Review &amp; Map Uploaded Data</h3>
              <p className="text-xs text-slate-500 font-medium">File: {fileName} (3 rows detected)</p>
            </div>
            <Button size="sm" onClick={startImporting} className="font-bold">
              Start Import Job
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ext Order ID</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Pincode</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {mockParsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{row.extId}</td>
                    <td className="p-3.5 font-bold text-slate-800">{row.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">{row.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{row.pincode}</td>
                    <td className="p-3.5 font-black text-emerald-700 font-mono">₹{row.amount}</td>
                    <td className="p-3.5 uppercase font-bold text-slate-700">{row.payment}</td>
                    <td className="p-3.5">
                      {row.status === 'VALID' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                          ✓ Valid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-extrabold text-xs border border-rose-200">
                          Invalid Pincode
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 'IMPORTING' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-base font-black text-slate-900 font-display">Processing Import Job in Web Worker...</h3>
          <div className="max-w-md mx-auto w-full bg-slate-100 border border-slate-200 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-bold">{progress}% complete</p>
        </div>
      )}

      {step === 'DONE' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-black text-slate-900 font-display">Import Job Completed</h3>
          <p className="text-xs text-slate-600 font-medium">2 orders imported, 1 skipped due to validation errors.</p>
          <Button onClick={() => navigate('/app/orders')} className="font-bold">
            View Orders Registry
          </Button>
        </div>
      )}
    </div>
  );
};

