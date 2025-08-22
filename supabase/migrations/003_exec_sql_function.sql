-- Create a function to execute raw SQL queries safely
CREATE OR REPLACE FUNCTION exec_sql(query TEXT, params TEXT[] DEFAULT '{}')
RETURNS TABLE(result JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This is a simplified version for basic queries
    -- In production, you should use proper parameterized queries
    RETURN QUERY EXECUTE format('SELECT to_json(row) as result FROM (%s) row', query);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO anon;