import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InspectionPhoto {
  id: string;
  inspection_id: string;
  checklist_item_id: string | null;
  photo_url: string;
  caption: string | null;
  category: string | null;
  tag: string | null;
  created_at: string | null;
}

interface UseInspectionPhotosReturn {
  photos: InspectionPhoto[];
  isLoading: boolean;
  isUploading: boolean;
  uploadPhotos: (files: File[], category: string, caption: string) => Promise<void>;
  deletePhoto: (photoId: string, photoUrl: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInspectionPhotos(inspectionId: string | null): UseInspectionPhotosReturn {
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!inspectionId) {
      setPhotos([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inspection_photos')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhotos = async (files: File[], category: string, caption: string) => {
    if (!inspectionId) {
      toast.error('No inspection selected');
      return;
    }

    setIsUploading(true);
    const uploadedPhotos: Omit<InspectionPhoto, 'id' | 'created_at'>[] = [];

    try {
      for (const file of files) {
        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${inspectionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('inspection-photos')
          .getPublicUrl(fileName);

        uploadedPhotos.push({
          inspection_id: inspectionId,
          checklist_item_id: null,
          photo_url: urlData.publicUrl,
          caption: caption || null,
          category: category || null,
          tag: null
        });
      }

      // Insert records into inspection_photos table
      const { error: insertError } = await supabase
        .from('inspection_photos')
        .insert(uploadedPhotos);

      if (insertError) throw insertError;

      toast.success(`${files.length} photo(s) uploaded successfully`);
      await fetchPhotos();
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      toast.error(`Failed to upload photos: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/inspection-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('inspection-photos')
          .remove([filePath]);

        if (storageError) {
          console.warn('Storage deletion warning:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('inspection_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      toast.success('Photo deleted');
      await fetchPhotos();
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  return {
    photos,
    isLoading,
    isUploading,
    uploadPhotos,
    deletePhoto,
    refetch: fetchPhotos
  };
}
