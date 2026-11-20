-- Checks stock handling in place_order, cancel_order and auto_cancel_orders. Run with ./run.sh
\set ON_ERROR_STOP on
do $$
declare
  v uuid; o public.orders; stock0 int; n int; ok boolean;
begin
  select id, stock into v, stock0 from variants where size = 'M' limit 1;

  o := place_order('Ana', 'ana@example.com', '09171234567', true, '', 'cash', '', jsonb_build_array(jsonb_build_object('variant_id', v, 'qty', 2)));
  assert o.total = 2 * (select price from variants where id = v), 'total is the size''s price x qty';
  assert (select stock from variants where id = v) = stock0 - 2, 'placing takes stock';

  ok := false;
  begin
    perform place_order('Ben', 'ben@example.com', '09171234567', false, '', 'cash', '', jsonb_build_array(jsonb_build_object('variant_id', v, 'qty', 999)));
  exception when raise_exception then ok := true;
  end;
  assert ok, 'overselling is refused';
  assert (select stock from variants where id = v) = stock0 - 2, 'a refused order takes no stock';

  perform cancel_order(o.id, 'test');
  assert (select stock from variants where id = v) = stock0, 'cancelling returns stock';
  perform cancel_order(o.id, 'test again');
  assert (select stock from variants where id = v) = stock0, 'cancelling twice returns stock once';

  -- 8-day-old unpaid order is forfeited; 8-day-old paid GCash order and a fresh unpaid order are kept.
  o := place_order('Cy', 'cy@example.com', '09171234567', true, '', 'cash', '', jsonb_build_array(jsonb_build_object('variant_id', v, 'qty', 1)));
  update orders set created_at = now() - interval '8 days' where id = o.id;
  o := place_order('Di', 'di@example.com', '09171234567', true, '', 'gcash', '1234567', jsonb_build_array(jsonb_build_object('variant_id', v, 'qty', 1)));
  update orders set created_at = now() - interval '8 days', paid_at = now() - interval '7 days' where id = o.id;
  o := place_order('Ed', 'ed@example.com', '09171234567', false, '', 'cash', '', jsonb_build_array(jsonb_build_object('variant_id', v, 'qty', 1)));
  n := auto_cancel_orders();
  assert n = 1, 'only the old unpaid order is auto-cancelled';
  assert (select status from orders where name = 'Cy') = 'cancelled', 'Cy cancelled';
  assert (select status from orders where name = 'Di') = 'pending', 'paid GCash order kept';
  assert (select stock from variants where id = v) = stock0 - 2, 'forfeited stock returns';
  raise notice 'All order tests passed';
end $$;

-- Row-level security: a shopper (anon) sees products but no orders.
set role anon;
do $$ begin
  assert (select count(*) from products) > 0, 'anon reads products';
  assert (select count(*) from orders) = 0, 'anon reads no orders';
  raise notice 'RLS tests passed';
end $$;
reset role;
