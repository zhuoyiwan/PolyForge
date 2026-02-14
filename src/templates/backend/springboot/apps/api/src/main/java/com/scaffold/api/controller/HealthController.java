package com.scaffold.api.controller;

import com.scaffold.api.common.ApiResponse;
import com.scaffold.api.common.TraceIdHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(Map.of("status", "ok"), TraceIdHolder.get());
    }
}
