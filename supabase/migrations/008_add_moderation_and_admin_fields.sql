-- Add is_admin flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Add is_approved flag to reviews table
ALTER TABLE public.reviews
ADD COLUMN is_approved BOOLEAN DEFAULT false;

-- Add is_approved flag to pub_photos table
ALTER TABLE public.pub_photos
ADD COLUMN is_approved BOOLEAN DEFAULT false;

-- Update existing reviews and photos to be approved so they don't disappear
UPDATE public.reviews SET is_approved = true;
UPDATE public.pub_photos SET is_approved = true;
