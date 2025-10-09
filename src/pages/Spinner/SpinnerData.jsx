// src/components/SpinnerData.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../../utils/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const variant =
    s === "approved" ? "default" :
    s === "rejected" ? "destructive" :
    s === "pending"  ? "secondary"  : "outline";
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
  const [rowBusy, setRowBusy] = useState({}); // {_id: boolean}

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/applications");
      const json = res.data;
      const rows = Array.isArray(json) ? json : json.data || [];
      const c    = Array.isArray(json) ? rows.length : json.count ?? rows.length;
      setData(rows);
      setCount(c);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Request failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const [qLive, setQLive] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 250);
    return () => clearTimeout(t);
  }, [qLive]);

  const filtered = useMemo(() => {
    if (!q) return data;
    const needle = q.toLowerCase();
    return data.filter((row) =>
      [row.name, row.email, row.contact, row.course_Name, row.status, row.url_Slug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [data, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q]);

  const markDone = async (row) => {
    if (!row?._id) return;
    if (String(row.status).toLowerCase() === "done") return;

    // optimistic update
    setRowBusy((m) => ({ ...m, [row._id]: true }));
    const prev = data;

    try {
      setData((rows) =>
        rows.map((r) => (r._id === row._id ? { ...r, status: "done" } : r))
      );

      await api.patch(`/api/applications/${row._id}/done`);

      // (optional) trust server version & merge back:
      // const { data: resp } = await api.patch(...);
      // const updated = resp?.data;
      // if (updated) setData(rows => rows.map(r => r._id===updated._id ? updated : r));
    } catch (e) {
      // revert optimistic update on failure
      setData(prev);
      console.error(e);
      alert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to mark as done."
      );
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
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              value={qLive}
              onChange={(e) => setQLive(e.target.value)}
              placeholder="Search name, email, course, status…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border">
          <ScrollArea className="max-h-[70vh] rounded-2xl">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="min-w-[220px]">Name</TableHead>
                  <TableHead className="min-w-[220px]">Email</TableHead>
                  <TableHead className="min-w-[140px]">Contact</TableHead>
                  <TableHead className="min-w-[280px]">Course</TableHead>
                  <TableHead className="min-w-[120px]">Discount</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center gap-3 py-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">fetching applications…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : err ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6">
                        <p className="text-sm text-red-600">{`Error: ${err}`}</p>
                        <p className="text-xs text-muted-foreground">
                          check API baseURL ({import.meta.env.VITE_API_URL}) and CORS.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6">
                        <p className="text-sm text-muted-foreground">no results. try a different search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row) => {
                    const s = String(row.status || "").toLowerCase();
                    const isDone = s === "done";
                    const busy = !!rowBusy[row._id];

                    return (
                      <TableRow key={row._id}>
                        <TableCell className="font-medium">{row.name || "—"}</TableCell>
                        <TableCell>
                          <a href={`mailto:${row.email}`} className="underline-offset-4 hover:underline">
                            {row.email || "—"}
                          </a>
                        </TableCell>
                        <TableCell>{row.contact || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="line-clamp-1">{row.course_Name || "—"}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {row.url_Slug ? `/${row.url_Slug}` : "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {typeof row.discountPercent === "number" ? `${row.discountPercent}%` : "—"}
                        </TableCell>
                        <TableCell><StatusBadge status={row.status} /></TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => markDone(row)}
                            disabled={isDone || busy}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isDone ? "Done" : "Done"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
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
