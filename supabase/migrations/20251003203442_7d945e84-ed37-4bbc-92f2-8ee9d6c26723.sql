-- Add score breakdown columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN user_clarity INTEGER,
ADD COLUMN user_depth INTEGER,
ADD COLUMN user_creativity INTEGER,
ADD COLUMN gpt_clarity INTEGER,
ADD COLUMN gpt_depth INTEGER,
ADD COLUMN gpt_flow INTEGER,
ADD COLUMN conversation_flow INTEGER,
ADD COLUMN conversation_synergy INTEGER,
ADD COLUMN justification TEXT;