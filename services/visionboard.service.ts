import { supabase } from '@/lib/supabase';

export interface VisionBoardImage {
  id: string;
  user_id: string;
  storage_path: string;
  url: string;
  created_at: string;
  updated_at: string;
}

// Simple functional service - no RPC functions, no complex triggers
export const visionBoardService = {
  // Create a new vision board image
  async createVisionBoardImage(storagePath: string, url: string = ''): Promise<VisionBoardImage> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vision_board_images')
        .insert({
          user_id: user.id,
          storage_path: storagePath,
          url: url
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vision board image:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('visionBoardService.createVisionBoardImage:', error);
      throw error;
    }
  },

  // Get all vision board images for current user
  async getUserVisionBoardImages(): Promise<VisionBoardImage[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vision_board_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vision board images:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('visionBoardService.getUserVisionBoardImages:', error);
      throw error;
    }
  },

  // Generate signed URL for private image access
  async generateSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('vision-board-images')
        .createSignedUrl(storagePath, expiresIn);

      if (error) {
        console.error('Error generating signed URL:', error);
        throw error;
      }

      return data?.signedUrl || '';
    } catch (error) {
      console.error('visionBoardService.generateSignedUrl:', error);
      throw error;
    }
  },

  // Delete vision board image
  async deleteVisionBoardImage(imageId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Get the image to get storage path (RLS will ensure user owns it)
      const { data: image, error: fetchError } = await supabase
        .from('vision_board_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError || !image) {
        throw new Error('Image not found or access denied');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vision-board-images')
        .remove([image.storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database (RLS will ensure user owns it)
      const { error: dbError } = await supabase
        .from('vision_board_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('visionBoardService.deleteVisionBoardImage:', error);
      throw error;
    }
  },

  // Get vision board images with signed URLs
  async getUserVisionBoardImagesWithUrls(): Promise<VisionBoardImage[]> {
    try {
      const images = await this.getUserVisionBoardImages();
      // Generate signed URLs for all images
      const imagesWithUrls = await Promise.all(
        images.map(async (image) => {
          try {
            const signedUrl = await this.generateSignedUrl(image.storage_path);
            return { ...image, url: signedUrl };
          } catch (error) {
            console.error('Error generating signed URL for image:', image.id, error);
            return { ...image, url: '' };
          }
        })
      );
      return imagesWithUrls;
    } catch (error) {
      console.error('visionBoardService.getUserVisionBoardImagesWithUrls:', error);
      throw error;
    }
  },

  // Upload image file and create database record
  async uploadAndCreateImage(imageUri: string): Promise<VisionBoardImage> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Generate unique filename
      const fileExt = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Convert to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('blob', blob);
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('vision-board-images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Generate public URL
      const { data: urlData } = supabase.storage.from('vision-board-images').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl || '';

      // Create database record with the public URL
      const imageRecord = await this.createVisionBoardImage(filePath, publicUrl);

      return imageRecord;
    } catch (error) {
      console.error('visionBoardService.uploadAndCreateImage:', error);
      throw error;
    }
  },

  // Update image (manually handle updated_at since no trigger)
  async updateVisionBoardImage(imageId: string, updates: Partial<VisionBoardImage>): Promise<VisionBoardImage> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vision_board_images')
        .update({
          ...updates,
          updated_at: new Date().toISOString() // Manual updated_at
        })
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating vision board image:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('visionBoardService.updateVisionBoardImage:', error);
      throw error;
    }
  }
};