package com.oop.oop_web_proj.service;

import com.oop.oop_web_proj.dto.BikeDTO;
import com.oop.oop_web_proj.entity.Bike;
import com.oop.oop_web_proj.repo.BikeRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BikeService {

    @Autowired
    private BikeRepository bikeRepository;

    @Autowired
    private ModelMapper modelMapper;

    public String addBike(BikeDTO bikeDto) {
        Bike bike = modelMapper.map(bikeDto, Bike.class);
        bikeRepository.save(bike);
        return "Bike Added Successfully";
    }

    public List<BikeDTO> getAllBikes() {
        return bikeRepository.findAll().stream()
                .map(bike -> modelMapper.map(bike, BikeDTO.class))
                .collect(Collectors.toList());
    }

    public BikeDTO getBikeById(Long id) {
        Optional<Bike> bikeOpt = bikeRepository.findById(id);
        if (bikeOpt.isPresent()) {
            return modelMapper.map(bikeOpt.get(), BikeDTO.class);
        }
        return null;
    }

    public boolean deleteBike(Long id) {
        if (bikeRepository.existsById(id)) {
            bikeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public BikeDTO updateBike(Long id, BikeDTO updatedDto) {
        Optional<Bike> bikeOpt = bikeRepository.findById(id);
        if (bikeOpt.isPresent()) {
            Bike existingBike = bikeOpt.get();
            existingBike.setBrand(updatedDto.getBrand());
            existingBike.setModel(updatedDto.getModel());
            existingBike.setColor(updatedDto.getColor());
            existingBike.setEngineCapacity(updatedDto.getEngineCapacity());
            existingBike.setRegistrationNumber(updatedDto.getRegistrationNumber());
            existingBike.setYear(updatedDto.getYear());
            existingBike.setStatus(updatedDto.getStatus());
            existingBike.setPrice(updatedDto.getPrice());
            
            Bike savedBike = bikeRepository.save(existingBike);
            return modelMapper.map(savedBike, BikeDTO.class);
        }
        return null;
    }

    public List<BikeDTO> searchBikes(String query) {
        List<Bike> results;
        try {
            Long id = Long.parseLong(query);
            Optional<Bike> bikeOpt = bikeRepository.findById(id);
            if (bikeOpt.isPresent()) {
                results = List.of(bikeOpt.get());
            } else {
                results = bikeRepository.findByModelContainingIgnoreCase(query);
            }
        } catch (NumberFormatException e) {
            results = bikeRepository.findByModelContainingIgnoreCase(query);
        }
        
        return results.stream()
                .map(bike -> modelMapper.map(bike, BikeDTO.class))
                .collect(Collectors.toList());
    }
}
