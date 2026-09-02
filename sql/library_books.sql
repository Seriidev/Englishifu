-- Student Library catalog, managed from /admin/books.
-- Safe to re-run. Catalog stays empty until an admin uploads books.

CREATE TABLE IF NOT EXISTS library_books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0
    CHECK (rating >= 0 AND rating <= 5),
  minutes INTEGER NOT NULL DEFAULT 10,
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  cover_headline TEXT,
  pdf_url TEXT,
  pdf_file_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE library_books
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_name TEXT;

CREATE INDEX IF NOT EXISTS idx_library_books_published
  ON library_books (is_published, display_order ASC, id ASC);

-- Remove the demo catalog so Library starts clean.
DELETE FROM library_books
WHERE title IN (
  'TOEFL words you must know',
  'The Gift of the Magi',
  'Present Perfect in Academic Writing',
  'Campus Housing Guide',
  'The Last Leaf',
  'Relative Clauses Workshop',
  'Why Bees Matter',
  'Pride and Prejudice (excerpt)',
  'Nominalization for Essays',
  'Independent Essay: Cities vs Villages',
  'Glaciers and Climate Records',
  'Hamlet (soliloquy notes)',
  'Hedging in Research Papers',
  'Integrated Writing Sample: Bird Migration',
  'On Liberty (excerpt)',
  'Inversion and Emphasis',
  'The Waste Land (annotated)'
);
