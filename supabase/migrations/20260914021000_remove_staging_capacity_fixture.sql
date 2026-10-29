-- Remove the isolated k6 staging fixture and all dependent test data.
-- The API key, integration, warehouse, orders, items and sync events cascade.
DELETE FROM sellers
WHERE id = '11111111-1111-4111-8111-111111111111';
