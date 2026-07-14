package com.sansarj17.inabit.web;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class Home {
    @GetMapping("/")
    public String getInfo() {
        return "Hello from SansarJ17. This is a test app.";
    }

}
