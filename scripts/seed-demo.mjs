#!/usr/bin/env node
/**
 * seed-demo.js
 *
 * Inserts a demo client + a complete Storytelling Thread book project into Supabase
 * so you can test the workspace without running AI generation.
 *
 * Run with: npm run seed
 *
 * Safe to run multiple times — skips creation if demo data already exists.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
const envPath = resolve(__dirname, '../.env.local');
const env = {};
readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
    if (m) env[m[1]] = m[2].trim();
  });

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_SLUG = 'demo';
const DEMO_CLIENT = {
  slug: DEMO_SLUG,
  name: 'Rivera Family',
  access_code: 'demo123',
};

const DEMO_PROJECT = {
  title: 'The Story of the Rivera Family',
  subject_name: 'The Rivera Family',
  art_style: 'watercolor, warm earth tones, storybook illustration',
  target_age: '5-8',
  ancestry_data: `Family origins: San Marcos Tlapazola, Oaxaca, Mexico.
Paternal great-grandparents: Roberto Sr. and Consuelo Rivera. Roberto was a master tapete (rug) weaver; Consuelo was known for her traditional Zapotec cooking.
Grandfather (José Rivera Sr.): born 1958 in San Marcos Tlapazola. Immigrated to Fresno, California in 1974 at age 16 with parents and siblings. Became a farmworker, then foreman, then small business owner (Rivera Landscaping Co.).
Grandmother (Maria Rivera, née Salinas): born 1960 in Fresno to a family that had immigrated in the 1940s. Her family was originally from Michoacán.
José and Maria married in 1981.
Children: Rosa (b. 1982), Daniel (b. 1984), Elena (b. 1987).
Family now spans three generations in the Central Valley. José and Maria still live in the house they bought in 1989 in Fresno. Grandchildren now in college.`,
  oral_history: `Grandma Maria always says: "We came here with two suitcases and one dream."
Grandpa José remembers looking back at the mountains as they drove away from Oaxaca and thinking he would never see them again. He went back for the first time in 1998 with his kids—Rosa was 16, Daniel 14, Elena 11. He cried at the airport.
The tamale-making tradition: Every Christmas Eve, the whole family makes tamales together. It takes all day. Rosa says this is her favorite memory of childhood—standing on a stool to help spread masa because she wasn't tall enough yet.
Grandma Maria learned English by watching Sesame Street with Rosa and Daniel.
Grandpa José taught himself to read English using the newspaper. He would circle words he didn't know and look them up in a Spanish-English dictionary.
The weaving: Grandpa José's father Roberto taught him some weaving before they left. José brought one of his father's tapetes to California. It still hangs in their living room. It's one of the family's most treasured objects.
Daniel is the family historian—he's been recording oral history interviews with his parents and grandparents for the past five years.`,
  chapter_outline: [
    {
      number: 1,
      title: 'A Village in the Mountains',
      theme: 'Origins and roots — the family home in Oaxaca',
      keyCharacters: ['Young José', 'Abuela Consuelo', 'Roberto (José\'s father)'],
    },
    {
      number: 2,
      title: 'The Day Everything Changed',
      theme: 'The decision to leave — courage in the face of the unknown',
      keyCharacters: ['Young José', 'Mamá', 'Papá Roberto'],
    },
    {
      number: 3,
      title: 'A New Beginning',
      theme: 'Arriving in California — wonder, confusion, and resilience',
      keyCharacters: ['Young José', 'Uncle Ernesto', 'Cousin Diego', 'Mrs. Patterson'],
    },
    {
      number: 4,
      title: 'The Smell of Tamales',
      theme: 'Keeping traditions alive — culture as a compass',
      keyCharacters: ['José', 'Maria', 'Baby Rosa', 'Abuela Consuelo (in memory)'],
    },
    {
      number: 5,
      title: 'Growing Roots',
      theme: 'The second generation — belonging to two worlds',
      keyCharacters: ['Rosa', 'Daniel', 'Elena', 'José and Maria as parents'],
    },
    {
      number: 6,
      title: 'The Trip Back',
      theme: 'Returning to Oaxaca — completing the circle',
      keyCharacters: ['José', 'Maria', 'Rosa (16)', 'Daniel (14)', 'Elena (11)'],
    },
    {
      number: 7,
      title: 'Where We Belong',
      theme: 'Present day — three generations, one family, one story',
      keyCharacters: ['The whole Rivera family', 'Grandchildren', 'José and Maria'],
    },
  ],
  character_guide: `CHARACTER GUIDE — The Rivera Family Story (updated through Chapter 2)

JOSÉ RIVERA SR. (Grandfather / Young José)
- As a child in Oaxaca: curious, adventurous, loves chasing chickens and watching his father weave; doesn't fully understand the world yet but absorbs everything
- Personality: observant, thoughtful, slow to speak but deeply feeling
- Key detail: always watching adults' faces for clues about what's really happening
- Voice: asks questions that are bigger than they seem ("Is it a good adventure?")

ROBERTO RIVERA (José's father / Great-grandfather)
- Master tapete weaver from San Marcos Tlapazola; his hands are the hands of a craftsman—strong, patient, precise
- Believes stories live in the things we make, not just in words
- Personality: quiet, deeply principled; shows love through teaching
- Key quote: "Each pattern is a word. Each rug is a whole story."
- Left behind: his loom. Brought with him: one finished tapete (now hangs in José's Fresno living room)

CONSUELO RIVERA (José's grandmother / Abuela Consuelo)
- Heart of the family; wakes before the sun every day to grind corn on the metate
- The village knows her by the smell of her tortillas
- Personality: warm, practical, unflappable; expresses love through food and routine
- Has now passed away — appears in Chapters 1-2 as a living presence; later as a cherished memory

MAMÁ (José's mother)
- Named but not yet fully characterized — warm, protective, honest with her children even about hard things
- Key moment (Ch. 2): tells José the adventure "will be both" good and hard; refuses to lie to him
- Shows courage without hiding its cost

THE VILLAGE OF SAN MARCOS TLAPAZOLA
- Treat this as a character: mist-wrapped, colorful (saffron yellow, sky blue, hibiscus pink houses), stone streets, mountain backdrop
- Sensory anchors: smell of tortillas, sound of the metate, clucking chickens, the purple mountain in the distance`,
};

const DEMO_CHAPTERS = [
  {
    chapter_number: 1,
    title: 'A Village in the Mountains',
    status: 'approved',
    narrative: `The morning mist curled around the blue mountains like a sleeping cat when little José first opened his eyes. He lived in San Marcos Tlapazola, a small village in Oaxaca where the streets were made of stone and the houses were painted in colors that would make a rainbow jealous — saffron yellow, sky blue, hibiscus pink.

Every morning, Abuela Consuelo would wake before the sun. José would hear the sound of the metate — the smooth stone grinding corn — and the rhythm would pull him from his dreams like a gentle hand. The smell of freshly made tortillas would drift through the courtyard, mixing with the cool mountain air.

"¡José! ¡Levántate!" she would call, and he would tumble out of his hammock and run barefoot across the cool tile floor.

In the village, everyone knew everyone. The baker, Don Aurelio, would slip José a piece of pan dulce when his mother wasn't looking. The goats wandered through the market on Wednesdays, driven by old Doña Petra who had lived in the village longer than anyone could remember.

José's father, Roberto, was a weaver. His fingers moved like water over the loom, pulling threads of crimson and jade and gold into patterns that told stories — of jaguars and mountains, of rain and harvest. The tapetes, the woven rugs, were famous three villages over.

"Each pattern is a word," Papá would tell José, lifting him up so he could see the loom up close. "And each rug is a whole story. We are telling a story that has been told for a thousand years."

José didn't fully understand then. He was more interested in chasing the chickens that pecked around the doorstep. But he watched his father's hands, and something was planted in him — a seed of knowing that stories live not just in words, but in the things we make and the places we call home.

That village in the mountains, wrapped in mist and color and the smell of corn, was where the Rivera family story began.`,
    illustration_prompt: `Children's book illustration in watercolor with warm earth tones. A small boy with black hair (age 7-8) runs barefoot across a sunlit courtyard in a colorful Mexican village. Saffron yellow and sky blue painted walls surround him. In the background, a woman grinds corn on a stone metate, smoke curling from a small fire. Through an archway, purple mountains rise in morning mist. Chickens peck at the ground. The style is soft, dreamlike, and full of warmth — reminiscent of a classic picture book illustration.`,
    approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    chapter_number: 2,
    title: 'The Day Everything Changed',
    status: 'approved',
    narrative: `It happened on a Tuesday, which seemed wrong to José. Big things, he would later decide, should only happen on days that feel big — not ordinary Tuesdays when the goats were still wandering through the market and the tortillas were still being made.

But there was Papá at the kitchen table, a letter in his hands. Mamá stood behind him, her hand on his shoulder, reading over his head. Their faces were complicated in a way that faces usually weren't — happy and sad at the same time, like a song that makes you want to cry and dance at once.

"It's from Uncle Ernesto," Papá said finally. "He wants us to come. To California."

José had heard of California the way he had heard of the moon — a real place, certainly, but very far away and impossible to really imagine. Uncle Ernesto had gone three years ago and sent back photographs: wide streets, tall palm trees, a house with a garage. In the photographs he was always smiling, wearing a baseball cap.

The conversation that followed was not for children, so José sat on the doorstep with his knees pulled to his chest and listened to the rise and fall of voices from inside. He heard words: trabajo, dinero, escuela, futuro. Work, money, school, future.

He looked out at the street he had grown up on. At the wall painted blue. At the mango tree in the neighbor's yard. At the mountain that was always there, purple and patient in the distance.

When Mamá came to find him, her eyes were red but she was smiling. She sat down beside him on the step.

"We're going on a great adventure," she said.

"Is it a good adventure?" José asked.

She looked at the mountain for a long moment. "It will be both," she said honestly. "The best adventures always are."

Three months later, the Rivera family packed what they could carry and left the village in the mountains. José looked back until he couldn't see it anymore. And then he turned forward.`,
    illustration_prompt: `Children's book illustration in watercolor with warm earth tones. A young Mexican boy (7-8 years old) sits on a stone doorstep hugging his knees, looking out at a cobblestone street. A woman sits beside him, her arm around his shoulders. The street is bathed in late afternoon golden light. In the distance, a purple mountain is visible between colorful painted walls. The mood is bittersweet — tender and hopeful. Inside through the open door, a man sits at a table reading a letter. Soft watercolor strokes, classic picture book style.`,
    approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    chapter_number: 3,
    title: 'A New Beginning',
    status: 'draft',
    narrative: `California was nothing like the photographs.

The photographs had shown wide streets and sunshine, and yes, those were there — but they hadn't shown how big everything was, how fast everything moved. Cars zoomed past like they had somewhere very important to be. Signs were in English, which José couldn't read yet. The supermarket was so large it made him feel small, with aisles that went on and on under bright lights that never turned off.

They moved into a house in Fresno with Uncle Ernesto and his family. It was crowded — eight people in four rooms — but there was always something cooking on the stove and always voices and laughter. Cousin Diego, who was José's age, showed him everything: how to use the school bus, which cartoons were good on Saturday morning, how to ride a bicycle on the sidewalk without falling.

The hardest part was school. José sat in a classroom full of English words that floated past him like leaves in a river — so many of them, moving so fast. His teacher, Mrs. Patterson, had kind eyes and spoke slowly when she talked to him, but slowly-in-English was still English. He nodded and tried not to let anyone see how lost he felt.

But children are remarkable creatures. Within three months, José was following along. Within six months, he was raising his hand in class. English arrived in his brain the way the sun rises — slowly at first, then all at once.

Home was different from school. Home was Spanish and tortillas and telenovelas on the small TV. Home was Mamá calling him for dinner in the same voice she'd used in Oaxaca. Home was the small altar on the shelf with a photo of Abuela Consuelo and a glass of water left for her, just as always.

The Rivera family was learning to live in two worlds at once. It wasn't always easy. But they were together, and together turned out to be the most important thing.`,
    illustration_prompt: `Children's book illustration in watercolor with warm earth tones. A young Mexican boy (8-9 years old) sits at a school desk surrounded by rows of other children, looking slightly overwhelmed. His desk has an open English textbook with words he doesn't know circled in pencil. His teacher (a kind-faced woman with glasses) crouches beside his desk to help him. The classroom is bright and busy. Split the scene: on the left, the busy school; on the right, the cozy home where the same boy is laughing with family around a table with food. Two worlds, warm and full of love. Classic picture book watercolor style.`,
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱 Starting demo seed...\n');

  // 1. Get or create demo client
  console.log(`Checking for client with slug "${DEMO_SLUG}"...`);
  let { data: existingClient, error: clientFetchError } = await supabase
    .from('clients')
    .select('id, slug, name')
    .eq('slug', DEMO_SLUG)
    .maybeSingle();

  if (clientFetchError) {
    console.error('Error checking for client:', clientFetchError.message);
    process.exit(1);
  }

  let clientId;
  if (existingClient) {
    clientId = existingClient.id;
    console.log(`  ✓ Found existing client: "${existingClient.name}" (id: ${clientId})`);
  } else {
    const { data: newClient, error: clientCreateError } = await supabase
      .from('clients')
      .insert(DEMO_CLIENT)
      .select('id')
      .single();

    if (clientCreateError || !newClient) {
      console.error('Error creating client:', clientCreateError?.message);
      process.exit(1);
    }
    clientId = newClient.id;
    console.log(`  ✓ Created demo client "${DEMO_CLIENT.name}" (id: ${clientId})`);
    console.log(`    slug: ${DEMO_SLUG} | access code: ${DEMO_CLIENT.access_code}`);
  }

  // 2. Get or create demo book project
  console.log(`\nChecking for book project "${DEMO_PROJECT.title}"...`);
  let { data: existingProject } = await supabase
    .from('book_projects')
    .select('id, title')
    .eq('client_id', clientId)
    .eq('title', DEMO_PROJECT.title)
    .maybeSingle();

  let projectId;
  if (existingProject) {
    projectId = existingProject.id;
    console.log(`  ✓ Found existing project (id: ${projectId})`);
  } else {
    const { data: newProject, error: projectCreateError } = await supabase
      .from('book_projects')
      .insert({
        client_id: clientId,
        title: DEMO_PROJECT.title,
        subject_name: DEMO_PROJECT.subject_name,
        art_style: DEMO_PROJECT.art_style,
        target_age: DEMO_PROJECT.target_age,
        ancestry_data: DEMO_PROJECT.ancestry_data,
        oral_history: DEMO_PROJECT.oral_history,
        chapter_outline: DEMO_PROJECT.chapter_outline,
        character_guide: DEMO_PROJECT.character_guide,
      })
      .select('id')
      .single();

    if (projectCreateError || !newProject) {
      console.error('Error creating project:', projectCreateError?.message);
      process.exit(1);
    }
    projectId = newProject.id;
    console.log(`  ✓ Created book project (id: ${projectId})`);
  }

  // 3. Upsert chapters
  console.log(`\nUpserting ${DEMO_CHAPTERS.length} demo chapters...`);
  for (const chapter of DEMO_CHAPTERS) {
    const { data: existing } = await supabase
      .from('book_chapters')
      .select('id')
      .eq('project_id', projectId)
      .eq('chapter_number', chapter.chapter_number)
      .maybeSingle();

    if (existing) {
      console.log(`  → Chapter ${chapter.chapter_number} already exists, skipping.`);
      continue;
    }

    const row = {
      project_id: projectId,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      narrative: chapter.narrative,
      illustration_prompt: chapter.illustration_prompt,
      image_url: null,
      status: chapter.status,
      feedback: null,
      approved_at: chapter.approved_at || null,
    };

    const { error: chapterError } = await supabase.from('book_chapters').insert(row);

    if (chapterError) {
      console.error(`  ✗ Error inserting chapter ${chapter.chapter_number}:`, chapterError.message);
    } else {
      const statusLabel = chapter.status === 'approved' ? '✓ approved' : '📝 draft';
      console.log(`  ${statusLabel} Chapter ${chapter.chapter_number}: "${chapter.title}"`);
    }
  }

  // 4. Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Demo seed complete!\n');
  console.log('To test the Storytelling Thread:');
  console.log(`  1. Go to /workflows/${DEMO_SLUG}/access`);
  console.log(`  2. Enter access code: ${DEMO_CLIENT.access_code}`);
  console.log(`  3. Go to /workflows/${DEMO_SLUG}/storytelling/access`);
  console.log(`  4. Enter storytelling password: (see STORYTELLING_PASSWORD in .env.local)`);
  console.log(`  5. Open the project: "${DEMO_PROJECT.title}"`);
  console.log('\nDemo project state:');
  console.log('  Chapters 1 & 2 — approved');
  console.log('  Chapter 3       — draft (ready to approve or revise)');
  console.log('  Chapters 4–7    — not yet generated (click Generate to run AI)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
