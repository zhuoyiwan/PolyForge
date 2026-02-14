package handler

func traceIDString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
