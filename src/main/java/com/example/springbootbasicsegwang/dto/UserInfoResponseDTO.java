package com.example.springbootbasicsegwang.dto;

import com.example.springbootbasicsegwang.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponseDTO {
    private long id;
    private String userId;
    private String userName;
    private Role role;
}
