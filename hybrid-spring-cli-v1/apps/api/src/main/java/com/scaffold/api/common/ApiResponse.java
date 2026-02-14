package com.scaffold.api.common;

import java.time.Instant;

public record ApiResponse<T>(
        int code,
        String message,
        T data,
        String traceId,
        String timestamp
) {
    public static <T> ApiResponse<T> success(T data, String traceId) {
        return new ApiResponse<>(0, "success", data, traceId, Instant.now().toString());
    }

    public static <T> ApiResponse<T> error(int code, String message, String traceId) {
        return new ApiResponse<>(code, message, null, traceId, Instant.now().toString());
    }
}
