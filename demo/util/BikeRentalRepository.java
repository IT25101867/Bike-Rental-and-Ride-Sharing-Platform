package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.BikeRental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BikeRentalRepository extends JpaRepository<BikeRental, Long> {
    List<BikeRental> findByUserEmail(String userEmail);
}
