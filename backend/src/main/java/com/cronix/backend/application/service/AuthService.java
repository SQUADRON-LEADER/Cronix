package com.cronix.backend.application.service;

import com.cronix.backend.domain.model.User;
import com.cronix.backend.infrastructure.persistence.entity.UserEntity;
import com.cronix.backend.infrastructure.persistence.repository.UserRepository;
import com.cronix.backend.infrastructure.security.JwtTokenProvider;
import com.cronix.backend.presentation.exception.BadRequestException;
import com.cronix.backend.presentation.exception.UnauthorizedException;
import com.cronix.backend.presentation.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public User register(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already in use");
        }

        UserEntity userEntity = UserEntity.builder()
                .email(email)
                .name(name)
                .passwordHash(passwordEncoder.encode(password))
                .role("member") // Default role
                .build();

        UserEntity saved = userRepository.save(userEntity);
        return userMapper.toDomain(saved);
    }

    public String login(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return jwtTokenProvider.generateToken(user.getEmail(), user.getRole());
    }

    public User getUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return userMapper.toDomain(user);
    }
}
