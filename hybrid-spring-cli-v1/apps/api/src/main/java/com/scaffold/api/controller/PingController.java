package com.scaffold.api.controller;

import com.scaffold.api.common.ApiResponse;
import com.scaffold.api.common.TraceIdHolder;
import com.scaffold.api.service.PingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PingController {
    private final PingService pingService;

    public PingController(PingService pingService) {
        this.pingService = pingService;
    }

    @GetMapping("/api/v1/ping")
    public ApiResponse<Map<String, String>> ping() {
        return ApiResponse.success(Map.of("message", pingService.ping()), TraceIdHolder.get());
    }
}
