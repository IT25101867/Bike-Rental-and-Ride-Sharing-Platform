package com.oop.oop_web_proj.service;

import com.oop.oop_web_proj.dto.PaymentDto;
import com.oop.oop_web_proj.entity.Payment;
import com.oop.oop_web_proj.repo.PaymentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.oop.oop_web_proj.repo.UserRepository;
import com.oop.oop_web_proj.entity.User;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(p -> {
                    PaymentDto dto = modelMapper.map(p, PaymentDto.class);
                    if (p.getUserEmail() != null) {
                        Optional<User> optUser = userRepository.findByEmail(p.getUserEmail());
                        if (optUser.isPresent()) {
                            dto.setUserId(optUser.get().getId());
                            dto.setUserName(optUser.get().getName());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public PaymentDto updateStatus(Long id, String status) {
        Optional<Payment> opt = paymentRepository.findById(id);
        if (opt.isPresent()) {
            Payment payment = opt.get();
            payment.setStatus(status);
            Payment saved = paymentRepository.save(payment);
            return modelMapper.map(saved, PaymentDto.class);
        }
        return null;
    }

    public PaymentDto getPaymentById(Long id) {
        Optional<Payment> opt = paymentRepository.findById(id);
        if (opt.isPresent()) {
            Payment p = opt.get();
            PaymentDto dto = modelMapper.map(p, PaymentDto.class);
            if (p.getUserEmail() != null) {
                Optional<User> optUser = userRepository.findByEmail(p.getUserEmail());
                if (optUser.isPresent()) {
                    dto.setUserId(optUser.get().getId());
                    dto.setUserName(optUser.get().getName());
                }
            }
            return dto;
        }
        return null;
    }

    public PaymentDto createPayment(PaymentDto dto) {
        Payment payment = new Payment();
        payment.setRentalId(dto.getRentalId());
        payment.setUserEmail(dto.getUserEmail());
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus() != null ? dto.getStatus() : "Pending");
        
        Payment saved = paymentRepository.save(payment);
        return getPaymentById(saved.getId());
    }

    public PaymentDto updatePayment(Long id, PaymentDto dto) {
        Optional<Payment> opt = paymentRepository.findById(id);
        if (opt.isPresent()) {
            Payment payment = opt.get();
            if (dto.getRentalId() != null) payment.setRentalId(dto.getRentalId());
            if (dto.getUserEmail() != null) payment.setUserEmail(dto.getUserEmail());
            if (dto.getAmount() != null) payment.setAmount(dto.getAmount());
            if (dto.getStatus() != null) payment.setStatus(dto.getStatus());
            
            Payment saved = paymentRepository.save(payment);
            return getPaymentById(saved.getId());
        }
        return null;
    }

    public boolean deletePayment(Long id) {
        if (paymentRepository.existsById(id)) {
            paymentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
