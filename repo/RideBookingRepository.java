package com.oop.oop_web_proj.repo;

import com.oop.oop_web_proj.entity.RideBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideBookingRepository extends JpaRepository<RideBooking, Long> {
    List<RideBooking> findByUserEmail(String userEmail);
}
