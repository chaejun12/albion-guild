-- Supabase에서 이 SQL을 실행하세요 (SQL Editor 탭)
-- Albion Comp Sheet - sheets 테이블

CREATE TABLE IF NOT EXISTS public.sheets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_public   boolean NOT NULL DEFAULT true,
  parties     jsonb NOT NULL DEFAULT '[]',
  owner_id    text NOT NULL,  -- Discord user ID (snowflake)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화 (읽기는 공개, 쓰기는 service role에서만)
ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;

-- 공개 시트는 누구나 읽기 가능
CREATE POLICY "public sheets readable"
  ON public.sheets FOR SELECT
  USING (is_public = true);

-- 쓰기는 service role key만 허용 (Next.js API 라우트에서 사용)
-- (service role은 RLS를 우회하므로 별도 정책 불필요)

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sheets_updated_at
  BEFORE UPDATE ON public.sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
