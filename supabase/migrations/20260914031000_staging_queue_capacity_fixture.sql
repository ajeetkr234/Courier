-- Temporary isolated fixture for post-optimization staging capacity validation.
INSERT INTO sellers(id,company_name,brand_name,pan,status) VALUES
('11111111-1111-4111-8111-111111111111','ShipFaster Staging Capacity Test','ShipFaster Load Test','AAAAA9999A','ACTIVE');
INSERT INTO warehouses(id,seller_id,name,contact_name,phone,email,address_line1,city,state,pincode,is_default) VALUES
('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Capacity Test Warehouse','Load Test Operator','9876543210','capacity-test@shipfaster.invalid','Staging Load Test Address','Delhi','Delhi','110001',true);
INSERT INTO integration_accounts(id,seller_id,platform,store_name,store_url,status,auto_sync_orders,sync_tracking,default_warehouse_id) VALUES
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','CUSTOM_API','Capacity Test Store','https://capacity-test.shipfaster.invalid','CONNECTED',true,true,'22222222-2222-4222-8222-222222222222');
INSERT INTO api_keys(id,seller_id,name,key_hash,key_prefix,scopes,is_active) VALUES
('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111','Staging k6 capacity test','98b415a58c9c939e3315765e6aab7cb03f912c1e1c6942c57330686d2b72555f','pk_live_sf_staging',ARRAY['orders:write','orders:read'],true);
