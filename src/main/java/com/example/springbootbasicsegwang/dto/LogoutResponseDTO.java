package com.example.springbootbasicsegwang.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogoutResponseDTO {
    String message;
    String url;
}
