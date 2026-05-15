package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.DriverSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverSalaryRepository extends JpaRepository<DriverSalary, Long> {
    List<DriverSalary> findByDriverName(String driverName);
}
