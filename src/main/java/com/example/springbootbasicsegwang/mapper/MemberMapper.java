package com.example.springbootbasicsegwang.mapper;

import com.example.springbootbasicsegwang.model.Member;
import org.apache.ibatis.annotations.Mapper;



@Mapper
public interface MemberMapper {
    void signUp(Member member);
    Member findByUserId(String userId);
}
