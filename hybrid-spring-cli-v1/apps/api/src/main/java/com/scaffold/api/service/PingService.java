package com.scaffold.api.service;

import com.scaffold.api.repository.PingRepository;
import org.springframework.stereotype.Service;

@Service
public class PingService {
    private final PingRepository pingRepository;

    public PingService(PingRepository pingRepository) {
        this.pingRepository = pingRepository;
    }

    public String ping() {
        return pingRepository.message();
    }
}
