package com.oop.oop_web_proj.entity;

import jakarta.persistence.*;

@Entity(name = "Driver")
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String licenseNumber;
    private String status;

    public Driver() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
