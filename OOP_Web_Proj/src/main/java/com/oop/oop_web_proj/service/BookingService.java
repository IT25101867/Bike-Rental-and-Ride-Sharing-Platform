package com.oop.oop_web_proj.service;

import com.oop.oop_web_proj.dto.BikeRentalDto;
import com.oop.oop_web_proj.dto.RideBookingDto;
import com.oop.oop_web_proj.dto.UserHistoryDto;
import com.oop.oop_web_proj.entity.BikeRental;
import com.oop.oop_web_proj.entity.RideBooking;
import com.oop.oop_web_proj.repo.BikeRentalRepository;
import com.oop.oop_web_proj.repo.RideBookingRepository;
import com.oop.oop_web_proj.repo.BikeRepository;
import com.oop.oop_web_proj.repo.UserRepository;
import com.oop.oop_web_proj.entity.Payment;
import com.oop.oop_web_proj.repo.PaymentRepository;
import com.oop.oop_web_proj.entity.DriverSalary;
import com.oop.oop_web_proj.repo.DriverSalaryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BikeRentalRepository bikeRentalRepository;

    @Autowired
    private RideBookingRepository rideBookingRepository;

    @Autowired
    private BikeRepository bikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DriverSalaryRepository driverSalaryRepository;

    @Autowired
    private ModelMapper modelMapper;

    public BikeRentalDto rentBike(BikeRentalDto rentalDto) {
        BikeRental rental = modelMapper.map(rentalDto, BikeRental.class);
        if (rental.getRentalDate() == null) {
            rental.setRentalDate(LocalDate.now());
        }
        rental.setStatus("Active");
        BikeRental saved = bikeRentalRepository.save(rental);
        
        // Update the actual Bike's status to "Rented"
        if (rental.getBikeId() != null) {
            try {
                Long bId = Long.parseLong(rental.getBikeId());
                bikeRepository.findById(bId).ifPresent(bike -> {
                    bike.setStatus("Rented");
                    bikeRepository.save(bike);
                    
                    if (saved.getBikeModel() == null || saved.getBikeModel().isEmpty()) {
                        saved.setBikeModel(bike.getModel());
                        bikeRentalRepository.save(saved);
                    }

                    // Auto-generate Payment
                    if (rentalDto.getDays() != null && rentalDto.getDays() > 0 && bike.getPrice() != null) {
                        Payment payment = new Payment();
                        payment.setRentalId(saved.getId());
                        payment.setUserEmail(saved.getUserEmail());
                        payment.setAmount(bike.getPrice() * rentalDto.getDays());
                        payment.setStatus("Pending");
                        paymentRepository.save(payment);
                    }
                });
            } catch (NumberFormatException ignored) {
            }
        }
        
        return modelMapper.map(saved, BikeRentalDto.class);
    }

    public boolean deleteRental(Long id) {
        if (bikeRentalRepository.existsById(id)) {
            bikeRentalRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public BikeRentalDto updateRental(Long id, BikeRentalDto rentalDto) {
        Optional<BikeRental> rentalOpt = bikeRentalRepository.findById(id);
        if (rentalOpt.isPresent()) {
            BikeRental existing = rentalOpt.get();
            if (rentalDto.getUserEmail() != null) existing.setUserEmail(rentalDto.getUserEmail());
            if (rentalDto.getBikeId() != null) {
                existing.setBikeId(rentalDto.getBikeId());
                try {
                    Long bId = Long.parseLong(rentalDto.getBikeId());
                    bikeRepository.findById(bId).ifPresent(bike -> {
                        existing.setBikeModel(bike.getModel());
                    });
                } catch (NumberFormatException ignored) {}
            } else if (rentalDto.getBikeModel() != null) {
                existing.setBikeModel(rentalDto.getBikeModel());
            }
            if (rentalDto.getStatus() != null) existing.setStatus(rentalDto.getStatus());
            BikeRental saved = bikeRentalRepository.save(existing);
            return modelMapper.map(saved, BikeRentalDto.class);
        }
        return null;
    }

    public RideBookingDto bookRide(RideBookingDto rideDto) {
        RideBooking ride = modelMapper.map(rideDto, RideBooking.class);
        if (ride.getRideDate() == null) {
            ride.setRideDate(LocalDate.now());
        }
        ride.setStatus("Pending");
        RideBooking saved = rideBookingRepository.save(ride);
        return modelMapper.map(saved, RideBookingDto.class);
    }

    public List<RideBookingDto> getAllRides() {
        return rideBookingRepository.findAll().stream()
                .map(r -> modelMapper.map(r, RideBookingDto.class))
                .collect(Collectors.toList());
    }

    public RideBookingDto acceptRide(Long id, String driverName) {
        Optional<RideBooking> opt = rideBookingRepository.findById(id);
        if (opt.isPresent()) {
            RideBooking ride = opt.get();
            ride.setDriverName(driverName);
            ride.setStatus("Assigned");
            return modelMapper.map(rideBookingRepository.save(ride), RideBookingDto.class);
        }
        return null;
    }

    public RideBookingDto startRide(Long id) {
        Optional<RideBooking> opt = rideBookingRepository.findById(id);
        if (opt.isPresent()) {
            RideBooking ride = opt.get();
            ride.setStatus("Accepted");
            return modelMapper.map(rideBookingRepository.save(ride), RideBookingDto.class);
        }
        return null;
    }

    public RideBookingDto declineRide(Long id) {
        Optional<RideBooking> opt = rideBookingRepository.findById(id);
        if (opt.isPresent()) {
            RideBooking ride = opt.get();
            ride.setStatus("Pending");
            ride.setDriverName(null);
            return modelMapper.map(rideBookingRepository.save(ride), RideBookingDto.class);
        }
        return null;
    }

    public List<RideBookingDto> getDriverRides(String driverName) {
        return rideBookingRepository.findByDriverName(driverName).stream()
                .map(r -> {
                    RideBookingDto dto = modelMapper.map(r, RideBookingDto.class);
                    if ("Completed".equals(r.getStatus())) {
                        driverSalaryRepository.findByRideId(r.getId()).ifPresent(salary -> {
                            dto.setAmount(salary.getAmount());
                        });
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public RideBookingDto completeRide(Long id) {
        Optional<RideBooking> opt = rideBookingRepository.findById(id);
        if (opt.isPresent()) {
            RideBooking ride = opt.get();
            ride.setStatus("Completed");
            RideBooking saved = rideBookingRepository.save(ride);
            
            if (ride.getDriverName() != null && !ride.getDriverName().isEmpty()) {
                DriverSalary salary = new DriverSalary();
                salary.setDriverName(ride.getDriverName());
                salary.setRideId(saved.getId());
                
                java.util.Random rand = new java.util.Random();
                double distance = 5 + (25 * rand.nextDouble());
                distance = Math.round(distance * 10.0) / 10.0;
                
                salary.setDistance(distance);
                salary.setAmount(distance * 100); 
                salary.setDate(LocalDate.now());
                
                driverSalaryRepository.save(salary);
            }
            
            return modelMapper.map(saved, RideBookingDto.class);
        }
        return null;
    }

    public UserHistoryDto getUserHistory(String email) {
        List<BikeRental> rentals = bikeRentalRepository.findByUserEmail(email);
        List<RideBooking> rides = rideBookingRepository.findByUserEmail(email);

        List<BikeRentalDto> rentalDtos = rentals.stream()
                .map(r -> modelMapper.map(r, BikeRentalDto.class))
                .collect(Collectors.toList());

        List<RideBookingDto> rideDtos = rides.stream()
                .map(r -> modelMapper.map(r, RideBookingDto.class))
                .collect(Collectors.toList());

        return new UserHistoryDto(rentalDtos, rideDtos);
    }

    public List<BikeRentalDto> getAllRentals() {
        List<BikeRental> rentals = bikeRentalRepository.findAll();
        return rentals.stream()
                .map(r -> {
                    BikeRentalDto dto = modelMapper.map(r, BikeRentalDto.class);
                    userRepository.findByEmail(r.getUserEmail()).ifPresent(u -> {
                        dto.setUserName(u.getName());
                    });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public BikeRentalDto scheduleHandover(Long rentalId, LocalDateTime returnTime) {
        Optional<BikeRental> rentalOpt = bikeRentalRepository.findById(rentalId);
        if (rentalOpt.isPresent()) {
            BikeRental rental = rentalOpt.get();
            rental.setReturnTime(returnTime);
            BikeRental saved = bikeRentalRepository.save(rental);
            return modelMapper.map(saved, BikeRentalDto.class);
        }
        return null;
    }

    public BikeRentalDto completeHandover(Long rentalId) {
        Optional<BikeRental> rentalOpt = bikeRentalRepository.findById(rentalId);
        if (rentalOpt.isPresent()) {
            BikeRental rental = rentalOpt.get();
            rental.setStatus("Completed");
            BikeRental saved = bikeRentalRepository.save(rental);

            // Update the actual Bike's status back to "Available"
            if (rental.getBikeId() != null) {
                try {
                    Long bId = Long.parseLong(rental.getBikeId());
                    bikeRepository.findById(bId).ifPresent(bike -> {
                        bike.setStatus("Available");
                        bikeRepository.save(bike);
                    });
                } catch (NumberFormatException ignored) {}
            }

            return modelMapper.map(saved, BikeRentalDto.class);
        }
        return null;
    }
}
