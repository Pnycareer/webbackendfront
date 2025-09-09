"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileDown, RefreshCw, Search } from "lucide-react";

// Utils
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const withinRange = (iso, start, end) => {
  if (!iso) return false;
  const t = new Date(iso).setHours(0, 0, 0, 0);
  const s = start ? new Date(start).setHours(0, 0, 0, 0) : null;
  const e = end ? new Date(end).setHours(23, 59, 59, 999) : null;
  if (s && t < s) return false;
  if (e && t > e) return false;
  return true;
};

export default function DownloadBrochureData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd (from <input type="date"/>)
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const base = import.meta.env.VITE_API_URL;
      const res = await fetch(`${base}/api/v1/brochure`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      // Expecting objects like {_id, name, phone, email, city, courseName, createdAt}
      setRows(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cities = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => r?.city && s.add(r.city));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        // city filter
        if (city !== "all" && r.city !== city) return false;
        // date range filter (use createdAt | fallback updatedAt)
        const dateField = r.createdAt || r.updatedAt;
        if (
          (startDate || endDate) &&
          !withinRange(dateField, startDate, endDate)
        )
          return false;
        // search filter across key fields
        if (!term) return true;
        const hay = [r.name, r.email, r.phone, r.city, r.courseName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => {
        const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return db - da; // newest first
      });
  }, [rows, q, city, startDate, endDate]);

  const downloadCSV = () => {
    const cols = ["Sr No", "Name", "Email", "Phone", "City", "Course", "Date"];
    const lines = [cols.join(",")];
    filtered.forEach((r, i) => {
      const row = [
        i + 1,
        r.name || "",
        r.email || "",
        r.phone || "",
        r.city || "",
        r.courseName || "",
        formatDate(r.createdAt || r.updatedAt || ""),
      ].map((v) => `"${String(v).replaceAll('"', '""')}"`); // CSV escape
      lines.push(row.join(","));
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename("csv");
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildFilename = (ext) => {
    const rangeLabel =
      startDate || endDate ? `_${formatRangeForName(startDate, endDate)}` : "";
    return `brochure_data${rangeLabel}.${ext}`;
  };

  const formatRangeForName = (s, e) => {
    const fmt = (d) => {
      if (!d) return "";
      const [yyyy, mm, dd] = d.split("-");
      return `${dd}-${mm}-${yyyy}`;
    };
    return [fmt(s), fmt(e)].filter(Boolean).join("_to_");
  };

  const openPrintPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const style = `
      <style>
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system; padding: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        .meta { margin-bottom: 16px; color: #475569; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; }
        th { background: #f8fafc; text-align: left; }
        tfoot td { font-weight: 600; }
        @media print { @page { size: A4 landscape; margin: 12mm; } }
      </style>
    `;

    const header = `
      <h1>Download Brochure Data</h1>
      <div class="meta">
        Exported: ${formatDate(new Date().toISOString())}
        ${
          startDate || endDate
            ? ` | Range: ${formatRangeForName(startDate, endDate)}`
            : ""
        }
      </div>
    `;

    const thead = `
      <thead>
        <tr>
          <th>Sr No</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>City</th>
          <th>Course</th>
          <th>Date</th>
        </tr>
      </thead>
    `;

    const tbody = filtered
      .map(
        (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.name || ""}</td>
          <td>${r.email || ""}</td>
          <td>${r.phone || ""}</td>
          <td>${r.city || ""}</td>
          <td>${r.courseName || ""}</td>
          <td>${formatDate(r.createdAt || r.updatedAt || "")}</td>
        </tr>
      `
      )
      .join("");

    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"/>${style}</head><body>${header}<table>${thead}<tbody>${tbody}</tbody></table></body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="w-full px-4 md:px-8 py-6">
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
              Download Brochure Data
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />{" "}
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button size="sm" onClick={downloadCSV}>
                <Download className="mr-2 h-4 w-4" /> Download Excel (CSV)
              </Button>
              <Button size="sm" variant="secondary" onClick={openPrintPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, phone, city, course"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "All Cities" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-auto rounded-md border">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sr No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, idx) => (
                    <TableRow key={r._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell>{r.courseName}</TableCell>
                      <TableCell>
                        {formatDate(r.createdAt || r.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground mt-3">
            Tip: Use the date fields to view a custom range (e.g., 01-09-2025 to
            30-09-2025), then download as CSV (Excel) or PDF. City and search
            filters apply to downloads.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
