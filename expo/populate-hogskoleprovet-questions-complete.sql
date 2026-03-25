-- Complete Population of Högskoleprovet Questions
-- Run this AFTER create-hogskoleprovet-system.sql

-- First, verify that sections exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hp_sections LIMIT 1) THEN
    RAISE EXCEPTION 'No sections found! Run create-hogskoleprovet-system.sql first.';
  END IF;
END $$;

-- Insert test instances if they don't exist
INSERT INTO hp_tests (test_date, test_season, test_year, is_published)
VALUES
  ('2024-10-15', 'fall', 2024, true),
  ('2024-04-15', 'spring', 2024, true),
  ('2023-10-15', 'fall', 2023, true)
ON CONFLICT DO NOTHING;

-- Clear existing questions (optional, for clean re-population)
-- TRUNCATE TABLE hp_questions CASCADE;

-- Variables for test and section IDs
DO $$
DECLARE
  v_test_2024_fall UUID;
  v_section_ord UUID;
  v_section_las UUID;
  v_section_mek UUID;
  v_section_nog UUID;
  v_section_elf UUID;
  v_section_kva UUID;
  v_section_xyz UUID;
  v_section_dtk UUID;
BEGIN
  -- Get IDs
  SELECT id INTO v_test_2024_fall FROM hp_tests WHERE test_date = '2024-10-15' LIMIT 1;
  SELECT id INTO v_section_ord FROM hp_sections WHERE section_code = 'ORD' LIMIT 1;
  SELECT id INTO v_section_las FROM hp_sections WHERE section_code = 'LÄS' LIMIT 1;
  SELECT id INTO v_section_mek FROM hp_sections WHERE section_code = 'MEK' LIMIT 1;
  SELECT id INTO v_section_nog FROM hp_sections WHERE section_code = 'NOG' LIMIT 1;
  SELECT id INTO v_section_elf FROM hp_sections WHERE section_code = 'ELF' LIMIT 1;
  SELECT id INTO v_section_kva FROM hp_sections WHERE section_code = 'KVA' LIMIT 1;
  SELECT id INTO v_section_xyz FROM hp_sections WHERE section_code = 'XYZ' LIMIT 1;
  SELECT id INTO v_section_dtk FROM hp_sections WHERE section_code = 'DTK' LIMIT 1;

  -- Verify IDs
  IF v_test_2024_fall IS NULL THEN
    RAISE EXCEPTION 'Test not found for 2024-10-15';
  END IF;
  
  IF v_section_ord IS NULL THEN
    RAISE EXCEPTION 'Section ORD not found';
  END IF;

  RAISE NOTICE 'Found test: %', v_test_2024_fall;
  RAISE NOTICE 'Found section ORD: %', v_section_ord;
  
  -- ===========================
  -- ORD - Ordförståelse
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds)
  VALUES
    (v_test_2024_fall, v_section_ord, 1, 'Vilket ord har närmast samma betydelse som BENÄGEN?', 'multiple_choice', 
     '["A) Välvillig", "B) Beredd", "C) Böjd", "D) Villig"]', 'D', 
     'BENÄGEN betyder att vara mottaglig för något eller ha en tendens att göra något. Villig är närmast i betydelse.', 
     'medium', 1, 60),
    
    (v_test_2024_fall, v_section_ord, 2, 'Vilket ord har närmast samma betydelse som ADEKVAT?', 'multiple_choice', 
     '["A) Tillfredsställande", "B) Lämplig", "C) Passande", "D) Tillräcklig"]', 'C', 
     'ADEKVAT betyder passande eller lämplig för ett visst ändamål.', 
     'medium', 1, 60),
    
    (v_test_2024_fall, v_section_ord, 3, 'Vilket ord har närmast samma betydelse som REDUNDANT?', 'multiple_choice', 
     '["A) Överflödig", "B) Upprepande", "C) Riklig", "D) Dubblerad"]', 'A', 
     'REDUNDANT betyder överflödig eller onödig.', 
     'hard', 1, 75),
    
    (v_test_2024_fall, v_section_ord, 4, 'Vilket ord har närmast samma betydelse som PREKÄR?', 'multiple_choice', 
     '["A) Osäker", "B) Kritisk", "C) Svår", "D) Riskabel"]', 'A', 
     'PREKÄR betyder osäker eller vansklig.', 
     'hard', 1, 75),
    
    (v_test_2024_fall, v_section_ord, 5, 'Vilket ord har närmast samma betydelse som ELOQUENT?', 'multiple_choice', 
     '["A) Vältalig", "B) Tydlig", "C) Uttrycksfull", "D) Språkkunnig"]', 'A', 
     'ELOQUENT betyder vältalig eller språkkunnig.', 
     'medium', 1, 60),
    
    (v_test_2024_fall, v_section_ord, 6, 'Vilket ord har närmast motsatt betydelse som HÄMMA?', 'multiple_choice', 
     '["A) Bromsa", "B) Främja", "C) Hindra", "D) Stoppa"]', 'B', 
     'HÄMMA betyder att hindra eller bromsa, så motsatsen är främja.', 
     'easy', 1, 45),
    
    (v_test_2024_fall, v_section_ord, 7, 'Vilket ord har närmast samma betydelse som KONVENTION?', 'multiple_choice', 
     '["A) Regel", "B) Sedvänja", "C) Tradition", "D) Överenskommelse"]', 'D', 
     'KONVENTION betyder överenskommelse eller sedvänja.', 
     'medium', 1, 60),
    
    (v_test_2024_fall, v_section_ord, 8, 'Vilket ord har närmast samma betydelse som SUBTIL?', 'multiple_choice', 
     '["A) Förfinad", "B) Diskret", "C) Svårupptäckt", "D) Fin"]', 'A', 
     'SUBTIL betyder förfinad eller svårupptäckt.', 
     'hard', 1, 75),
    
    (v_test_2024_fall, v_section_ord, 9, 'Vilket ord har närmast samma betydelse som PRAGMATISK?', 'multiple_choice', 
     '["A) Praktisk", "B) Realistisk", "C) Handlingsinriktad", "D) Nyttig"]', 'A', 
     'PRAGMATISK betyder praktisk och handlingsinriktad.', 
     'medium', 1, 60),
    
    (v_test_2024_fall, v_section_ord, 10, 'Vilket ord har närmast motsatt betydelse som EXPLICIT?', 'multiple_choice', 
     '["A) Tydlig", "B) Implicit", "C) Klar", "D) Direkt"]', 'B', 
     'EXPLICIT betyder tydlig och direkt, så motsatsen är implicit (outtalad).', 
     'medium', 1, 60);

  -- ===========================
  -- MEK - Meningskomplettering
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds)
  VALUES
    (v_test_2024_fall, v_section_mek, 1, 'Även om forskningen har gjort stora framsteg, finns det fortfarande mycket som är _____ för vetenskapen.', 'multiple_choice', 
     '["A) obekant", "B) dolt", "C) oklart", "D) okänt"]', 'D', 
     'Okänt passar bäst i sammanhanget om något som vetenskapen inte känner till ännu.', 
     'easy', 1, 90),
    
    (v_test_2024_fall, v_section_mek, 2, 'Hans argument var så _____ att ingen kunde ifrågasätta hans slutsats.', 'multiple_choice', 
     '["A) övertygande", "B) logiska", "C) starka", "D) omfattande"]', 'A', 
     'Övertygande passar bäst när något är så kraftfullt att det inte kan ifrågasättas.', 
     'medium', 1, 90),
    
    (v_test_2024_fall, v_section_mek, 3, 'Trots att projektet var _____, lyckades teamet slutföra det i tid.', 'multiple_choice', 
     '["A) svårt", "B) komplicerat", "C) omfattande", "D) krävande"]', 'D', 
     'Krävande beskriver bäst något som kräver mycket arbete men som ändå kan slutföras.', 
     'medium', 1, 90),
    
    (v_test_2024_fall, v_section_mek, 4, 'Hennes _____ att lära sig nya språk är imponerande; hon talar redan fem flytande.', 'multiple_choice', 
     '["A) förmåga", "B) talang", "C) kapacitet", "D) skicklighet"]', 'A', 
     'Förmåga är det mest passande ordet i detta sammanhang.', 
     'easy', 1, 90),
    
    (v_test_2024_fall, v_section_mek, 5, 'Det var inte förrän senare som vi insåg den _____ betydelsen av hennes upptäckt.', 'multiple_choice', 
     '["A) verkliga", "B) sanna", "C) faktiska", "D) egentliga"]', 'D', 
     'Egentliga passar bäst när man pratar om den verkliga eller djupare betydelsen.', 
     'hard', 1, 120);

  -- ===========================
  -- LÄS - Läsförståelse
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds, reading_passage)
  VALUES
    (v_test_2024_fall, v_section_las, 1, 'Vad är textens huvudbudskap?', 'reading_comprehension', 
     '["A) Klimatförändringarna är oundvikliga", "B) Vi måste agera nu för att begränsa klimatförändringarna", "C) Klimatförändringarna påverkar alla länder lika", "D) Det är för sent att göra något åt klimatet"]', 
     'B', 'Texten betonar vikten av omedelbar handling för att begränsa klimatförändringarna.', 'medium', 1, 180,
     'Klimatförändringarna är en av vår tids största utmaningar. Vetenskapliga studier visar entydigt att den globala uppvärmningen accelererar och att konsekvenserna blir allt mer påtagliga. Extrema väderhändelser blir vanligare, havsnivåerna stiger och ekosystem förändras i snabb takt. För att begränsa de värsta effekterna måste vi agera nu. Det finns fortfarande tid att göra skillnad, men fönstret för handling blir allt mindre. Både politiker, företag och individer måste ta ansvar och genomföra nödvändiga förändringar för en hållbar framtid.'),
    
    (v_test_2024_fall, v_section_las, 2, 'Enligt texten, vad är det mest brådskande att göra?', 'reading_comprehension', 
     '["A) Forska mer om klimatet", "B) Vänta på bättre teknologi", "C) Agera omedelbart", "D) Informera allmänheten"]', 
     'C', 'Texten betonar att "fönstret för handling blir allt mindre" och att vi "måste agera nu".', 'easy', 1, 150,
     'Klimatförändringarna är en av vår tids största utmaningar. Vetenskapliga studier visar entydigt att den globala uppvärmningen accelererar och att konsekvenserna blir allt mer påtagliga. Extrema väderhändelser blir vanligare, havsnivåerna stiger och ekosystem förändras i snabb takt. För att begränsa de värsta effekterna måste vi agera nu. Det finns fortfarande tid att göra skillnad, men fönstret för handling blir allt mindre. Både politiker, företag och individer måste ta ansvar och genomföra nödvändiga förändringar för en hållbar framtid.');

  -- ===========================
  -- NOG - Kvantitativ jämförelse
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds)
  VALUES
    (v_test_2024_fall, v_section_nog, 1, 'Jämför: A = 2/3 och B = 0,67. Vilket påstående är sant?', 'multiple_choice', 
     '["A) A är större", "B) B är större", "C) A och B är lika stora", "D) Det går inte att avgöra"]', 'A', 
     '2/3 ≈ 0,6667 vilket är något större än 0,67.', 'medium', 1, 60),
    
    (v_test_2024_fall, v_section_nog, 2, 'Jämför: A = 3^4 och B = 4^3. Vilket påstående är sant?', 'multiple_choice', 
     '["A) A är större", "B) B är större", "C) A och B är lika stora", "D) Det går inte att avgöra"]', 'A', 
     '3^4 = 81 och 4^3 = 64, så A är större.', 'easy', 1, 45),
    
    (v_test_2024_fall, v_section_nog, 3, 'Jämför: A = 50% av 80 och B = 80% av 50. Vilket påstående är sant?', 'multiple_choice', 
     '["A) A är större", "B) B är större", "C) A och B är lika stora", "D) Det går inte att avgöra"]', 'C', 
     'Båda ger 40, så de är lika stora.', 'easy', 1, 45),
    
    (v_test_2024_fall, v_section_nog, 4, 'Jämför: A = √100 och B = √64 + √36. Vilket påstående är sant?', 'multiple_choice', 
     '["A) A är större", "B) B är större", "C) A och B är lika stora", "D) Det går inte att avgöra"]', 'B', 
     'A = 10 och B = 8 + 6 = 14, så B är större.', 'medium', 1, 60),
    
    (v_test_2024_fall, v_section_nog, 5, 'Ett föremål kostar 100 kr. Först höjs priset med 20%, sedan sänks det nya priset med 20%. Jämför: A = Slutpriset och B = 100 kr. Vilket påstående är sant?', 'multiple_choice', 
     '["A) A är större", "B) B är större", "C) A och B är lika stora", "D) Det går inte att avgöra"]', 'B', 
     'Efter höjning: 120 kr. Efter sänkning: 120 × 0,8 = 96 kr. B är större.', 'hard', 1, 90);

  -- ===========================
  -- ELF - Ekvationer och funktioner
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds)
  VALUES
    (v_test_2024_fall, v_section_elf, 1, 'Lös ekvationen: 2x + 5 = 13', 'multiple_choice', 
     '["A) x = 3", "B) x = 4", "C) x = 5", "D) x = 6"]', 'B', 
     '2x = 13 - 5 = 8, så x = 4', 'easy', 1, 75),
    
    (v_test_2024_fall, v_section_elf, 2, 'Lös ekvationen: x^2 - 5x + 6 = 0', 'multiple_choice', 
     '["A) x = 2 eller x = 3", "B) x = 1 eller x = 6", "C) x = -2 eller x = -3", "D) x = 0 eller x = 5"]', 'A', 
     'Faktorisering: (x-2)(x-3) = 0, så x = 2 eller x = 3', 'medium', 1, 90),
    
    (v_test_2024_fall, v_section_elf, 3, 'Om f(x) = 2x + 3, vad är f(5)?', 'multiple_choice', 
     '["A) 10", "B) 11", "C) 12", "D) 13"]', 'D', 
     'f(5) = 2(5) + 3 = 10 + 3 = 13', 'easy', 1, 60),
    
    (v_test_2024_fall, v_section_elf, 4, 'Lös ekvationen: 3(x - 2) = 2(x + 1)', 'multiple_choice', 
     '["A) x = 6", "B) x = 7", "C) x = 8", "D) x = 9"]', 'C', 
     '3x - 6 = 2x + 2, så x = 8', 'medium', 1, 90),
    
    (v_test_2024_fall, v_section_elf, 5, 'Om g(x) = x^2 - 4, för vilket värde på x är g(x) = 5?', 'multiple_choice', 
     '["A) x = 3", "B) x = ±3", "C) x = 4", "D) x = ±4"]', 'B', 
     'x^2 - 4 = 5, så x^2 = 9, vilket ger x = ±3', 'hard', 1, 120);

  -- ===========================
  -- KVA - Kvantitativ analys
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds)
  VALUES
    (v_test_2024_fall, v_section_kva, 1, 'En bil kör 60 km/h i 2 timmar. Hur långt har bilen kört?', 'multiple_choice', 
     '["A) 100 km", "B) 110 km", "C) 120 km", "D) 130 km"]', 'C', 
     'Sträcka = hastighet × tid = 60 × 2 = 120 km', 'easy', 1, 75),
    
    (v_test_2024_fall, v_section_kva, 2, 'En produkt kostar 800 kr inklusive 25% moms. Vad är priset exklusive moms?', 'multiple_choice', 
     '["A) 600 kr", "B) 620 kr", "C) 640 kr", "D) 660 kr"]', 'C', 
     'Pris exkl. moms = 800 / 1,25 = 640 kr', 'medium', 1, 90),
    
    (v_test_2024_fall, v_section_kva, 3, 'Ett företag har 150 anställda. 40% är kvinnor. Hur många män arbetar på företaget?', 'multiple_choice', 
     '["A) 80", "B) 85", "C) 90", "D) 95"]', 'C', 
     '60% är män: 150 × 0,6 = 90', 'easy', 1, 75),
    
    (v_test_2024_fall, v_section_kva, 4, 'En investering på 10 000 kr växer med 8% per år. Vad är värdet efter 2 år?', 'multiple_choice', 
     '["A) 11 600 kr", "B) 11 664 kr", "C) 11 700 kr", "D) 11 800 kr"]', 'B', 
     '10000 × 1,08 × 1,08 = 11 664 kr', 'hard', 1, 120),
    
    (v_test_2024_fall, v_section_kva, 5, 'En rektangel har omkrets 40 cm och längd 12 cm. Vad är bredden?', 'multiple_choice', 
     '["A) 6 cm", "B) 7 cm", "C) 8 cm", "D) 9 cm"]', 'C', 
     'Omkrets = 2(längd + bredd), så 40 = 2(12 + b), vilket ger b = 8 cm', 'medium', 1, 90);

  -- ===========================
  -- XYZ - Diagram, tabeller och kartor
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds, reading_passage)
  VALUES
    (v_test_2024_fall, v_section_xyz, 1, 'Enligt tabellen, vilket år hade Sverige högst befolkning?', 'multiple_choice', 
     '["A) 2020", "B) 2021", "C) 2022", "D) 2023"]', 'D', 
     '2023 hade den högsta befolkningen enligt tabellen.', 'easy', 1, 90,
     'Befolkning i Sverige (miljoner):\n2020: 10.3\n2021: 10.4\n2022: 10.5\n2023: 10.6'),
    
    (v_test_2024_fall, v_section_xyz, 2, 'Hur många procent ökade befolkningen från 2020 till 2023?', 'multiple_choice', 
     '["A) 2,5%", "B) 2,9%", "C) 3,0%", "D) 3,5%"]', 'B', 
     'Ökning = (10.6 - 10.3) / 10.3 × 100 ≈ 2,9%', 'medium', 1, 120,
     'Befolkning i Sverige (miljoner):\n2020: 10.3\n2021: 10.4\n2022: 10.5\n2023: 10.6');

  -- ===========================
  -- DTK - Data och teknisk förståelse
  -- ===========================
  
  INSERT INTO hp_questions (test_id, section_id, question_number, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, time_estimate_seconds, reading_passage)
  VALUES
    (v_test_2024_fall, v_section_dtk, 1, 'Vad är huvudfunktionen hos en CPU?', 'multiple_choice', 
     '["A) Lagra data permanent", "B) Utföra beräkningar och instruktioner", "C) Visa grafik på skärmen", "D) Ansluta till internet"]', 
     'B', 'CPU (Central Processing Unit) är datorns hjärna som utför beräkningar och instruktioner.', 'easy', 1, 90,
     'En dators centrala processorenhet (CPU) är ansvarig för att utföra programinstruktioner. Den läser instruktioner från minnet, tolkar dem och utför de nödvändiga operationerna. Moderna CPU:er kan utföra miljarder instruktioner per sekund och är avgörande för datorns prestanda.'),
    
    (v_test_2024_fall, v_section_dtk, 2, 'Enligt texten, vad mäts CPU:ers prestanda i?', 'multiple_choice', 
     '["A) Gigabyte", "B) Megapixel", "C) Instruktioner per sekund", "D) Watt"]', 'C', 
     'Texten nämner att moderna CPU:er kan utföra miljarder instruktioner per sekund.', 'medium', 1, 120,
     'En dators centrala processorenhet (CPU) är ansvarig för att utföra programinstruktioner. Den läser instruktioner från minnet, tolkar dem och utför de nödvändiga operationerna. Moderna CPU:er kan utföra miljarder instruktioner per sekund och är avgörande för datorns prestanda.');

  RAISE NOTICE 'Successfully inserted all questions';
  
  -- Verify insertion
  DECLARE
    v_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM hp_questions;
    RAISE NOTICE 'Total questions in database: %', v_count;
  END;

END $$;

-- Final verification query
SELECT 
  s.section_code,
  s.section_name,
  COUNT(q.id) as antal_fragor
FROM hp_sections s
LEFT JOIN hp_questions q ON q.section_id = s.id
GROUP BY s.section_code, s.section_name, s.section_order
ORDER BY s.section_order;
