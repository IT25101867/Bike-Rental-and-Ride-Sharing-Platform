package com.oop.oop_web_proj.controller;

import com.oop.oop_web_proj.entity.Driver;
import com.oop.oop_web_proj.entity.DriverSalary;
import com.oop.oop_web_proj.repo.DriverRepository;
import com.oop.oop_web_proj.repo.DriverSalaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/all")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverRepository.findAll());
    }

    @GetMapping("/salaries")
    public ResponseEntity<List<DriverSalary>> getAllSalaries() {
        return ResponseEntity.ok(driverSalaryRepository.findAll());
    }
}
