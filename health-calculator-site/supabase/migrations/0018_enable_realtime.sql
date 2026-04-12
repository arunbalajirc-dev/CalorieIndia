-- Enable Realtime for user_plans so frontend can subscribe to status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_plans;
