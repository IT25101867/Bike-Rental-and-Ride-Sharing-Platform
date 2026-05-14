package com.oop.oop_web_proj.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phone;
    
    private String password;

    private String address;
    
    private String nicNum;
    
    private String licenseNum;
    
    private String role;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getNicNum() { return nicNum; }
    public void setNicNum(String nicNum) { this.nicNum = nicNum; }
    public String getLicenseNum() { return licenseNum; }
    public void setLicenseNum(String licenseNum) { this.licenseNum = licenseNum; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
