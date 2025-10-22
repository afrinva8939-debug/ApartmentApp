package com.example.apartmentapp.controller;

import com.example.apartmentapp.dto.ApartmentDto;
import com.example.apartmentapp.model.Apartment;
import com.example.apartmentapp.repository.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.util.function.Function;

@RestController
@RequestMapping("/api/apartments")
@CrossOrigin(origins = "*")
public class ApartmentController {

    @Autowired
    private ApartmentRepository repo;

    private final Function<Apartment, ApartmentDto> toDto = a -> new ApartmentDto(
            a.getId(),
            a.getApartmentName(),
            a.getAddress(),
            a.getMinRent(),
            a.getMaxRent(),
            a.getBed(),
            a.getBath(),
            a.getSqft(),
            a.getFloorplan(),
            a.getAvailableDateFormatted(),
            a.getState()
    );

    @GetMapping
    public Page<ApartmentDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "agg_datetime") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "") String q
    ) {
        Sort.Direction dir = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort;
        // protect against a wrong sortBy - default to agg_datetime
        try {
            sort = Sort.by(dir, sortBy);
        } catch (Exception ex) {
            sort = Sort.by(Sort.Direction.DESC, "agg_datetime");
        }
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<Apartment> result;
        if (q == null || q.isBlank()) {
            result = repo.findAll(pageable);
        } else {
            result = repo.findByApartmentNameContainingIgnoreCaseOrAddressContainingIgnoreCase(q, q, pageable);
        }

        return result.map(toDto);
    }

    @GetMapping("/{id}")
    public ApartmentDto getById(@PathVariable Long id) {
        Apartment a = repo.findById(id).orElseThrow(() -> new RuntimeException("Apartment not found: " + id));
        return toDto.apply(a);
    }
}
