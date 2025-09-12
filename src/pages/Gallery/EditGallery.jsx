// src/pages/EditGallery.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/axios';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// icons
import { Loader2, Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';

const cx = (...cls) => cls.filter(Boolean).join(' ');

const EditGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [currentImages, setCurrentImages] = useState([]); // paths/urls from DB

  const [newFiles, setNewFiles] = useState([]); // File[]
  const fileInputRef = useRef(null);

  // precompute preview URLs for selected files
  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);

  useEffect(() => {
    let mounted = true;

    async function fetchGallery() {
      setError('');
      setSuccess('');
      setLoading(true);
      try {
        const { data } = await api.get(`/api/v1/gallery/${id}`);
        if (!mounted) return;

        setCategoryName(data.category_Name || '');
        setCategoryDescription(data.category_Description || '');
        setCurrentImages(Array.isArray(data.pictures) ? data.pictures : []);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || 'Failed to load gallery. Check the ID or your API URL.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchGallery();
    return () => {
      mounted = false;
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    setNewFiles(files);
    setSuccess('');
    setError('');
  }

  function clearSelectedFiles() {
    setNewFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('category_Name', categoryName);
      formData.append('category_Description', categoryDescription);

      if (newFiles.length > 0) {
        newFiles.forEach((f) => formData.append('galleryImages', f));
      }

      const { data } = await api.put(`/api/v1/gallery/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCategoryName(data.category_Name || '');
      setCategoryDescription(data.category_Description || '');
      setCurrentImages(Array.isArray(data.pictures) ? data.pictures : []);

      if (newFiles.length > 0) clearSelectedFiles();

      setSuccess('Gallery updated successfully');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Update failed. Make sure you’re logged in and authorized.');
    } finally {
      setSaving(false);
    }
  }

  // ---- UI helpers ----
  const ImageGrid = ({ items = [], captionPrefix = '' }) => {
    if (!items.length) {
      return <p className="text-sm text-muted-foreground">No images yet.</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((src, i) => (
          <figure key={`${captionPrefix}-${i}`} className="rounded-xl border bg-card p-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
              <img
                src={
                  typeof src === 'string' && src.startsWith('http')
                    ? src
                    : `${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/${String(src).replace(/^\/?/, '')}`
                }
                alt={`${captionPrefix} ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-1 text-[11px] text-muted-foreground truncate">{String(src)}</figcaption>
          </figure>
        ))}
      </div>
    );
  };

  const PreviewGrid = ({ urls = [] }) => {
    if (!urls.length) return null;
    return (
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((src, i) => (
          <div key={`preview-${i}`} className="rounded-xl border bg-card p-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`New file ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-muted">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Edit Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">ID: {id}</p>
          </div>
          <Badge variant="secondary" className="rounded-full">
            Gallery
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-300 text-green-800">
          <AlertTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Success
          </AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Gallery details</CardTitle>
          <CardDescription>Update metadata and replace images in one pass.</CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-8 pt-6">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Summer Collection"
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="categoryDescription">Category Description</Label>
            <Textarea
              id="categoryDescription"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Write a short description…"
              className="min-h-[110px] resize-y"
            />
            <p className="text-[11px] text-muted-foreground">
              Keep it crisp. This shows up wherever the category is listed.
            </p>
          </div>

          {/* Current Images */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Current Images</Label>
              <Badge variant="outline">{currentImages?.length || 0}</Badge>
            </div>
            <ScrollArea className={cx(currentImages?.length ? 'h-auto' : 'h-10')}>
              <ImageGrid items={currentImages} captionPrefix="Image" />
            </ScrollArea>
            <p className="text-[11px] text-muted-foreground">
              If you upload new images below, backend will wipe old files and replace with the new set (your PUT logic
              already handles this).
            </p>
          </div>

          {/* Upload New Images */}
          <div className="grid gap-3">
            <Label htmlFor="file">Upload New Images (optional)</Label>
            <div
              className={cx(
                'rounded-xl border border-dashed p-6',
                'bg-muted/30 hover:bg-muted/50 transition-colors'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border grid place-items-center">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — multiple files allowed</p>
                </div>

                <div className="relative">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Choose files"
                  />
                  <Button variant="secondary" type="button" className="pointer-events-none">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose
                  </Button>
                </div>
              </div>

              {/* Previews */}
              <PreviewGrid urls={previews} />

              {newFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {newFiles.length} file{newFiles.length > 1 ? 's' : ''} selected
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearSelectedFiles} className="h-8 px-3">
                    <X className="mr-1 h-4 w-4" /> Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-wrap gap-3 justify-between">
          <div className="text-[11px] text-muted-foreground">
            Field name must be <code className="px-1 rounded bg-muted">galleryImages</code> to match{' '}
            <code className="px-1 rounded bg-muted">req.files?.galleryImages</code>.
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditGallery;
