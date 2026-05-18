package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BikeRepository extends JpaRepository<Bike, Long> {
    List<Bike> findByModelContainingIgnoreCase(String model);
}
