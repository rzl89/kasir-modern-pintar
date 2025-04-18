
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, STORAGE_URL } from '@/lib/supabase';

interface ProductImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export const ProductImageUpload = ({ imageUrl, onImageChange }: ProductImageUploadProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih gambar terlebih dahulu',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const imageUrl = `${STORAGE_URL}/images/${filePath}`;
      onImageChange(imageUrl);
      toast({
        title: 'Sukses',
        description: 'Gambar berhasil diunggah',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengunggah gambar',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    onImageChange('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">Gambar Produk</Label>
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          id="image"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <Label htmlFor="image" className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-md px-4 py-2">
          Pilih Gambar
        </Label>
        {previewUrl || imageUrl ? (
          <div className="relative">
            <img
              src={previewUrl || imageUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-white/50 text-red-500 shadow-sm"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="h-24 w-24 rounded-md bg-neutral-100 flex items-center justify-center">
            <Plus className="h-6 w-6 text-neutral-500" />
          </div>
        )}
        <Button type="button" onClick={handleImageUpload} disabled={uploading || !image}>
          {uploading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Mengunggah...
            </span>
          ) : (
            'Unggah Gambar'
          )}
        </Button>
      </div>
    </div>
  );
};
