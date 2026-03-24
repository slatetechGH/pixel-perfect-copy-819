import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  producerId: string;
  onImported: () => void;
}

interface ParsedRow {
  email: string;
  name?: string;
  phone?: string;
}

export function ImportContactsModal({ open, onClose, producerId, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [columnMap, setColumnMap] = useState<{ email: number; name: number; phone: number }>({ email: -1, name: -1, phone: -1 });
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV must have a header row and at least one data row"); return; }
    const hdrs = lines[0].split(",").map(h => h.trim().replace(/^"(.*)"$/, "$1"));
    setHeaders(hdrs);
    const rows = lines.slice(1).map(l => l.split(",").map(c => c.trim().replace(/^"(.*)"$/, "$1")));
    setAllRows(rows);

    // Auto-detect columns
    const emailIdx = hdrs.findIndex(h => /email/i.test(h));
    const nameIdx = hdrs.findIndex(h => /name/i.test(h));
    const phoneIdx = hdrs.findIndex(h => /phone|mobile|tel/i.test(h));
    setColumnMap({ email: emailIdx, name: nameIdx, phone: phoneIdx });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(f);
  };

  const mappedRows: ParsedRow[] = allRows
    .map(row => ({
      email: columnMap.email >= 0 ? row[columnMap.email] : "",
      name: columnMap.name >= 0 ? row[columnMap.name] : undefined,
      phone: columnMap.phone >= 0 ? row[columnMap.phone] : undefined,
    }))
    .filter(r => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

  const handleImport = async () => {
    if (mappedRows.length === 0) { toast.error("No valid email addresses found"); return; }
    setImporting(true);
    try {
      const rows = mappedRows.map(r => ({
        producer_id: producerId,
        email: r.email.toLowerCase(),
        name: r.name || null,
        phone: r.phone || null,
        source: "imported",
        status: "imported",
      }));

      // Batch insert, ignoring duplicates via onConflict
      const { data, error } = await supabase
        .from("contacts")
        .upsert(rows as any[], { onConflict: "producer_id,email", ignoreDuplicates: true })
        .select();

      const inserted = data?.length || 0;
      const skipped = mappedRows.length - inserted;
      toast.success(`Imported ${inserted} contacts.${skipped > 0 ? ` ${skipped} duplicates skipped.` : ""}`);
      onImported();
      handleReset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsed([]);
    setHeaders([]);
    setAllRows([]);
    setColumnMap({ email: -1, name: -1, phone: -1 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-foreground">Import Contacts</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!file ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-[14px] font-medium text-foreground mb-1">Drop a CSV file here or click to upload</p>
            <p className="text-[12px] text-muted-foreground">Accepts .csv files</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[13px]">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{file.name}</span>
              <button onClick={handleReset} className="text-muted-foreground hover:text-foreground ml-auto cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {headers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Column Mapping</p>
                {(["email", "name", "phone"] as const).map(field => (
                  <div key={field} className="flex items-center gap-3">
                    <span className="text-[13px] text-foreground capitalize w-16">{field}</span>
                    <select
                      value={columnMap[field]}
                      onChange={e => setColumnMap(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
                      className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-[13px] focus:outline-none"
                    >
                      <option value={-1}>— Skip —</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[13px] text-muted-foreground">
              {mappedRows.length} valid contacts found in file
            </p>

            {/* Preview first 5 rows */}
            {mappedRows.length > 0 && (
              <div className="text-[12px] bg-muted/50 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
                {mappedRows.slice(0, 5).map((r, i) => (
                  <div key={i} className="text-muted-foreground">
                    {r.email}{r.name ? ` — ${r.name}` : ""}
                  </div>
                ))}
                {mappedRows.length > 5 && (
                  <div className="text-muted-foreground/60">…and {mappedRows.length - 5} more</div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { handleReset(); onClose(); }}>Cancel</Button>
              <Button onClick={handleImport} disabled={importing || mappedRows.length === 0}>
                {importing ? "Importing…" : `Import ${mappedRows.length} contacts`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
