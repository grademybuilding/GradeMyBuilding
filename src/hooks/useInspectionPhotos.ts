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
  signedUrl?: string; // Signed URL for display
}

interface UseInspectionPhotosReturn {
  photos: InspectionPhoto[];
  isLoading: boolean;
  isUploading: boolean;
  uploadPhotos: (
    files: File[],
    inspectionId: string,
    caption: string,
    category?: string
  ) => Promise<void>;
  deletePhoto: (photoId: string, photoUrl: string) => Promise<void>;
  deleteAllPhotos: (inspectionId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// Generate signed URLs for photos (1 hour expiry)
async function generateSignedUrls(photos: InspectionPhoto[]): Promise<InspectionPhoto[]> {
  if (photos.length === 0) return photos;

  const photosWithSignedUrls = await Promise.all(
    photos.map(async (photo) => {
      try {
        // Extract file path from stored URL or use stored path directly
        let filePath = photo.photo_url;
        
        // If it's a full URL, extract the path
        if (photo.photo_url.includes('/inspection-photos/')) {
          const parts = photo.photo_url.split('/inspection-photos/');
          filePath = parts[parts.length - 1];
        }

        const { data, error } = await supabase.storage
          .from('inspection-photos')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
          return photo;
        }

        return { ...photo, signedUrl: data.signedUrl };
      } catch (error) {
        return photo;
      }
    })
  );

  return photosWithSignedUrls;
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
      
      // Generate signed URLs for all photos
      const photosWithUrls = await generateSignedUrls(data || []);
      setPhotos(photosWithUrls);
    } catch (error: any) {
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhotos = async (
    files: File[],
    inspectionIdParam: string,
    caption: string,
    category: string = 'General'
  ) => {
    const targetInspectionId = inspectionIdParam || inspectionId;

    if (!targetInspectionId) {
      toast.error('No inspection selected');
      return;
    }

    setIsUploading(true);
    const uploadedPhotos: Omit<InspectionPhoto, 'id' | 'created_at' | 'signedUrl'>[] = [];

    try {
      for (const file of files) {
        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${targetInspectionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Store the file path (not full URL) for private bucket access
        uploadedPhotos.push({
          inspection_id: targetInspectionId,
          checklist_item_id: null,
          photo_url: fileName, // Store just the path, not full URL
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
      toast.error(`Failed to upload photos: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      // Extract file path from URL or use directly if it's just a path
      let filePath = photoUrl;
      if (photoUrl.includes('/inspection-photos/')) {
        const urlParts = photoUrl.split('/inspection-photos/');
        filePath = urlParts[urlParts.length - 1];
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('inspection-photos')
        .remove([filePath]);

      if (storageError) {
        // Storage deletion warning, continue anyway
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
      toast.error('Failed to delete photo');
    }
  };

  const deleteAllPhotos = async (targetInspectionId: string) => {
    try {
      // First fetch all photos for this inspection
      const { data: photosToDelete, error: fetchError } = await supabase
        .from('inspection_photos')
        .select('id, photo_url')
        .eq('inspection_id', targetInspectionId);

      if (fetchError) throw fetchError;

      if (!photosToDelete || photosToDelete.length === 0) {
        toast.info('No photos to delete');
        return;
      }

      // Extract file paths for storage deletion
      const filePaths = photosToDelete.map(photo => {
        let filePath = photo.photo_url;
        if (photo.photo_url.includes('/inspection-photos/')) {
          const urlParts = photo.photo_url.split('/inspection-photos/');
          filePath = urlParts[urlParts.length - 1];
        }
        return filePath;
      });

      // Delete from storage (batch delete)
      const { error: storageError } = await supabase.storage
        .from('inspection-photos')
        .remove(filePaths);

      if (storageError) {
        // Storage deletion warning, continue anyway
      }

      // Delete all records from database
      const { error: dbError } = await supabase
        .from('inspection_photos')
        .delete()
        .eq('inspection_id', targetInspectionId);

      if (dbError) throw dbError;

      toast.success(`${photosToDelete.length} photo(s) deleted`);
      await fetchPhotos();
    } catch (error: any) {
      toast.error('Failed to delete photos');
    }
  };

  return {
    photos,
    isLoading,
    isUploading,
    uploadPhotos,
    deletePhoto,
    deleteAllPhotos,
    refetch: fetchPhotos
  };
}

// Export helper function for other components that need to generate signed URLs
export async function getSignedPhotoUrl(photoUrl: string): Promise<string | null> {
  try {
    let filePath = photoUrl;
    if (photoUrl.includes('/inspection-photos/')) {
      const parts = photoUrl.split('/inspection-photos/');
      filePath = parts[parts.length - 1];
    }

    const { data, error } = await supabase.storage
      .from('inspection-photos')
      .createSignedUrl(filePath, 3600);

    if (error) {
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    return null;
  }
}
