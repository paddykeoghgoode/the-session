-- Seed Data: Popular Dublin Pubs
-- Run this after all migrations to populate the database with real Dublin pubs

-- Insert popular Dublin pubs
INSERT INTO pubs (name, address, neighborhood, latitude, longitude, phone, website_url, google_maps_url, description, amenities, slug) VALUES
-- Temple Bar Area
('The Temple Bar', '47-48 Temple Bar, Dublin 2', 'Temple Bar', 53.3454, -6.2634, '+353 1 672 5286', 'https://www.thetemplebarpub.com', 'https://maps.google.com/?q=The+Temple+Bar+Dublin', 'One of Dublin''s most famous pubs, known for its traditional music sessions and lively atmosphere', ARRAY['live-music', 'outdoor-seating', 'food-menu', 'historic'], 'the-temple-bar'),
('The Quays Bar', '11-12 Temple Bar, Dublin 2', 'Temple Bar', 53.3452, -6.2641, '+353 1 671 9299', NULL, 'https://maps.google.com/?q=The+Quays+Bar+Dublin', 'Traditional Irish pub with daily live music and sports screenings', ARRAY['live-music', 'sports-tv', 'food-menu'], 'the-quays-bar'),
('Oliver St. John Gogarty', '58-59 Fleet St, Temple Bar, Dublin 2', 'Temple Bar', 53.3450, -6.2628, '+353 1 671 1822', 'https://www.gogartys.ie', 'https://maps.google.com/?q=Oliver+St+John+Gogarty+Dublin', 'Three-floor pub with traditional music, food, and accommodation', ARRAY['live-music', 'food-menu', 'historic', 'accommodation'], 'oliver-st-john-gogarty'),

-- South City Center
('The Long Hall', '51 South Great George''s St, Dublin 2', 'South City Centre', 53.3426, -6.2642, '+353 1 475 1590', NULL, 'https://maps.google.com/?q=The+Long+Hall+Dublin', 'Victorian pub with stunning original features and excellent Guinness', ARRAY['historic', 'dog-friendly', 'wheelchair-accessible'], 'the-long-hall'),
('The Stag''s Head', '1 Dame Ct, Dublin 2', 'South City Centre', 53.3439, -6.2654, '+353 1 679 3701', NULL, 'https://maps.google.com/?q=The+Stags+Head+Dublin', 'Historic Victorian pub with beautiful stained glass and wood paneling', ARRAY['historic', 'food-menu', 'wheelchair-accessible'], 'the-stags-head'),
('Grogan''s Castle Lounge', '15 William St S, Dublin 2', 'South City Centre', 53.3418, -6.2639, '+353 1 677 9320', NULL, 'https://maps.google.com/?q=Grogans+Castle+Lounge+Dublin', 'No-frills pub popular with artists and writers', ARRAY['dog-friendly', 'historic'], 'grogans-castle-lounge'),
('The George', '89 South Great George''s St, Dublin 2', 'South City Centre', 53.3414, -6.2647, '+353 1 478 2983', 'https://www.thegeorge.ie', 'https://maps.google.com/?q=The+George+Dublin', 'Ireland''s oldest and most famous LGBTQ+ bar', ARRAY['lgbtq-friendly', 'dj', 'late-bar'], 'the-george'),

-- Grafton Street Area
('Kehoe''s', '9 South Anne St, Dublin 2', 'Grafton Street', 53.3425, -6.2610, '+353 1 677 8312', NULL, 'https://maps.google.com/?q=Kehoes+Dublin', 'Traditional Victorian pub with snug seating and classic decor', ARRAY['historic', 'food-menu'], 'kehoes'),
('McDaid''s', '3 Harry St, Dublin 2', 'Grafton Street', 53.3422, -6.2604, '+353 1 679 4395', NULL, 'https://maps.google.com/?q=McDaids+Dublin', 'Literary pub frequented by Brendan Behan and Patrick Kavanagh', ARRAY['historic', 'dog-friendly'], 'mcdaids'),
('Bruxelles', '7-8 Harry St, Dublin 2', 'Grafton Street', 53.3422, -6.2608, '+353 1 677 5362', 'https://www.bruxelles.ie', 'https://maps.google.com/?q=Bruxelles+Dublin', 'Rock bar with Phil Lynott statue, live music and late nights', ARRAY['live-music', 'late-bar', 'outdoor-seating'], 'bruxelles'),

-- Trinity/Dame Street
('The Palace Bar', '21 Fleet St, Dublin 2', 'Temple Bar', 53.3454, -6.2606, '+353 1 677 9290', 'https://www.thepalacebar.com', 'https://maps.google.com/?q=The+Palace+Bar+Dublin', 'Traditional Irish pub with Victorian interior and literary heritage', ARRAY['historic', 'food-menu'], 'the-palace-bar'),
('Mulligan''s', '8 Poolbeg St, Dublin 2', 'City Centre', 53.3476, -6.2558, '+353 1 677 5582', NULL, 'https://maps.google.com/?q=Mulligans+Dublin', 'One of Dublin''s oldest pubs, famous for its Guinness', ARRAY['historic', 'dog-friendly'], 'mulligans'),

-- Smithfield/North City
('The Cobblestone', '77 King St N, Smithfield, Dublin 7', 'Smithfield', 53.3479, -6.2790, '+353 1 872 1799', 'https://www.cobblestonepub.ie', 'https://maps.google.com/?q=The+Cobblestone+Dublin', 'Renowned traditional music pub with nightly sessions', ARRAY['live-music', 'historic', 'food-menu'], 'the-cobblestone'),
('The Dice Bar', '79 Queen St, Smithfield, Dublin 7', 'Smithfield', 53.3479, -6.2785, '+353 1 874 7428', NULL, 'https://maps.google.com/?q=The+Dice+Bar+Dublin', 'Eclectic bar with board games, craft beer, and retro decor', ARRAY['board-games', 'craft-beer', 'dog-friendly'], 'the-dice-bar'),

-- Camden Street
('The Bernard Shaw', '11-12 South Richmond St, Dublin 2', 'Camden Street', 53.3340, -6.2680, NULL, 'https://www.thebernardshaw.com', 'https://maps.google.com/?q=The+Bernard+Shaw+Dublin', 'Alternative bar with outdoor area, food trucks, and events', ARRAY['outdoor-seating', 'food-menu', 'dog-friendly', 'dj'], 'the-bernard-shaw'),
('The Bleeding Horse', '24-25 Camden St Upper, Dublin 2', 'Camden Street', 53.3343, -6.2652, '+353 1 475 2705', NULL, 'https://maps.google.com/?q=The+Bleeding+Horse+Dublin', 'Historic pub dating back to 1649 with traditional atmosphere', ARRAY['historic', 'food-menu', 'sports-tv'], 'the-bleeding-horse'),
('Anseo', '18 Camden St Lower, Dublin 2', 'Camden Street', 53.3365, -6.2649, '+353 1 475 1321', NULL, 'https://maps.google.com/?q=Anseo+Dublin', 'Relaxed neighborhood pub with DJ nights and craft beer', ARRAY['dj', 'craft-beer', 'dog-friendly'], 'anseo'),

-- Rathmines
('The Swan Bar', '56 Aungier St, Dublin 2', 'Aungier Street', 53.3386, -6.2661, '+353 1 475 2838', 'https://www.theswanbar.com', 'https://maps.google.com/?q=The+Swan+Bar+Dublin', 'Traditional pub with live music and comedy nights', ARRAY['live-music', 'food-menu', 'wheelchair-accessible'], 'the-swan-bar'),

-- Grand Canal
('The Barge', '42 Charlemont St, Dublin 2', 'Grand Canal', 53.3323, -6.2586, '+353 1 476 1449', NULL, 'https://maps.google.com/?q=The+Barge+Dublin', 'Cozy pub with canal views and quality beer selection', ARRAY['outdoor-seating', 'craft-beer', 'food-menu'], 'the-barge'),
('Slattery''s', '129 Capel St, Dublin 1', 'North City', 53.3479, -6.2670, '+353 1 872 7971', NULL, 'https://maps.google.com/?q=Slatterys+Dublin', 'Traditional music pub with sessions seven nights a week', ARRAY['live-music', 'historic', 'food-menu'], 'slatterys'),

-- Portobello
('The Portobello', '116 South Richmond St, Dublin 2', 'Portobello', 53.3304, -6.2630, '+353 1 475 0308', NULL, 'https://maps.google.com/?q=The+Portobello+Dublin', 'Gastropub with modern Irish food and craft beer', ARRAY['food-menu', 'craft-beer', 'outdoor-seating', 'wheelchair-accessible'], 'the-portobello'),

-- Phibsborough
('The Back Page', '16 Phibsborough Rd, Dublin 7', 'Phibsborough', 53.3575, -6.2730, '+353 1 830 9854', 'https://www.thebackpage.ie', 'https://maps.google.com/?q=The+Back+Page+Dublin', 'Sports bar with multiple screens and food service', ARRAY['sports-tv', 'food-menu', 'wheelchair-accessible'], 'the-back-page'),

-- Ranelagh
('The Bowery', '75 Rathmines Rd Lower, Dublin 6', 'Rathmines', 53.3244, -6.2619, '+353 1 497 4077', NULL, 'https://maps.google.com/?q=The+Bowery+Dublin', 'Stylish gastropub with quality food and cocktails', ARRAY['food-menu', 'cocktails', 'outdoor-seating'], 'the-bowery'),

-- Stoneybatter
('L. Mulligan Grocer', '18 Stoneybatter, Dublin 7', 'Stoneybatter', 53.3507, -6.2827, '+353 1 670 9889', 'https://www.lmulligangrocer.com', 'https://maps.google.com/?q=L+Mulligan+Grocer+Dublin', 'Gastropub with house-brewed beers and quality food', ARRAY['food-menu', 'craft-beer', 'dog-friendly'], 'l-mulligan-grocer'),
('The Glimmerman', '6 Grangegorman Terrace, Stoneybatter, Dublin 7', 'Stoneybatter', 53.3516, -6.2833, '+353 1 670 6244', NULL, 'https://maps.google.com/?q=The+Glimmerman+Dublin', 'Cozy neighborhood pub with friendly atmosphere', ARRAY['dog-friendly', 'outdoor-seating'], 'the-glimmerman'),

-- Ballsbridge
('O''Donoghue''s', '15 Merrion Row, Dublin 2', 'Merrion Row', 53.3389, -6.2541, '+353 1 660 7194', 'https://www.odonoghues.ie', 'https://maps.google.com/?q=ODonoghues+Dublin', 'Famous traditional music pub where The Dubliners started', ARRAY['live-music', 'historic', 'food-menu'], 'odonoghues'),
('Toner''s', '139 Baggot St Lower, Dublin 2', 'Baggot Street', 53.3355, -6.2480, '+353 1 676 3090', 'https://www.tonerspub.ie', 'https://maps.google.com/?q=Toners+Dublin', 'Victorian pub with original features and excellent Guinness', ARRAY['historic', 'food-menu', 'wheelchair-accessible'], 'toners'),

-- Donnybrook
('Searsons', '42-44 Baggot St Upper, Dublin 4', 'Baggot Street', 53.3316, -6.2429, '+353 1 660 0330', 'https://www.searsons.ie', 'https://maps.google.com/?q=Searsons+Dublin', 'Traditional bar with food and sports screening', ARRAY['food-menu', 'sports-tv', 'wheelchair-accessible'], 'searsons'),

-- Ringsend
('The Oarsman', '166 Ringsend Rd, Dublin 4', 'Ringsend', 53.3387, -6.2285, '+353 1 668 3446', NULL, 'https://maps.google.com/?q=The+Oarsman+Dublin', 'Traditional local with community feel', ARRAY['dog-friendly', 'sports-tv'], 'the-oarsman'),

-- Stoneybatter/North
('Frank Ryan''s', '28 Queen St, Smithfield, Dublin 7', 'Smithfield', 53.3476, -6.2801, '+353 1 872 8675', NULL, 'https://maps.google.com/?q=Frank+Ryans+Dublin', 'Traditional pub with regular live music', ARRAY['live-music', 'food-menu'], 'frank-ryans')
ON CONFLICT (slug) DO NOTHING;

-- Insert drink prices for Guinness (most popular pint)
-- Using realistic Dublin prices (€5.50 - €7.50 range, Temple Bar more expensive)
WITH pub_data AS (
  SELECT id, name FROM pubs WHERE name IN (
    'The Temple Bar', 'The Quays Bar', 'Oliver St. John Gogarty',
    'The Long Hall', 'The Stag''s Head', 'Grogan''s Castle Lounge',
    'Kehoe''s', 'McDaid''s', 'Bruxelles', 'The Palace Bar', 'Mulligan''s',
    'The Cobblestone', 'The Bleeding Horse', 'Anseo'
  )
)
INSERT INTO prices (pub_id, drink_id, price, is_verified, submitted_by)
SELECT
  id,
  1, -- Guinness
  CASE
    WHEN name LIKE '%Temple Bar%' OR name LIKE '%Quays%' OR name LIKE '%Gogarty%' THEN 7.50
    WHEN name IN ('The Long Hall', 'The Stag''s Head', 'Mulligan''s') THEN 5.80
    WHEN name IN ('Grogan''s Castle Lounge', 'McDaid''s', 'Kehoe''s') THEN 6.00
    ELSE 6.20
  END,
  false,
  NULL
FROM pub_data
ON CONFLICT DO NOTHING;

-- Add some additional drink prices (Heineken, Carlsberg)
WITH pub_data AS (
  SELECT id, name FROM pubs WHERE name IN (
    'The Temple Bar', 'The Long Hall', 'Bruxelles', 'The Bernard Shaw', 'Anseo'
  )
)
INSERT INTO prices (pub_id, drink_id, price, is_verified, submitted_by)
SELECT
  id,
  2, -- Heineken
  CASE
    WHEN name LIKE '%Temple Bar%' THEN 7.00
    ELSE 6.00
  END,
  false,
  NULL
FROM pub_data
ON CONFLICT DO NOTHING;

COMMIT;
