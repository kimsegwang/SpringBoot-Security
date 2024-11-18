# Security

## 권한에 따른 페이지 접근

### ROLE_USER
- **기본 권한**  
  - 회원 가입 시 모든 회원은 기본적으로 `ROLE_USER` 권한을 부여받습니다.
- **페이지 접근**  
  - `admin 페이지`: **접근 불가** (`access-denied` 페이지로 이동)  
  - `main 페이지`: **접근 가능**

---

### ROLE_ADMIN
- **관리자 권한 부여**  
  - `ROLE_ADMIN`은 **DB에서 별도로 권한을 추가**해야 합니다.
- **페이지 접근**  
  - `admin 페이지`: **접근 가능**  
  - `main 페이지`: **접근 가능**

---

### 비로그인 유저
- **페이지 접근**  
  - `admin 페이지`: **접근 불가**  
  - `main 페이지`: **접근 불가**
- **접근 시 동작**  
  - 로그인 페이지(`login 페이지`)로 자동 리다이렉트됩니다.

---

## 로그인 처리


 
 ### 토큰 생성
사용자에게 받은 정보로 Access Token과 Refresh Token을 생성합니다

- `makeToken` 메서드
  - Jwt claim에 회원들의 정보를 담습니다.

        private String makeToken(Member member, Date expire) {

        Date now = new Date();

        return Jwts.builder()
                .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(now)
                .setExpiration(expire)
                .setSubject(member.getUserId())
                .claim("id", member.getId())
                .claim("role", member.getRole())
                .claim("userName", member.getUserName())
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                .compact();} 

- `generateToken` 메서드
  - member와 expiredAt (토큰 만료 기간)을 매개변수로 받아서 현재 시간을 기준으로 만료 시간을 계산합니다.
  - makeToken 메서드를 호출하여 JWT 토큰을 생성합니다.
 
        public String generateToken(Member member, Duration expiredAt) {
        Date now = new Date();
        return makeToken(
                member,
                new Date(now.getTime() + expiredAt.toMillis())
        );}


- TokenService
  - 토큰 만료 기간을 설정한다

        // Access Token
        String newAccessToken = tokenProvider.generateToken(member, Duration.ofHours(2));

        // Refresh Token
        String newRefreshToken = tokenProvider.generateToken(member, Duration.ofDays(2));



- `getRefreshTokenFromCookies` 메서드
  -  쿠키 배열(Cookie[])에서 **"refreshToken"**이라는 이름의 쿠키를 찾아 해당 값을 반환하는 역할을 합니다.
 

         private String getRefreshTokenFromCookies(Cookie[] cookies) {

         if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    return cookie.getValue();
                }
            }
         }

         return null;
         }

---

### 토큰 검증
  - 클라이언트에서 받은 토큰이 유효한지 확인하고, 그 결과를 정수값으로 반환합니다.


        public int validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            log.info("Token validated");
            return 1;
        } catch (ExpiredJwtException e) {
            // 토큰이 만료된 경우
            log.info("Token is expired");
            return 2;
        } catch (Exception e) {
            // 복호화 과정에서 에러 발생
            log.info("Token is not valid");
            return 3;
        }
        }

 - 즉 토큰이 정상적으로 유효한 경우 1, 기간이 만료된 토큰이면 2, 유효하지 않은 경우 3을 반환합니다.

---

### 컨트롤러 제어
  - `hasRole('ROLE_ADMIN')`은 ROLE_ADMIN 권한을 가진 사용자만 이 메서드에 접근할 수 있도록 제한합니다.
  - ROLE_ADMIN 외의 권한 사용자는 접근할 수 없습니다.

        @RestController
        @RequiredArgsConstructor
        @RequestMapping("/api/admin")
        public class AdminApiController {

        @GetMapping
        @PreAuthorize("hasRole('ROLE_ADMIN')")
        public ResponseEntity<String> getAdmin() {
        return ResponseEntity.ok("admin");
        } }

---

### WebSecurityConfig AccessDeniedHandler Bean
  - 사용자가 권한이 없는 리소스에 접근하려고 할 때 호출
  - 응답 상태 코드를 403 FORBIDDEN으로 설정

        @Bean
        public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
        };
        }

---

### WebSecurityConfig AuthenticationEntryPoint Bean
  - 인증되지 않은 사용자가 보호된 리소스에 접근하려고 할 때 호출.
  - 응답 상태 코드를 401 UNAUTHORIZED로 설정.

            @Bean
        public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
        };
        }

---

### admin이 ADMIN 페이지 접속 시
  - admin은 admin 페이지, main 페이지 모두 접속 가능
![admin-admin](https://github.com/user-attachments/assets/d78ad6b1-25b7-449b-98ee-f9c6b7729ba5)

### user가 ADMIN 페이지 접속 시
  - user는 admin 페이지 접속 불가
![user-admin](https://github.com/user-attachments/assets/7a37c7ae-9037-4cc6-ad35-21a4787a4ba8)

### user가 MAIN 페이지 접속 시
  - user는 MAIN 페이지 접속 가능
![user-user](https://github.com/user-attachments/assets/cf5d770b-fba2-410d-a1a2-182e464f50d4)

### 비회원이 페이지 접속 시
  - 로그인 페이지로 자동 리다이렉트
![스크린샷 2024-11-18 221914](https://github.com/user-attachments/assets/dd4c5c6a-afb1-4397-aac0-27f7255d16b7)
