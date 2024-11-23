package com.example.banque_service.entities;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Compte {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "soldes")
    private double solde;

    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date dateCreation ;

    @Enumerated(EnumType.STRING)
    private TypeCompte type ;

}
