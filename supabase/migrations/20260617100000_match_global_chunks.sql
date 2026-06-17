-- ─────────────────────────────────────────────
-- RPC: match_global_chunks
-- Performs global vector similarity search across all government forms
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.match_global_chunks(
  query_embedding  vector(1024),
  match_threshold  float DEFAULT 0.30,
  match_count      int   DEFAULT 5
)
RETURNS TABLE (
  id            uuid,
  form_id       uuid,
  chunk_title   text,
  chunk_content text,
  chunk_type    text,
  similarity    float
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.form_id,
    c.chunk_title,
    c.chunk_content,
    c.chunk_type,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.form_chunks c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
