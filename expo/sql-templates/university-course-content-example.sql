-- =====================================================
-- EXEMPEL: Skapa innehåll för SF1624 Algebra och Geometri
-- =====================================================
-- Detta är ett exempel på hur man skapar moduler, 
-- lektioner och övningar för en universitetskurs
-- =====================================================

BEGIN;

-- =====================================================
-- VARIABLER (byt ut dessa)
-- =====================================================

-- Hitta course_id för SF1624
DO $$
DECLARE
  v_course_id UUID;
  v_module1_id UUID;
  v_module2_id UUID;
  v_lesson1_id UUID;
  v_lesson2_id UUID;
BEGIN

  -- Hämta course_id för SF1624
  SELECT id INTO v_course_id
  FROM university_courses
  WHERE course_code = 'SF1624'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course SF1624 not found!';
  END IF;

  RAISE NOTICE 'Found course: %', v_course_id;

  -- =====================================================
  -- SKAPA MODUL 1: Linjär Algebra
  -- =====================================================

  INSERT INTO university_course_modules (
    course_id,
    title,
    description,
    order_index,
    duration_minutes,
    is_published
  ) VALUES (
    v_course_id,
    'Linjär Algebra Grunder',
    'Introduktion till vektorer, matriser och linjära ekvationssystem',
    1,
    300,
    true
  ) RETURNING id INTO v_module1_id;

  RAISE NOTICE 'Created module 1: %', v_module1_id;

  -- =====================================================
  -- SKAPA LEKTIONER FÖR MODUL 1
  -- =====================================================

  -- Lektion 1.1: Vektorer
  INSERT INTO university_course_lessons (
    module_id,
    title,
    content,
    order_index,
    duration_minutes,
    lesson_type,
    is_published
  ) VALUES (
    v_module1_id,
    'Vektorer i R² och R³',
    E'# Vektorer i R² och R³\n\n## Vad är en vektor?\n\nEn vektor är ett matematiskt objekt som har både **storlek** (magnitud) och **riktning**.\n\n### Vektorer i R²\nI planet (R²) skrivs en vektor som:\n```\nv = (x, y)\n```\n\n### Vektorer i R³\nI rummet (R³) skrivs en vektor som:\n```\nv = (x, y, z)\n```\n\n## Vektoraddition\n\nVid addition av vektorer adderar vi motsvarande komponenter:\n```\n(a₁, a₂) + (b₁, b₂) = (a₁ + b₁, a₂ + b₂)\n```\n\n### Exempel\n```\n(2, 3) + (1, -1) = (2+1, 3+(-1)) = (3, 2)\n```\n\n## Skalär multiplikation\n\nVid multiplikation med en skalär (ett tal) multiplicerar vi varje komponent:\n```\nk · (x, y) = (k·x, k·y)\n```\n\n### Exempel\n```\n2 · (3, 4) = (2·3, 2·4) = (6, 8)\n```\n\n## Vektorns längd (norm)\n\nLängden av en vektor v = (x, y) beräknas med:\n```\n||v|| = √(x² + y²)\n```\n\n### Exempel\n```\nv = (3, 4)\n||v|| = √(3² + 4²) = √(9 + 16) = √25 = 5\n```',
    1,
    45,
    'theory',
    true
  ) RETURNING id INTO v_lesson1_id;

  RAISE NOTICE 'Created lesson 1.1: %', v_lesson1_id;

  -- =====================================================
  -- SKAPA ÖVNINGAR FÖR LEKTION 1.1
  -- =====================================================

  -- Övning 1: Vektoraddition
  INSERT INTO university_course_exercises (
    lesson_id,
    question,
    question_type,
    options,
    correct_answer,
    explanation,
    difficulty,
    order_index,
    points
  ) VALUES (
    v_lesson1_id,
    'Vad är resultatet av vektorsumman (2, 3) + (1, -1)?',
    'multiple_choice',
    '["(3, 2)", "(1, 2)", "(3, 4)", "(2, 3)"]'::jsonb,
    '(3, 2)',
    'När man adderar vektorer adderar man motsvarande komponenter: (2+1, 3+(-1)) = (3, 2)',
    'easy',
    1,
    1
  );

  -- Övning 2: Skalär multiplikation
  INSERT INTO university_course_exercises (
    lesson_id,
    question,
    question_type,
    options,
    correct_answer,
    explanation,
    difficulty,
    order_index,
    points
  ) VALUES (
    v_lesson1_id,
    'Vad är resultatet av 3 · (2, -1)?',
    'multiple_choice',
    '["(6, -3)", "(5, 2)", "(6, 3)", "(2, -3)"]'::jsonb,
    '(6, -3)',
    'Vid skalär multiplikation multiplicerar man varje komponent: 3·(2, -1) = (3·2, 3·(-1)) = (6, -3)',
    'easy',
    2,
    1
  );

  -- Övning 3: Vektorns längd
  INSERT INTO university_course_exercises (
    lesson_id,
    question,
    question_type,
    options,
    correct_answer,
    explanation,
    difficulty,
    order_index,
    points
  ) VALUES (
    v_lesson1_id,
    'Vad är längden av vektorn v = (3, 4)?',
    'multiple_choice',
    '["5", "7", "25", "12"]'::jsonb,
    '5',
    'Längden beräknas med ||v|| = √(x² + y²) = √(3² + 4²) = √(9 + 16) = √25 = 5',
    'medium',
    3,
    2
  );

  -- Lektion 1.2: Matriser
  INSERT INTO university_course_lessons (
    module_id,
    title,
    content,
    order_index,
    duration_minutes,
    lesson_type,
    is_published
  ) VALUES (
    v_module1_id,
    'Matriser och Matrisoperationer',
    E'# Matriser och Matrisoperationer\n\n## Vad är en matris?\n\nEn matris är en rektangulär anordning av tal. En m×n matris har m rader och n kolumner.\n\n### Exempel på en 2×3 matris:\n```\nA = [1  2  3]\n    [4  5  6]\n```\n\n## Matrisaddition\n\nTvå matriser av samma dimension kan adderas genom att addera motsvarande element:\n```\n[a  b]   [e  f]   [a+e  b+f]\n[c  d] + [g  h] = [c+g  d+h]\n```\n\n### Exempel\n```\n[1  2]   [5  6]   [6   8]\n[3  4] + [7  8] = [10  12]\n```\n\n## Matrismultiplikation\n\nVid matrismultiplikation AB multiplicerar vi raderna i A med kolumnerna i B.\n\nFör att AB ska vara definierat måste antalet kolumner i A vara lika med antalet rader i B.\n\n### Exempel\n```\n[1  2]   [5]   [1·5 + 2·6]   [17]\n[3  4] · [6] = [3·5 + 4·6] = [39]\n```\n\n## Identitetsmatrisen\n\nIdentitetsmatrisen I är en kvadratisk matris med ettor på diagonalen och nollor överallt annars:\n```\nI₂ = [1  0]\n     [0  1]\n\nI₃ = [1  0  0]\n     [0  1  0]\n     [0  0  1]\n```\n\nEgenskapen: A · I = I · A = A',
    2,
    60,
    'theory',
    true
  ) RETURNING id INTO v_lesson2_id;

  -- Övningar för Lektion 1.2
  INSERT INTO university_course_exercises (
    lesson_id,
    question,
    question_type,
    options,
    correct_answer,
    explanation,
    difficulty,
    order_index,
    points
  ) VALUES (
    v_lesson2_id,
    'Vilken dimension har resultatet av multiplikationen av en 2×3 matris med en 3×4 matris?',
    'multiple_choice',
    '["2×4", "2×3", "3×4", "6×12"]'::jsonb,
    '2×4',
    'Vid matrismultiplikation AB blir dimensionen (rader i A) × (kolumner i B). Alltså 2×4.',
    'medium',
    1,
    2
  );

  -- =====================================================
  -- SKAPA MODUL 2: Geometri
  -- =====================================================

  INSERT INTO university_course_modules (
    course_id,
    title,
    description,
    order_index,
    duration_minutes,
    is_published
  ) VALUES (
    v_course_id,
    'Analytisk Geometri',
    'Linjer, plan och avstånd i R² och R³',
    2,
    240,
    true
  ) RETURNING id INTO v_module2_id;

  RAISE NOTICE 'Created module 2: %', v_module2_id;

  -- Lägg till fler lektioner och övningar här...

  RAISE NOTICE 'Successfully created content for SF1624!';

END $$;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

-- Kontrollera att allt skapades korrekt
SELECT 
  c.course_code,
  c.title as course_title,
  COUNT(DISTINCT m.id) as modules,
  COUNT(DISTINCT l.id) as lessons,
  COUNT(DISTINCT e.id) as exercises
FROM university_courses c
LEFT JOIN university_course_modules m ON m.course_id = c.id
LEFT JOIN university_course_lessons l ON l.module_id = m.id
LEFT JOIN university_course_exercises e ON e.lesson_id = l.id
WHERE c.course_code = 'SF1624'
GROUP BY c.course_code, c.title;
