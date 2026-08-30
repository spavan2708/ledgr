from pathlib import Path


def test_profiles_migration_enables_owner_only_rls() -> None:
    sql = (Path(__file__).parents[2] / "supabase/migrations/202608300001_create_profiles.sql").read_text()
    assert "alter table public.profiles enable row level security" in sql
    assert sql.count("(select auth.uid()) = id") >= 4
    assert "service_role" not in sql.lower()
    assert "password" not in sql.lower()

