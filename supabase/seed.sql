-- Starter catalog from the photo shoot. Prices are real (Nov 2026); stock of 10 per size is a placeholder.
with p as (
  insert into public.products (slug, name, category, description, images) values
  ('all-hail-wildcats-tee-black', 'All Hail Wildcats Tee', 'Tees',
   'Black cotton tee with the gold-and-red "All Hail Wildcats" print and seal.',
   array['/products/all-hail-black-2.webp', '/products/all-hail-black-1.webp', '/products/all-hail-black-3.webp']),
  ('cit-university-tee-white', 'CIT University Tee — White', 'Tees',
   'White cotton tee with the Cebu Institute of Technology University seal, est. 1946.',
   array['/products/university-white-1.webp', '/products/university-white-2.webp']),
  ('cit-university-tee-maroon', 'CIT University Tee — Maroon', 'Tees',
   'Maroon cotton tee with the gold University seal, est. 1946.',
   array['/products/university-maroon-2.webp', '/products/university-maroon-1.webp']),
  ('wildcats-1946-tee-white', 'Wildcats 1946 Tee', 'Tees',
   'White cotton tee with the varsity "Wildcats 1946" print.',
   array['/products/wildcats-1946-white-2.webp', '/products/wildcats-1946-white-1.webp']),
  ('wildcats-corduroy-tote-maroon', 'Wildcats Corduroy Tote', 'Bags',
   'Maroon corduroy tote with embroidered Wildcats script.',
   array['/products/corduroy-tote-1.webp', '/products/corduroy-tote-2.webp']),
  ('wildcats-canvas-tote-cream', 'Wildcats Canvas Tote', 'Bags',
   'Cream canvas tote with embroidered Wildcats script.',
   array['/products/all-hail-black-3.webp'])
  returning id, category
)
insert into public.variants (product_id, size, price, stock, sort)
select p.id, s.size, s.price, 10, s.sort from p
cross join lateral (
  select * from (values ('XS', 1, 320), ('S', 2, 320), ('M', 3, 320), ('L', 4, 320), ('XL', 5, 340), ('2XL', 6, 340)) v(size, sort, price) where p.category = 'Tees'
  union all
  select 'One size', 1, 320 where p.category = 'Bags'
) s;
