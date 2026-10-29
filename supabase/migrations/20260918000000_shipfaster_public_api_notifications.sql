-- ShipFaster public API support and transactional buyer notifications.
CREATE TABLE IF NOT EXISTS public.seller_notification_settings (
  seller_id uuid PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  sms_enabled boolean NOT NULL DEFAULT false,
  order_created_enabled boolean NOT NULL DEFAULT true,
  shipment_updates_enabled boolean NOT NULL DEFAULT true,
  tracking_base_url text,
  whatsapp_template_name text NOT NULL DEFAULT 'shipment_update',
  whatsapp_language_code text NOT NULL DEFAULT 'en',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_attempts ADD COLUMN IF NOT EXISTS destination text;
ALTER TABLE public.notification_attempts ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.notification_attempts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.seller_notification_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seller_notification_settings_access ON public.seller_notification_settings;
CREATE POLICY seller_notification_settings_access ON public.seller_notification_settings FOR ALL TO authenticated
  USING (seller_id=jwt_seller_id() OR is_platform_admin())
  WITH CHECK (seller_id=jwt_seller_id() OR is_platform_admin());
GRANT SELECT,INSERT,UPDATE ON public.seller_notification_settings TO authenticated;
GRANT ALL ON public.seller_notification_settings TO service_role;
GRANT ALL ON public.notification_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.mask_phone(p_phone text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN length(regexp_replace(COALESCE(p_phone,''),'\D','','g'))>=4
    THEN repeat('*',GREATEST(length(regexp_replace(p_phone,'\D','','g'))-4,0))||right(regexp_replace(p_phone,'\D','','g'),4)
    ELSE '****' END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_shipment_notifications() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_order orders%ROWTYPE; v_settings seller_notification_settings%ROWTYPE;
  v_phone text; v_event text; v_tracking_url text; v_payload jsonb;
BEGIN
  IF TG_OP='UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  SELECT * INTO v_order FROM orders WHERE id=NEW.order_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT * INTO v_settings FROM seller_notification_settings WHERE seller_id=NEW.seller_id;
  IF NOT FOUND OR NOT v_settings.shipment_updates_enabled THEN RETURN NEW; END IF;
  v_phone:=regexp_replace(COALESCE(v_order.shipping_address->>'phone',''),'\D','','g');
  IF length(v_phone)=10 THEN v_phone:='91'||v_phone; END IF;
  IF length(v_phone)<10 THEN RETURN NEW; END IF;
  v_event:='shipment.'||lower(NEW.status::text);
  v_tracking_url:=rtrim(COALESCE(v_settings.tracking_base_url,''),'/')||'/track?awb='||NEW.awb_number;
  v_payload:=jsonb_build_object('event',v_event,'order_id',v_order.id,'external_order_id',v_order.external_order_id,
    'shipment_id',NEW.id,'awb_number',NEW.awb_number,'status',NEW.status,'customer_name',v_order.shipping_address->>'name',
    'tracking_url',v_tracking_url,'whatsapp_template_name',v_settings.whatsapp_template_name,
    'whatsapp_language_code',v_settings.whatsapp_language_code);
  IF v_settings.whatsapp_enabled THEN
    INSERT INTO notification_attempts(seller_id,shipment_id,event_type,channel,destination,destination_masked,payload,idempotency_key)
    VALUES(NEW.seller_id,NEW.id,v_event,'WHATSAPP',v_phone,mask_phone(v_phone),v_payload,
      'shipment:'||NEW.id||':'||NEW.status::text||':WHATSAPP') ON CONFLICT(idempotency_key) DO NOTHING;
  END IF;
  IF v_settings.sms_enabled THEN
    INSERT INTO notification_attempts(seller_id,shipment_id,event_type,channel,destination,destination_masked,payload,idempotency_key)
    VALUES(NEW.seller_id,NEW.id,v_event,'SMS','+'||v_phone,mask_phone(v_phone),v_payload,
      'shipment:'||NEW.id||':'||NEW.status::text||':SMS') ON CONFLICT(idempotency_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS shipments_enqueue_notifications ON public.shipments;
CREATE TRIGGER shipments_enqueue_notifications AFTER INSERT OR UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_shipment_notifications();

CREATE OR REPLACE FUNCTION public.claim_notification_attempts(p_limit int DEFAULT 100)
RETURNS SETOF notification_attempts LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE notification_attempts n SET status='SENDING',attempt_count=attempt_count+1,updated_at=now()
  WHERE n.id IN (
    SELECT id FROM notification_attempts
    WHERE status IN ('QUEUED','FAILED') AND COALESCE(next_retry_at,now())<=now() AND attempt_count<5
    ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT LEAST(GREATEST(p_limit,1),200)
  ) RETURNING n.*;
$$;
REVOKE ALL ON FUNCTION public.claim_notification_attempts(int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_notification_attempts(int) TO service_role;

CREATE INDEX IF NOT EXISTS notification_attempts_claim_idx
  ON notification_attempts(COALESCE(next_retry_at,created_at),created_at)
  WHERE status IN ('QUEUED','FAILED');
