package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {//Interface Declaration
    Optional<User> findByEmail(String email);//Custom method to find a user by using email
    List<User> findByNameContainingIgnoreCase(String name);//Custom method to find a users by name
}
