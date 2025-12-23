-- Rename characters to newsletter theme

UPDATE characters SET name = 'Transactional Turtle' WHERE name = 'Turtle';
UPDATE characters SET name = 'Postmaster Pig' WHERE name = 'Pig';
UPDATE characters SET name = 'Letter Lemur' WHERE name = 'Lemur';
UPDATE characters SET name = 'Deliverability Dog' WHERE name = 'Pomeranian';

-- Verify the changes
SELECT name FROM characters ORDER BY name;
