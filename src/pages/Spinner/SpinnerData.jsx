// src/components/SpinnerData.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../../utils/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const variant =
    s === "approved"
      ? "default"
      : s === "rejected"
      ? "destructive"
      : s === "pending"
      ? "secondary"
      : s === "done"
      ? "default"
      : "outline";
  return <Badge variant={variant}>{status || "—"}</Badge>;
};

const PAGE_SIZE = 10;

const SpinnerData = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [rowBusy, setRowBusy] = useState({});
  const [cityFilter, setCityFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [qLive, setQLive] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/applications");
      const json = res.data;
      const rows = Array.isArray(json) ? json : json.data || [];
      const c = Array.isArray(json) ? rows.length : json.count ?? rows.length;
      setData(rows);
      setCount(c);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 300);
    return () => clearTimeout(t);
  }, [qLive]);

  const uniqueCities = useMemo(
    () => Array.from(new Set(data.map((r) => r.city).filter(Boolean))),
    [data]
  );
  const uniqueBranches = useMemo(
    () => Array.from(new Set(data.map((r) => r.branch).filter(Boolean))),
    [data]
  );

  const filtered = useMemo(() => {
    let rows = data;

    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((row) =>
        [row.name, row.email, row.contact, row.course_Name, row.status, row.url_Slug]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      );
    }

    if (cityFilter !== "all") {
      rows = rows.filter(
        (r) => String(r.city).toLowerCase() === cityFilter.toLowerCase()
      );
    }

    if (branchFilter !== "all") {
      rows = rows.filter(
        (r) => String(r.branch).toLowerCase() === branchFilter.toLowerCase()
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      rows = rows.filter((r) => {
        const d = new Date(r.createdAt);
        if (isNaN(d)) return false;
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today") return diff < 1;
        if (dateFilter === "week") return diff < 7;
        if (dateFilter === "month") return diff < 30;
        return true;
      });
    }

    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data, q, cityFilter, branchFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => setPage(1), [q, cityFilter, branchFilter, dateFilter]);

  const markDone = async (row) => {
    if (!row?._id) return;
    if (String(row.status).toLowerCase() === "done") return;

    setRowBusy((m) => ({ ...m, [row._id]: true }));
    const prev = data;
    try {
      setData((rows) =>
        rows.map((r) => (r._id === row._id ? { ...r, status: "done" } : r))
      );
      await api.patch(`/api/applications/${row._id}/done`);
    } catch (e) {
      setData(prev);
      alert(e?.response?.data?.message || e?.response?.data?.error || "Failed to mark as done.");
    } finally {
      setRowBusy((m) => ({ ...m, [row._id]: false }));
    }
  };

  return (
    <Card className="w-full border-none shadow-sm">
      <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl">Applications</CardTitle>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}${q ? " (filtered)" : ""} · total: ${count}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              value={qLive}
              onChange={(e) => setQLive(e.target.value)}
              placeholder="Search name, email, course, status…"
              className="pl-9"
            />
          </div>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Branch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {uniqueBranches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* ✅ Horizontal scroll container */}
        <div className="w-full overflow-x-auto border rounded-2xl">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="flex items-center gap-3 py-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">fetching applications…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : err ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <p className="text-red-500 py-6 text-sm">Error: {err}</p>
                    </TableCell>
                  </TableRow>
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <p className="py-6 text-muted-foreground text-sm">No results found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row, i) => {
                    const busy = !!rowBusy[row._id];
                    const isDone = String(row.status).toLowerCase() === "done";
                    return (
                      <TableRow key={row._id}>
                        <TableCell>{pageStart + i + 1}</TableCell>
                        <TableCell className="font-medium">{row.name || "—"}</TableCell>
                        <TableCell>
                          <a href={`mailto:${row.email}`} className="hover:underline underline-offset-4">
                            {row.email || "—"}
                          </a>
                        </TableCell>
                        <TableCell>{row.contact || "—"}</TableCell>
                        <TableCell>{row.city || "—"}</TableCell>
                        <TableCell>{row.branch || "—"}</TableCell>
                        <TableCell className="max-w-[250px] truncate">{row.course_Name || "—"}</TableCell>
                        <TableCell>{row.discountPercent ? `${row.discountPercent}%` : "—"}</TableCell>
                        <TableCell><StatusBadge status={row.status} /></TableCell>
                        <TableCell>{fmtDate(row.createdAt)}</TableCell>
                        <TableCell>
                          <Button size="sm" className="gap-2" onClick={() => markDone(row)} disabled={busy || isDone}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Done
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            page {currentPage} of {totalPages} · showing {pageRows.length} / {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinnerData;
