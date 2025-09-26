import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import api from "@/utils/axios";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";

export default function HomeContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // the single document from backend
  const [docId, setDocId] = useState(null);

  // only keep intro + extra content
  const [intro, setIntro] = useState("");
  const [extraContent, setExtraContent] = useState("");

  // fetch on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/certification`);
        if (!mounted) return;

        const data = res?.data || null;
        if (data) {
          setDocId(data._id);
          setIntro(data.intro || "");
          setExtraContent(data.extraContent || "");
        }
      } catch (err) {
        console.error(err);
        window.alert("Failed to load content. Check your API base URL and server.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const payload = useCallback(
    () => ({
      intro,
      extraContent,
    }),
    [intro, extraContent]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      if (docId) {
        const res = await api.put(`/api/certification/${docId}`, payload());
        setDocId(res?.data?._id || docId);
      } else {
        const res = await api.post(`/api/certification`, payload());
        setDocId(res?.data?._id || null);
      }
      window.alert("Saved: Content has been updated.");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Unexpected error";
      window.alert(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-5xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Home Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Home Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Intro */}
          <div className="space-y-2">
            <Label>Intro</Label>
            <RichTextEditor value={intro} onChange={setIntro} height={400} placeholder="Intro…" />
          </div>

          <Separator />

          {/* Extra Content */}
          <div className="space-y-2">
            <Label>Extra Content</Label>
            <RichTextEditor
              value={extraContent}
              onChange={setExtraContent}
              height={400}
              placeholder="Write the detailed content…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 relative top-5">
            <Button onClick={handleSave} disabled={saving} className="min-w-28">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: intro }} />
          <div className="mt-6" dangerouslySetInnerHTML={{ __html: extraContent }} />
        </CardContent>
      </Card>
    </div>
  );
}
