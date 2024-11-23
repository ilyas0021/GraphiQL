package com.example.banque_service.repository;

import com.example.banque_service.entities.Compte;
import com.example.banque_service.entities.TypeCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompteRepository extends JpaRepository<Compte, Long> {


    @Query("SELECT SUM(c.solde) FROM Compte c")
    double sumSoldes();


    List<Compte> findByType(TypeCompte type);
}
