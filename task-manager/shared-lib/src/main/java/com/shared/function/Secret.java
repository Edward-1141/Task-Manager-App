package com.shared.function;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Secret {
    public String getSecret(String secretName) {
        try {
            return new String(Files.readAllBytes(Paths.get("/var/openfaas/secrets/" + secretName)));
        } catch (IOException e) {
            System.err.println("Error reading secret: " + e.getMessage());
            return null;
        }
    }
}
