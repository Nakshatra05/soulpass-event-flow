-- Add social profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN linkedin_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN github_url TEXT;