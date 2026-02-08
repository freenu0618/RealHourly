-- RealHourly — RLS Policy Setup
-- Run this AFTER drizzle migration (drizzle-kit push or drizzle-kit migrate)
-- Execute in Supabase SQL Editor or via psql

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_messages ENABLE ROW LEVEL SECURITY;

-- 2. profiles: id = auth.uid()
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (id = auth.uid());

-- 3. clients: user_id = auth.uid()
CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- 4. projects: user_id = auth.uid()
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- 5. time_entries: via project.user_id = auth.uid()
CREATE POLICY "time_entries_select" ON time_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = time_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "time_entries_insert" ON time_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = time_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "time_entries_update" ON time_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = time_entries.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = time_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "time_entries_delete" ON time_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = time_entries.project_id AND projects.user_id = auth.uid())
  );

-- 6. cost_entries: via project.user_id = auth.uid()
CREATE POLICY "cost_entries_select" ON cost_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = cost_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "cost_entries_insert" ON cost_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = cost_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "cost_entries_update" ON cost_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = cost_entries.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = cost_entries.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "cost_entries_delete" ON cost_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = cost_entries.project_id AND projects.user_id = auth.uid())
  );

-- 7. alerts: via project.user_id = auth.uid()
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = alerts.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "alerts_insert" ON alerts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = alerts.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "alerts_update" ON alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = alerts.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = alerts.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "alerts_delete" ON alerts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = alerts.project_id AND projects.user_id = auth.uid())
  );

-- 8. generated_messages: via alert → project.user_id = auth.uid()
CREATE POLICY "generated_messages_select" ON generated_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM alerts
      JOIN projects ON projects.id = alerts.project_id
      WHERE alerts.id = generated_messages.alert_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "generated_messages_insert" ON generated_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM alerts
      JOIN projects ON projects.id = alerts.project_id
      WHERE alerts.id = generated_messages.alert_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "generated_messages_update" ON generated_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM alerts
      JOIN projects ON projects.id = alerts.project_id
      WHERE alerts.id = generated_messages.alert_id AND projects.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM alerts
      JOIN projects ON projects.id = alerts.project_id
      WHERE alerts.id = generated_messages.alert_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "generated_messages_delete" ON generated_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM alerts
      JOIN projects ON projects.id = alerts.project_id
      WHERE alerts.id = generated_messages.alert_id AND projects.user_id = auth.uid()
    )
  );

-- 9. Auto-create profile on user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
