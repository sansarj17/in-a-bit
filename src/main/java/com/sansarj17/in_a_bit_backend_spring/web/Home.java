package com.sansarj17.in_a_bit_backend_spring.web;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class Home {
    @GetMapping("/")
    public String getInfo() {
        return "Hello from SansarJ17. This is a test app.";
    }

}
