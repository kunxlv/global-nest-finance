-- Fix search_path security issue for calculate_next_due_date function
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_current_date DATE,
  p_frequency recurrence_frequency,
  p_day_of_month INTEGER DEFAULT NULL,
  p_day_of_week INTEGER DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_date DATE;
BEGIN
  CASE p_frequency
    WHEN 'DAILY' THEN
      v_next_date := p_current_date + INTERVAL '1 day';
    
    WHEN 'WEEKLY' THEN
      v_next_date := p_current_date + (
        (7 + COALESCE(p_day_of_week, 1) - EXTRACT(DOW FROM p_current_date)::INTEGER) % 7
      ) * INTERVAL '1 day';
      IF v_next_date = p_current_date THEN
        v_next_date := v_next_date + INTERVAL '7 days';
      END IF;
    
    WHEN 'BIWEEKLY' THEN
      v_next_date := p_current_date + INTERVAL '14 days';
    
    WHEN 'MONTHLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '1 month';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
      
      IF EXTRACT(MONTH FROM v_next_date) != EXTRACT(MONTH FROM (DATE_TRUNC('month', p_current_date) + INTERVAL '1 month')) THEN
        v_next_date := DATE_TRUNC('month', DATE_TRUNC('month', p_current_date) + INTERVAL '1 month') + INTERVAL '1 month' - INTERVAL '1 day';
      END IF;
    
    WHEN 'QUARTERLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '3 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    WHEN 'HALF_YEARLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '6 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    WHEN 'YEARLY' THEN
      v_next_date := DATE_TRUNC('month', p_current_date) + INTERVAL '12 months';
      v_next_date := v_next_date + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
    
    ELSE
      v_next_date := p_current_date + INTERVAL '1 month';
  END CASE;
  
  RETURN v_next_date;
END;
$$;