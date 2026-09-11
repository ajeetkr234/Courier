-- Multi-Courier Platform Seed Data
-- Run this in your Supabase SQL Editor to populate sample Couriers, Rate Cards, and Slabs.

-- 1. Insert Standard Couriers
INSERT INTO couriers (id, code, name, logo_url, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'delhivery', 'Delhivery Direct Air & Surface', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop', true),
  ('a0000000-0000-0000-0000-000000000002', 'xpressbees', 'Xpressbees Express Logistics', 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=100&h=100&fit=crop', true),
  ('a0000000-0000-0000-0000-000000000003', 'ecom', 'Ecom Express Pan-India', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&h=100&fit=crop', true),
  ('a0000000-0000-0000-0000-000000000004', 'bluedart', 'Blue Dart Priority Apex', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=100&h=100&fit=crop', true),
  ('a0000000-0000-0000-0000-000000000005', 'shadowfax', 'Shadowfax Hyperlocal & Surface', 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=100&h=100&fit=crop', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Default Rate Card
INSERT INTO rate_cards (id, name, is_default) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Standard Commercial Rate Card 2026', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Rate Slabs (Delhivery)
INSERT INTO rate_slabs (rate_card_id, courier_id, zone, base_weight_kg, base_freight_rate, additional_weight_step_kg, additional_freight_rate, cod_flat_fee, cod_percent_fee, rto_multiplier) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'A', 0.5, 38.00, 0.5, 32.00, 40.00, 1.8, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'B', 0.5, 46.00, 0.5, 40.00, 40.00, 1.8, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'C', 0.5, 58.00, 0.5, 48.00, 40.00, 1.8, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'D', 0.5, 68.00, 0.5, 56.00, 45.00, 2.0, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'E', 0.5, 88.00, 0.5, 75.00, 50.00, 2.2, 1.2)
ON CONFLICT DO NOTHING;

-- 4. Insert Rate Slabs (Blue Dart)
INSERT INTO rate_slabs (rate_card_id, courier_id, zone, base_weight_kg, base_freight_rate, additional_weight_step_kg, additional_freight_rate, cod_flat_fee, cod_percent_fee, rto_multiplier) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'A', 0.5, 48.00, 0.5, 42.00, 45.00, 1.9, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'B', 0.5, 58.00, 0.5, 50.00, 45.00, 1.9, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'C', 0.5, 72.00, 0.5, 62.00, 45.00, 1.9, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'D', 0.5, 84.00, 0.5, 74.00, 50.00, 2.0, 1.0),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'E', 0.5, 110.00, 0.5, 95.00, 55.00, 2.5, 1.3)
ON CONFLICT DO NOTHING;
