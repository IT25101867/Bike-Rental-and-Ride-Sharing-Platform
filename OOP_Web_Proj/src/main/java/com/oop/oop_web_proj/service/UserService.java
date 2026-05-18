package com.oop.oop_web_proj.service;

import com.oop.oop_web_proj.dto.LoginDto;
import com.oop.oop_web_proj.dto.LoginResponseDto;
import com.oop.oop_web_proj.dto.UserDTO;
import com.oop.oop_web_proj.entity.User;
import com.oop.oop_web_proj.repo.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    public String registerUser(UserDTO userDto) {
        if(userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            return "Email is already registered.";
        }
        User user = modelMapper.map(userDto, User.class);
        if ("admin@nextride.com".equalsIgnoreCase(user.getEmail())) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }
        userRepository.save(user);
        return "User Registration Successful";
    }

    public LoginResponseDto loginUser(LoginDto loginDto) {
        Optional<User> userOpt = userRepository.findByEmail(loginDto.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && user.getPassword().equals(loginDto.getPassword())) {
                return new LoginResponseDto("Login Successful", user.getRole());
            } else {
                return new LoginResponseDto("Incorrect Password", null);
            }
        }
        return new LoginResponseDto("User not found", null);
    }

    public UserDTO getUserProfile(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return modelMapper.map(userOpt.get(), UserDTO.class);
        }
        return null;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public UserDTO getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            return modelMapper.map(userOpt.get(), UserDTO.class);
        }
        return null;
    }

    public UserDTO updateUser(Long id, UserDTO userDto) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            if (userDto.getEmail() != null) existingUser.setEmail(userDto.getEmail());
            if (userDto.getPhone() != null) existingUser.setPhone(userDto.getPhone());
            if (userDto.getAddress() != null) existingUser.setAddress(userDto.getAddress());
            if (userDto.getNicNum() != null) existingUser.setNicNum(userDto.getNicNum());
            if (userDto.getLicenseNum() != null) existingUser.setLicenseNum(userDto.getLicenseNum());
            
            User updatedUser = userRepository.save(existingUser);
            return modelMapper.map(updatedUser, UserDTO.class);
        }
        return null;
    }

    public List<UserDTO> searchUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name).stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }
}
