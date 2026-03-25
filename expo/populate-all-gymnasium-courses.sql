-- ============================================================================
-- POPULATE ALL GYMNASIUM COURSES INCLUDING IDROTT
-- ============================================================================
-- This script inserts all gymnasium courses from the program-courses data
-- including Idrott och hälsa courses that were missing from the database
-- ============================================================================

-- First, let's insert all missing gymnasiegemensamma courses (common courses for all programs)
INSERT INTO public.courses (id, course_code, title, description, subject, level, points) VALUES
  ('IDRIDR01', 'IDRIDR01', 'Idrott och hälsa 1', 'Grundläggande kurs i idrott och hälsa', 'Idrott och hälsa', 'gymnasie', 100),
  ('IDRIDR02', 'IDRIDR02', 'Idrott och hälsa 2', 'Fortsättningskurs i idrott och hälsa', 'Idrott och hälsa', 'gymnasie', 100),
  ('HISHIS01a1', 'HISHIS01a1', 'Historia 1a1', 'Första delkursen i historia', 'Historia', 'gymnasie', 50),
  ('HISHIS01a2', 'HISHIS01a2', 'Historia 1a2', 'Andra delkursen i historia', 'Historia', 'gymnasie', 50),
  ('HISHIS01b', 'HISHIS01b', 'Historia 1b', 'Grundläggande historiekurs för högskoleförberedande program', 'Historia', 'gymnasie', 100),
  ('RELREL01', 'RELREL01', 'Religionskunskap 1', 'Grundläggande religionskunskap', 'Religionskunskap', 'gymnasie', 50),
  ('NAKNAK01a1', 'NAKNAK01a1', 'Naturkunskap 1a1', 'Första delkursen i naturkunskap', 'Naturkunskap', 'gymnasie', 50),
  ('NAKNAK01a2', 'NAKNAK01a2', 'Naturkunskap 1a2', 'Andra delkursen i naturkunskap', 'Naturkunskap', 'gymnasie', 50),
  ('SAMSAM01a1', 'SAMSAM01a1', 'Samhällskunskap 1a1', 'Första delkursen i samhällskunskap', 'Samhällskunskap', 'gymnasie', 50),
  ('SAMSAM01a2', 'SAMSAM01a2', 'Samhällskunskap 1a2', 'Andra delkursen i samhällskunskap', 'Samhällskunskap', 'gymnasie', 50),
  ('SAMSAM01b', 'SAMSAM01b', 'Samhällskunskap 1b', 'Grundläggande samhällskunskap för högskoleförberedande program', 'Samhällskunskap', 'gymnasie', 100),
  ('SVESVE01', 'SVESVE01', 'Svenska 1', 'Grundläggande svenska', 'Svenska', 'gymnasie', 100),
  ('SVESVE02', 'SVESVE02', 'Svenska 2', 'Fortsättningskurs i svenska', 'Svenska', 'gymnasie', 100),
  ('SVESVE03', 'SVESVE03', 'Svenska 3', 'Avancerad kurs i svenska', 'Svenska', 'gymnasie', 100),
  ('ENGENG05', 'ENGENG05', 'Engelska 5', 'Grundläggande engelska', 'Engelska', 'gymnasie', 100),
  ('ENGENG06', 'ENGENG06', 'Engelska 6', 'Fortsättningskurs i engelska', 'Engelska', 'gymnasie', 100),
  ('MATMAT01a', 'MATMAT01a', 'Matematik 1a', 'Grundläggande matematik', 'Matematik', 'gymnasie', 100),
  ('MATMAT01b', 'MATMAT01b', 'Matematik 1b', 'Grundläggande matematik för högskoleförberedande program', 'Matematik', 'gymnasie', 100),
  ('MATMAT02b', 'MATMAT02b', 'Matematik 2b', 'Fortsättning matematik för högskoleförberedande program', 'Matematik', 'gymnasie', 100),
  ('MATMAT03b', 'MATMAT03b', 'Matematik 3b', 'Avancerad matematik', 'Matematik', 'gymnasie', 100),
  ('MATMAT03c', 'MATMAT03c', 'Matematik 3c', 'Avancerad matematik för naturvetenskap och teknik', 'Matematik', 'gymnasie', 100),
  ('MATMAT04', 'MATMAT04', 'Matematik 4', 'Specialiserad matematik', 'Matematik', 'gymnasie', 100),
  ('MATMAT05', 'MATMAT05', 'Matematik 5', 'Fördjupad matematik', 'Matematik', 'gymnasie', 100)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  points = EXCLUDED.points;

-- Insert more subject-specific courses
INSERT INTO public.courses (id, course_code, title, description, subject, level, points) VALUES
  -- Naturvetenskap
  ('BIOBIO01', 'BIOBIO01', 'Biologi 1', 'Grundläggande biologi', 'Biologi', 'gymnasie', 100),
  ('BIOBIO02', 'BIOBIO02', 'Biologi 2', 'Fortsättningskurs i biologi', 'Biologi', 'gymnasie', 100),
  ('FYSFYS01a', 'FYSFYS01a', 'Fysik 1a', 'Grundläggande fysik', 'Fysik', 'gymnasie', 150),
  ('FYSFYS02', 'FYSFYS02', 'Fysik 2', 'Fortsättningskurs i fysik', 'Fysik', 'gymnasie', 100),
  ('KEMKEM01', 'KEMKEM01', 'Kemi 1', 'Grundläggande kemi', 'Kemi', 'gymnasie', 100),
  ('KEMKEM02', 'KEMKEM02', 'Kemi 2', 'Fortsättningskurs i kemi', 'Kemi', 'gymnasie', 100),
  
  -- Moderna språk
  ('MODMOD', 'MODMOD', 'Moderna språk', 'Moderna språk (Spanska, Franska, Tyska)', 'Moderna språk', 'gymnasie', 100),
  ('MODMOD03', 'MODMOD03', 'Moderna språk 3', 'Fortsättningskurs i moderna språk', 'Moderna språk', 'gymnasie', 100),
  ('MODMOD04', 'MODMOD04', 'Moderna språk 4', 'Avancerad kurs i moderna språk', 'Moderna språk', 'gymnasie', 100),
  
  -- Samhällsvetenskap & Humaniora
  ('FILFIL01', 'FILFIL01', 'Filosofi 1', 'Grundläggande filosofi', 'Filosofi', 'gymnasie', 50),
  ('PSKPSY01', 'PSKPSY01', 'Psykologi 1', 'Grundläggande psykologi', 'Psykologi', 'gymnasie', 50),
  ('PSKPSY02a', 'PSKPSY02a', 'Psykologi 2a', 'Fortsättningskurs i psykologi', 'Psykologi', 'gymnasie', 50),
  ('GEOGEO01', 'GEOGEO01', 'Geografi 1', 'Grundläggande geografi', 'Geografi', 'gymnasie', 100),
  ('HISHIS02a', 'HISHIS02a', 'Historia 2a', 'Avancerad historia', 'Historia', 'gymnasie', 100),
  ('HISHIS02b', 'HISHIS02b', 'Historia 2b - kultur', 'Historia med fokus på kultur', 'Historia', 'gymnasie', 100),
  ('RELREL02', 'RELREL02', 'Religionskunskap 2', 'Fördjupad religionskunskap', 'Religionskunskap', 'gymnasie', 50),
  ('SAMSAM02', 'SAMSAM02', 'Samhällskunskap 2', 'Fortsättningskurs i samhällskunskap', 'Samhällskunskap', 'gymnasie', 100),
  ('SAMSAM03', 'SAMSAM03', 'Samhällskunskap 3', 'Avancerad samhällskunskap', 'Samhällskunskap', 'gymnasie', 100),
  
  -- Ekonomi & Juridik
  ('FÖRFÖR01', 'FÖRFÖR01', 'Företagsekonomi 1', 'Grundläggande företagsekonomi', 'Företagsekonomi', 'gymnasie', 100),
  ('FÖRFÖR02', 'FÖRFÖR02', 'Företagsekonomi 2', 'Fortsättningskurs i företagsekonomi', 'Företagsekonomi', 'gymnasie', 100),
  ('JURJUR01', 'JURJUR01', 'Juridik 1', 'Grundläggande juridik', 'Juridik', 'gymnasie', 100),
  ('JURJUR02', 'JURJUR02', 'Affärsjuridik', 'Juridik för affärsverksamhet', 'Juridik', 'gymnasie', 100),
  ('JURJUR03', 'JURJUR03', 'Rätten och samhället', 'Juridik i samhällsperspektiv', 'Juridik', 'gymnasie', 100),
  ('ENTENT01', 'ENTENT01', 'Entreprenörskap och företagande', 'Grundläggande entreprenörskap', 'Företagsekonomi', 'gymnasie', 100),
  
  -- Teknik & IT
  ('TEKTEO01', 'TEKTEO01', 'Teknik 1', 'Grundläggande teknik', 'Teknik', 'gymnasie', 150),
  ('DAODAT01', 'DAODAT01', 'Dator- och nätverksteknik', 'Grundläggande IT och nätverk', 'Teknik', 'gymnasie', 100),
  ('PRRPRR01', 'PRRPRR01', 'Programmering 1', 'Grundläggande programmering', 'Teknik', 'gymnasie', 100),
  ('PRRPRR02', 'PRRPRR02', 'Programmering 2', 'Fortsättningskurs i programmering', 'Teknik', 'gymnasie', 100),
  ('WEBWEB01', 'WEBWEB01', 'Webbutveckling 1', 'Grundläggande webbutveckling', 'Teknik', 'gymnasie', 100),
  ('WEBWEB02', 'WEBWEB02', 'Webbutveckling 2', 'Fortsättningskurs i webbutveckling', 'Teknik', 'gymnasie', 100),
  ('MEKMEK01', 'MEKMEK01', 'Mekatronik 1', 'Grundläggande mekatronik', 'Teknik', 'gymnasie', 100),
  
  -- Estetiska ämnen
  ('ESTEST01', 'ESTEST01', 'Estetisk kommunikation 1', 'Grundläggande estetisk kommunikation', 'Estetisk kommunikation', 'gymnasie', 100),
  ('KOTKKO01', 'KOTKKO01', 'Konstarterna och samhället', 'Konstarter i samhällsperspektiv', 'Estetisk kommunikation', 'gymnasie', 50),
  ('BILBIL01', 'BILBIL01', 'Bild', 'Grundläggande bildkonst', 'Bild', 'gymnasie', 100),
  ('BILBIL02', 'BILBIL02', 'Bild och form 1a', 'Bild och formgivning', 'Bild', 'gymnasie', 100),
  ('MUSMUS01', 'MUSMUS01', 'Ensemble med körsång', 'Musikensemble och körsång', 'Musik', 'gymnasie', 200),
  ('MUSMUS02', 'MUSMUS02', 'Gehörs- och musiklära 1', 'Grundläggande musiklära', 'Musik', 'gymnasie', 100),
  ('DANDAN01', 'DANDAN01', 'Dansgestaltning 1', 'Grundläggande dansgestaltning', 'Dans', 'gymnasie', 100),
  ('TEATEA01', 'TEATEA01', 'Scenisk gestaltning 1', 'Grundläggande scenisk gestaltning', 'Teater', 'gymnasie', 100),
  
  -- Kommunikation & Ledarskap
  ('KOTKMU01', 'KOTKMU01', 'Kommunikation', 'Grundläggande kommunikation', 'Kommunikation', 'gymnasie', 100),
  ('LEALED01', 'LEALED01', 'Ledarskap och organisation', 'Ledarskap och organisationsteori', 'Ledarskap', 'gymnasie', 100),
  ('SOCSOC01', 'SOCSOC01', 'Sociologi', 'Grundläggande sociologi', 'Samhällskunskap', 'gymnasie', 100),
  
  -- Hälsa & Omsorg
  ('HÄLHÄL01', 'HÄLHÄL01', 'Hälsopedagogik', 'Grundläggande hälsopedagogik', 'Hälsa', 'gymnasie', 100),
  ('NAKNAK01b', 'NAKNAK01b', 'Naturkunskap 1b', 'Naturkunskap för yrkesförberedande program', 'Naturkunskap', 'gymnasie', 100),
  ('PEDPED01', 'PEDPED01', 'Lärande och utveckling', 'Pedagogik om lärande', 'Pedagogik', 'gymnasie', 100),
  ('PEDPED02', 'PEDPED02', 'Pedagogiskt ledarskap', 'Ledarskap i pedagogiska sammanhang', 'Pedagogik', 'gymnasie', 100)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  points = EXCLUDED.points;

-- ============================================================================
-- ADD SAMPLE CONTENT FOR ENGLISH 5 COURSE (ENGENG05)
-- ============================================================================

-- Insert course modules for English 5
INSERT INTO public.course_modules (id, course_id, title, description, order_index, estimated_hours, is_published) VALUES
  ('c1e5m1-uuid-0001', 'ENGENG05', 'Module 1: Introduction to English', 'Basic English grammar and vocabulary', 0, 10, true),
  ('c1e5m2-uuid-0002', 'ENGENG05', 'Module 2: Speaking and Listening', 'Develop speaking and listening skills', 1, 12, true),
  ('c1e5m3-uuid-0003', 'ENGENG05', 'Module 3: Reading Comprehension', 'Improve reading skills and text analysis', 2, 15, true),
  ('c1e5m4-uuid-0004', 'ENGENG05', 'Module 4: Writing Skills', 'Learn to write different text types', 3, 13, true),
  ('c1e5m5-uuid-0005', 'ENGENG05', 'Module 5: English in Society', 'English in a global and cultural context', 4, 10, true)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Module 1: Introduction to English
INSERT INTO public.course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published) VALUES
  (
    'l1e5m1-uuid-0001', 
    'c1e5m1-uuid-0001', 
    'ENGENG05',
    'Introduction to English Grammar',
    'Learn the basics of English grammar including parts of speech',
    E'# Introduction to English Grammar\n\nWelcome to your first lesson in English 5! In this lesson, we will cover the fundamental building blocks of English grammar.\n\n## Parts of Speech\n\nEnglish has eight main parts of speech:\n\n1. **Nouns** - Words that represent people, places, things, or ideas\n   - Examples: student, school, happiness\n\n2. **Pronouns** - Words that replace nouns\n   - Examples: he, she, it, they\n\n3. **Verbs** - Words that express actions or states of being\n   - Examples: run, think, is, become\n\n4. **Adjectives** - Words that describe nouns\n   - Examples: beautiful, tall, interesting\n\n5. **Adverbs** - Words that modify verbs, adjectives, or other adverbs\n   - Examples: quickly, very, well\n\n6. **Prepositions** - Words that show relationships between nouns/pronouns and other words\n   - Examples: in, on, at, by\n\n7. **Conjunctions** - Words that connect words, phrases, or clauses\n   - Examples: and, but, or, because\n\n8. **Interjections** - Words that express emotion\n   - Examples: wow, ouch, hey\n\n## Sentence Structure\n\nA basic English sentence follows this pattern:\n**Subject + Verb + Object**\n\nExample: The student (subject) reads (verb) a book (object).\n\n## Practice Exercise\n\nIdentify the parts of speech in this sentence:\n"The quick brown fox jumps over the lazy dog."\n\nCheck your answers in the next lesson!',
    'theory',
    0,
    45,
    'easy',
    ARRAY['Identify the eight parts of speech', 'Understand basic sentence structure', 'Apply grammar knowledge to simple sentences'],
    true
  ),
  (
    'l2e5m1-uuid-0002',
    'c1e5m1-uuid-0001',
    'ENGENG05',
    'Present Tenses',
    'Master the use of present simple and present continuous',
    E'# Present Tenses in English\n\nEnglish has several present tenses. In this lesson, we will focus on the two most common ones.\n\n## Present Simple\n\nUsed for:\n- Habitual actions\n- General truths\n- Scheduled events\n\n**Structure:** Subject + base verb (+ s/es for he/she/it)\n\nExamples:\n- I work at a school.\n- She teaches English.\n- The sun rises in the east.\n\n## Present Continuous\n\nUsed for:\n- Actions happening now\n- Temporary situations\n- Future arrangements\n\n**Structure:** Subject + am/is/are + verb-ing\n\nExamples:\n- I am studying English right now.\n- She is teaching a lesson.\n- They are moving to Stockholm next week.\n\n## Key Differences\n\n| Present Simple | Present Continuous |\n|---------------|-------------------|\n| Regular habits | Temporary actions |\n| General facts | Actions happening now |\n| Scheduled events | Near future plans |\n\n## Common Mistakes to Avoid\n\n1. ❌ I am knowing the answer.\n   ✅ I know the answer.\n   (State verbs like "know" rarely use continuous form)\n\n2. ❌ She work at a hospital.\n   ✅ She works at a hospital.\n   (Remember the -s for third person singular)\n\n## Practice\n\nComplete these sentences with the correct tense:\n1. Every morning, I _____ (drink) coffee.\n2. Right now, she _____ (read) a book.\n3. The train _____ (leave) at 3 PM every day.',
    'theory',
    1,
    50,
    'medium',
    ARRAY['Differentiate between present simple and continuous', 'Form sentences using both tenses correctly', 'Identify when to use each tense'],
    true
  ),
  (
    'l3e5m1-uuid-0003',
    'c1e5m1-uuid-0001',
    'ENGENG05',
    'Essential Vocabulary',
    'Build your English vocabulary with essential words and phrases',
    E'# Essential English Vocabulary\n\nBuilding a strong vocabulary is crucial for effective communication. Let''s explore some essential word categories.\n\n## Daily Routine Verbs\n\n- **wake up** - to stop sleeping\n- **get dressed** - to put on clothes\n- **have breakfast** - to eat the morning meal\n- **go to work/school** - to travel to your workplace or school\n- **take a break** - to stop working temporarily\n- **go home** - to return to your residence\n\n## Useful Adjectives for Descriptions\n\n### Personality\n- friendly, shy, confident, creative, patient\n\n### Appearance\n- tall, short, slim, athletic, attractive\n\n### Emotions\n- happy, sad, excited, nervous, confused\n\n## Common Phrases\n\n1. **Greetings**\n   - Good morning/afternoon/evening\n   - How are you doing?\n   - Nice to meet you\n\n2. **Polite Expressions**\n   - Thank you very much\n   - You''re welcome\n   - Excuse me\n   - I''m sorry\n\n3. **Asking for Help**\n   - Could you help me, please?\n   - I don''t understand\n   - Can you repeat that?\n\n## Word Formation\n\nLearn to create related words:\n\n| Verb | Noun | Adjective |\n|------|------|----------|\n| educate | education | educational |\n| create | creation | creative |\n| decide | decision | decisive |\n\n## Memory Tip\n\nCreate "word families" to learn related words together. This helps you remember and use vocabulary more effectively!',
    'reading',
    2,
    40,
    'easy',
    ARRAY['Learn 50+ essential English words', 'Use vocabulary in context', 'Form related words using prefixes and suffixes'],
    true
  );

-- Insert lessons for Module 2: Speaking and Listening
INSERT INTO public.course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published) VALUES
  (
    'l1e5m2-uuid-0004',
    'c1e5m2-uuid-0002',
    'ENGENG05',
    'Pronunciation Basics',
    'Learn correct English pronunciation and accent',
    E'# English Pronunciation Basics\n\nGood pronunciation is key to being understood. Let''s work on the foundations.\n\n## The English Alphabet Sounds\n\n### Vowels (a, e, i, o, u)\n\nVowels can have different sounds:\n- **a**: cat /æ/, cake /eɪ/, car /ɑː/\n- **e**: bed /e/, he /iː/, her /ɜː/\n- **i**: sit /ɪ/, like /aɪ/, bird /ɜː/\n- **o**: hot /ɒ/, go /əʊ/, work /ɜː/\n- **u**: cup /ʌ/, use /juː/, put /ʊ/\n\n## Common Pronunciation Challenges\n\n1. **TH sounds**\n   - **Voiced /ð/**: this, that, the\n   - **Voiceless /θ/**: think, thank, three\n\n2. **R sound**\n   - Swedish speakers often need to practice the English R\n   - Try: red, right, around, work\n\n3. **Weak forms**\n   - Words change pronunciation in sentences\n   - "can" /kæn/ → /kən/ in "I can go"\n\n## Word Stress\n\nEnglish uses stress to emphasize syllables:\n- PHOtograph (stress on first syllable)\n- phoTOgrapher (stress on second syllable)\n- photoGRAphic (stress on third syllable)\n\n## Sentence Intonation\n\n- **Statements**: voice goes down ↓\n  "I like English↓"\n\n- **Yes/No Questions**: voice goes up ↑\n  "Do you like English↑"\n\n- **Wh- Questions**: voice goes down ↓\n  "Where do you live↓"\n\n## Practice Tips\n\n1. Listen to native speakers daily\n2. Record yourself and compare\n3. Focus on problematic sounds\n4. Practice with tongue twisters\n5. Speak slowly and clearly\n\n## Tongue Twister Challenge\n\nTry these:\n- "She sells seashells by the seashore"\n- "Peter Piper picked a peck of pickled peppers"\n- "How much wood would a woodchuck chuck"',
    'practical',
    0,
    60,
    'medium',
    ARRAY['Pronounce English sounds correctly', 'Use appropriate word stress', 'Apply correct intonation patterns'],
    true
  ),
  (
    'l2e5m2-uuid-0005',
    'c1e5m2-uuid-0002',
    'ENGENG05',
    'Everyday Conversations',
    'Practice common conversation scenarios',
    E'# Everyday English Conversations\n\nLet''s practice real-life conversation scenarios you''ll encounter regularly.\n\n## Scenario 1: Meeting Someone New\n\n**Person A**: Hi, I''m Anna. Nice to meet you!\n**Person B**: Hello Anna, I''m Erik. Nice to meet you too!\n**Person A**: So, what do you do, Erik?\n**Person B**: I''m a student. I study engineering. How about you?\n**Person A**: I work as a teacher at the local school.\n\n### Key Phrases:\n- Nice to meet you\n- What do you do?\n- How about you?\n- I work as...\n- I study...\n\n## Scenario 2: At a Café\n\n**Customer**: Hello, can I have a cappuccino, please?\n**Barista**: Of course! Would you like anything to eat?\n**Customer**: Yes, I''ll have a cinnamon bun too.\n**Barista**: That''ll be 75 kronor, please.\n**Customer**: Here you go. Can I pay by card?\n**Barista**: Absolutely!\n\n### Useful Expressions:\n- Can I have...?\n- I''ll have...\n- That''ll be...\n- Here you go\n- Can I pay by...?\n\n## Scenario 3: Asking for Directions\n\n**Tourist**: Excuse me, how do I get to the train station?\n**Local**: Go straight ahead, then turn left at the traffic lights.\n**Tourist**: Is it far from here?\n**Local**: No, it''s only about 5 minutes walk.\n**Tourist**: Thank you so much!\n**Local**: You''re welcome!\n\n### Direction Vocabulary:\n- Go straight ahead\n- Turn left/right\n- At the traffic lights\n- Cross the street\n- On your left/right\n- Next to / opposite / between\n\n## Scenario 4: Making Plans\n\n**Friend 1**: Would you like to go to the cinema this weekend?\n**Friend 2**: That sounds great! What time?\n**Friend 1**: How about Saturday evening at 7?\n**Friend 2**: Perfect! See you then!\n\n### Making Arrangements:\n- Would you like to...?\n- How about...?\n- That sounds great/good\n- See you then/there\n\n## Practice Activity\n\nWork with a partner and practice these scenarios. Try to:\n1. Use natural intonation\n2. Make eye contact\n3. Add your own variations\n4. Role-play different situations',
    'practical',
    1,
    45,
    'easy',
    ARRAY['Conduct basic conversations', 'Use appropriate phrases for different situations', 'Respond naturally in dialogues'],
    true
  );

-- Insert study guides for English 5
INSERT INTO public.study_guides (id, course_id, title, description, content, guide_type, difficulty_level, estimated_read_time, is_published) VALUES
  (
    'sg1e5-uuid-0001',
    'ENGENG05',
    'English 5 Grammar Summary',
    'Complete overview of grammar topics covered in English 5',
    E'# English 5 Grammar Summary\n\n## Present Tenses\n\n### Present Simple\n- Form: Subject + verb (base form)\n- Use: Habits, facts, schedules\n- Example: I study English every day.\n\n### Present Continuous\n- Form: Subject + am/is/are + verb-ing\n- Use: Actions happening now, temporary situations\n- Example: I am studying English right now.\n\n## Past Tenses\n\n### Past Simple\n- Form: Subject + verb (past form)\n- Use: Completed actions in the past\n- Example: I studied English yesterday.\n\n### Past Continuous\n- Form: Subject + was/were + verb-ing\n- Use: Actions in progress at a specific time in the past\n- Example: I was studying when you called.\n\n## Question Formation\n\n- Yes/No questions: Do/Does/Did + subject + verb?\n- Wh- questions: Wh-word + do/does/did + subject + verb?\n- Example: What do you study?\n\n## Common Irregular Verbs\n\n| Base | Past Simple | Past Participle |\n|------|-------------|----------------|\n| go | went | gone |\n| see | saw | seen |\n| do | did | done |\n| make | made | made |\n| take | took | taken |\n\n## Articles\n\n- **a/an**: indefinite article (first mention, general)\n- **the**: definite article (specific, previously mentioned)\n- Example: I saw a cat. The cat was black.',
    'summary',
    'easy',
    15,
    true
  ),
  (
    'sg2e5-uuid-0002',
    'ENGENG05',
    'Essential Vocabulary List',
    'Key vocabulary words and phrases for English 5',
    E'# Essential Vocabulary for English 5\n\n## Academic Vocabulary\n\n### Verbs\n- analyze - to examine in detail\n- compare - to find similarities\n- contrast - to find differences\n- describe - to give details about\n- discuss - to talk about in detail\n- evaluate - to assess the value\n- explain - to make clear\n- summarize - to give main points\n\n### Linking Words\n\n#### Addition\n- furthermore, moreover, in addition, also\n\n#### Contrast\n- however, nevertheless, on the other hand, although\n\n#### Cause and Effect\n- because, since, therefore, consequently, as a result\n\n#### Example\n- for example, for instance, such as\n\n## Topic-Specific Vocabulary\n\n### Education\n- curriculum, assignment, deadline, exam, grade\n- classmate, teacher, principal, course, subject\n\n### Technology\n- device, software, application, download, upload\n- internet, website, online, digital, social media\n\n### Environment\n- climate change, pollution, sustainable, recycle\n- ecosystem, conservation, renewable, carbon footprint\n\n## Useful Phrases\n\n### Expressing Opinion\n- In my opinion...\n- I believe that...\n- It seems to me that...\n- From my perspective...\n\n### Agreeing/Disagreeing\n- I completely agree\n- I see your point, but...\n- I''m not sure I agree\n- That''s a good point',
    'vocabulary',
    'easy',
    20,
    true
  );

-- Insert exercises for the lessons
INSERT INTO public.course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, points, difficulty_level, is_published) VALUES
  (
    'ex1e5m1-uuid-0001',
    'l1e5m1-uuid-0001',
    'ENGENG05',
    'Parts of Speech Quiz',
    'Test your knowledge of English parts of speech',
    'Identify the correct part of speech for each underlined word in the sentences below.',
    'multiple_choice',
    '[
      {
        "question": "The QUICK brown fox jumps over the lazy dog. What part of speech is ''QUICK''?",
        "options": ["Noun", "Verb", "Adjective", "Adverb"],
        "correctAnswer": 2
      },
      {
        "question": "The quick brown fox JUMPS over the lazy dog. What part of speech is ''JUMPS''?",
        "options": ["Noun", "Verb", "Adjective", "Preposition"],
        "correctAnswer": 1
      },
      {
        "question": "The quick brown fox jumps OVER the lazy dog. What part of speech is ''OVER''?",
        "options": ["Conjunction", "Preposition", "Adverb", "Adjective"],
        "correctAnswer": 1
      }
    ]'::jsonb,
    30,
    'easy',
    true
  ),
  (
    'ex2e5m1-uuid-0002',
    'l2e5m1-uuid-0002',
    'ENGENG05',
    'Present Tense Practice',
    'Fill in the blanks with the correct present tense',
    'Complete each sentence using either present simple or present continuous.',
    'short_answer',
    '[
      {
        "question": "Every morning, I _____ (drink) coffee.",
        "correctAnswer": "drink"
      },
      {
        "question": "Right now, she _____ (read) a book.",
        "correctAnswer": "is reading"
      },
      {
        "question": "The sun _____ (rise) in the east.",
        "correctAnswer": "rises"
      },
      {
        "question": "Look! It _____ (rain) outside.",
        "correctAnswer": "is raining"
      }
    ]'::jsonb,
    40,
    'medium',
    true
  );

-- Verify the data was inserted
SELECT 
  'Courses inserted/updated' as status,
  COUNT(*) as count
FROM public.courses 
WHERE id IN ('ENGENG05', 'IDRIDR01', 'IDRIDR02')
UNION ALL
SELECT 
  'Modules for English 5' as status,
  COUNT(*) as count
FROM public.course_modules
WHERE course_id = 'ENGENG05'
UNION ALL
SELECT 
  'Lessons for English 5' as status,
  COUNT(*) as count
FROM public.course_lessons
WHERE course_id = 'ENGENG05'
UNION ALL
SELECT 
  'Study guides for English 5' as status,
  COUNT(*) as count
FROM public.study_guides
WHERE course_id = 'ENGENG05'
UNION ALL
SELECT 
  'Exercises for English 5' as status,
  COUNT(*) as count
FROM public.course_exercises
WHERE course_id = 'ENGENG05';
