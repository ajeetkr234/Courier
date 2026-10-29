-- Clear the remaining demo activity from the retained Control Tower tenant.
DELETE FROM public.support_tickets
WHERE seller_id='568c9458-0437-4b55-aedf-a3cc9b55f7d3'::uuid;

DELETE FROM public.audit_logs
WHERE seller_id='568c9458-0437-4b55-aedf-a3cc9b55f7d3'::uuid;
