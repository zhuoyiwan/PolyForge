package com.scaffold.api.repository;

import org.springframework.stereotype.Repository;

@Repository
public class PingRepository {
    public String message() {
        return "pong";
    }
}
