-- The Session - Seed Data
-- Popular Dublin Pubs

INSERT INTO pubs (name, address, eircode, latitude, longitude, has_food, has_outdoor_seating, shows_sports, has_live_music) VALUES
  ('The Stag''s Head', '1 Dame Ct, Dublin 2', 'D02 WK30', 53.3437, -6.2631, true, false, false, false),
  ('Mulligan''s', '8 Poolbeg St, Dublin 2', 'D02 KX70', 53.3468, -6.2545, false, false, false, false),
  ('The Long Hall', '51 South Great George''s St, Dublin 2', 'D02 A272', 53.3426, -6.2646, false, false, false, false),
  ('Grogan''s Castle Lounge', '15 South William St, Dublin 2', 'D02 N281', 53.3421, -6.2636, false, false, false, false),
  ('Kehoe''s', '9 South Anne St, Dublin 2', 'D02 Y066', 53.3417, -6.2592, false, false, false, false),
  ('The Cobblestone', '77 King St N, Smithfield, Dublin 7', 'D07 P6WY', 53.3487, -6.2784, false, false, false, true),
  ('Toner''s', '139 Baggot Street Lower, Dublin 2', 'D02 XW03', 53.3372, -6.2469, false, true, false, false),
  ('O''Donoghue''s', '15 Merrion Row, Dublin 2', 'D02 V011', 53.3389, -6.2524, false, true, false, true),
  ('The Brazen Head', '20 Bridge St Lower, Dublin 8', 'D08 WC64', 53.3449, -6.2774, true, true, false, true),
  ('Whelan''s', '25 Wexford St, Dublin 2', 'D02 H527', 53.3369, -6.2658, true, false, false, true),
  ('The Palace Bar', '21 Fleet St, Temple Bar, Dublin 2', 'D02 KV62', 53.3454, -6.2605, false, false, false, false),
  ('Cassidy''s', '42 Westmoreland St, Dublin 2', 'D02 E449', 53.3469, -6.2590, true, false, true, false),
  ('Dicey''s Garden', '21-25 Harcourt St, Dublin 2', 'D02 YH91', 53.3345, -6.2617, true, true, true, false),
  ('Copper Face Jacks', '29-30 Harcourt St, Dublin 2', 'D02 F634', 53.3341, -6.2619, false, false, false, false),
  ('McGrattan''s', '5 Baggot Street Lower, Dublin 2', 'D02 P590', 53.3395, -6.2509, true, true, true, false);

-- Sample prices (you'd want real crowdsourced data here)
-- These are example prices to demonstrate the system

-- Get pub IDs for inserting prices
DO $$
DECLARE
  stags_head_id UUID;
  mulligans_id UUID;
  long_hall_id UUID;
  grogans_id UUID;
  kehoes_id UUID;
  cobblestone_id UUID;
  toners_id UUID;
  odonoghues_id UUID;
  brazen_head_id UUID;
  whelans_id UUID;
BEGIN
  SELECT id INTO stags_head_id FROM pubs WHERE name = 'The Stag''s Head';
  SELECT id INTO mulligans_id FROM pubs WHERE name = 'Mulligan''s';
  SELECT id INTO long_hall_id FROM pubs WHERE name = 'The Long Hall';
  SELECT id INTO grogans_id FROM pubs WHERE name = 'Grogan''s Castle Lounge';
  SELECT id INTO kehoes_id FROM pubs WHERE name = 'Kehoe''s';
  SELECT id INTO cobblestone_id FROM pubs WHERE name = 'The Cobblestone';
  SELECT id INTO toners_id FROM pubs WHERE name = 'Toner''s';
  SELECT id INTO odonoghues_id FROM pubs WHERE name = 'O''Donoghue''s';
  SELECT id INTO brazen_head_id FROM pubs WHERE name = 'The Brazen Head';
  SELECT id INTO whelans_id FROM pubs WHERE name = 'Whelan''s';

  -- Insert sample Guinness prices (drink_id = 1)
  INSERT INTO prices (pub_id, drink_id, price, is_deal, deal_description, verified) VALUES
    (stags_head_id, 1, 6.50, false, NULL, true),
    (mulligans_id, 1, 6.20, false, NULL, true),
    (long_hall_id, 1, 6.80, false, NULL, true),
    (grogans_id, 1, 6.40, false, NULL, true),
    (kehoes_id, 1, 6.60, false, NULL, true),
    (cobblestone_id, 1, 5.80, false, NULL, true),
    (toners_id, 1, 6.70, false, NULL, true),
    (odonoghues_id, 1, 7.00, false, NULL, true),
    (brazen_head_id, 1, 6.90, false, NULL, true),
    (whelans_id, 1, 6.30, false, NULL, true);

  -- Insert sample Heineken prices (drink_id = 2)
  INSERT INTO prices (pub_id, drink_id, price, is_deal, deal_description, verified) VALUES
    (stags_head_id, 2, 6.80, false, NULL, true),
    (mulligans_id, 2, 6.50, false, NULL, true),
    (cobblestone_id, 2, 6.00, false, NULL, true),
    (toners_id, 2, 7.00, false, NULL, true);

  -- Insert sample Coors Light prices (drink_id = 3)
  INSERT INTO prices (pub_id, drink_id, price, is_deal, deal_description, verified) VALUES
    (stags_head_id, 3, 6.20, false, NULL, true),
    (kehoes_id, 3, 6.00, false, NULL, true),
    (brazen_head_id, 3, 6.50, false, NULL, true);

  -- Insert sample Bulmers prices (drink_id = 5)
  INSERT INTO prices (pub_id, drink_id, price, is_deal, deal_description, verified) VALUES
    (stags_head_id, 5, 6.00, false, NULL, true),
    (grogans_id, 5, 5.80, false, NULL, true),
    (odonoghues_id, 5, 6.20, false, NULL, true);

  -- Insert a deal example
  INSERT INTO prices (pub_id, drink_id, price, is_deal, deal_description, verified) VALUES
    (whelans_id, 1, 5.00, true, 'Happy Hour 5-7pm weekdays', true);

END $$;
