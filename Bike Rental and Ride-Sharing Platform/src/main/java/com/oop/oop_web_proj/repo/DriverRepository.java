package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {


}
