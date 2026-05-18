package com.oop.oop_web_proj.controller;

import com.oop.oop_web_proj.entity.Driver;
import com.oop.oop_web_proj.entity.DriverSalary;
import com.oop.oop_web_proj.repo.DriverRepository;
import com.oop.oop_web_proj.repo.DriverSalaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.oop.oop_web_proj.dto.LoginDto;
import com.oop.oop_web_proj.dto.LoginResponseDto;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverSalaryRepository driverSalaryRepository;

    @PostMapping("/add")
    public ResponseEntity<Driver> addDriver(@RequestBody Driver driver) {
        if (driver.getStatus() == null || driver.getStatus().isEmpty()) {
            driver.setStatus("Available");
        }
        Driver saved = driverRepository.save(driver);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginDto loginDto) {
        Optional<Driver> driverOpt = driverRepository.findByEmail(loginDto.getEmail());
        if (driverOpt.isPresent() && driverOpt.get().getPassword() != null && driverOpt.get().getPassword().equals(loginDto.getPassword())) {
            return ResponseEntity.ok(new LoginResponseDto("Login Successful", "Driver"));
        } else {
            return ResponseEntity.badRequest().body(new LoginResponseDto("Invalid email or password", null));
        }
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<Driver> getProfile(@PathVariable String email) {
        Optional<Driver> driverOpt = driverRepository.findByEmail(email);
        if (driverOpt.isPresent()) {
            return ResponseEntity.ok(driverOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverRepository.findAll());
    }

    @GetMapping("/salaries")
    public ResponseEntity<List<DriverSalary>> getAllSalaries() {
        return ResponseEntity.ok(driverSalaryRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(@PathVariable Long id, @RequestBody Driver updatedDriver) {
        return driverRepository.findById(id).map(driver -> {
            driver.setName(updatedDriver.getName());
            driver.setLicenseNumber(updatedDriver.getLicenseNumber());
            driver.setPhoneNumber(updatedDriver.getPhoneNumber());
            driver.setVehicleNumber(updatedDriver.getVehicleNumber());
            driver.setVehicleType(updatedDriver.getVehicleType());
            driver.setStatus(updatedDriver.getStatus());
            if (updatedDriver.getEmail() != null) driver.setEmail(updatedDriver.getEmail());
            if (updatedDriver.getPassword() != null && !updatedDriver.getPassword().isEmpty()) driver.setPassword(updatedDriver.getPassword());
            Driver saved = driverRepository.save(driver);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        if (driverRepository.existsById(id)) {
            driverRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
