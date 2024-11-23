package com.example.banque_service.controller;

import com.example.banque_service.dto.TransactionRequest;
import com.example.banque_service.entities.Compte;
import com.example.banque_service.entities.Transaction;
import com.example.banque_service.entities.TypeCompte;
import com.example.banque_service.entities.TypeTransaction;
import com.example.banque_service.repository.CompteRepository;
import com.example.banque_service.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Controller
@AllArgsConstructor
public class CompteControllerGraphQL {

    private CompteRepository compteRepository;
    private TransactionRepository transactionRepository;

    @QueryMapping
    public List<Compte> allComptes(){
        return  compteRepository.findAll();
    }

    @QueryMapping
    public Compte CompteById(@Argument Long id){
        Compte compte = compteRepository.findById(id).orElse(null);
        if(compte == null) throw new RuntimeException(String.format("Compte %s not found", id));
        else return compte;
    }





    @MutationMapping
    public Compte saveCompte(@Argument Compte compte){
        return compteRepository.save(compte);
    }

    @QueryMapping
    public String deleteCompteById(@Argument Long id) {
        if (!compteRepository.existsById(id)) {
            throw new RuntimeException(String.format("Compte with ID %s not found", id));
        }
        compteRepository.deleteById(id);
        return String.format("Compte with ID %s has been successfully deleted.", id);
    }


    @QueryMapping
    public List<Compte> compteByType(@Argument TypeCompte type) {
        List<Compte> comptes = compteRepository.findByType(type);
        if (comptes.isEmpty()) {
            throw new RuntimeException(String.format("No Compte found for type %s", type));
        }
        return comptes;
    }


    @MutationMapping
    public Transaction addTransaction(@Argument TransactionRequest transactionRequest) {
        Compte compte = compteRepository.findById(transactionRequest.getCompteId())
                .orElseThrow(() -> new RuntimeException("Compte not found"));

        // Mettre à jour le solde du compte en fonction du type de transaction
        if (transactionRequest.getType() == TypeTransaction.DEPOT) {
            compte.setSolde(compte.getSolde() + transactionRequest.getMontant());
        } else if (transactionRequest.getType() == TypeTransaction.RETRAIT) {
            compte.setSolde(compte.getSolde() - transactionRequest.getMontant());
        }

        // Enregistrer le compte avec le solde mis à jour
        compteRepository.save(compte);

        // Créer et enregistrer la transaction
        Transaction transaction = new Transaction();
        transaction.setMontant(transactionRequest.getMontant());

        // Convertir LocalDate en java.sql.Date
        transaction.setDate(Date.valueOf(LocalDate.now()));  // LocalDate -> java.sql.Date
        transaction.setType(transactionRequest.getType());
        transaction.setCompte(compte);

        return transactionRepository.save(transaction);
    }


    @QueryMapping
    public List<Transaction> compteTransactions(@Argument Long id) {
        Compte compte = compteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte not found"));
        return transactionRepository.findByCompte(compte);
    }

    @QueryMapping
    public Map<String, Object> transactionStats() {
        long count = transactionRepository.count();
        Double sumDepots = transactionRepository.sumByType(TypeTransaction.DEPOT);
        Double sumRetraits = transactionRepository.sumByType(TypeTransaction.RETRAIT);

        sumDepots = (sumDepots != null) ? sumDepots : 0.0;
        sumRetraits = (sumRetraits != null) ? sumRetraits : 0.0;

        return Map.of(
                "count", count,
                "sumDepots", sumDepots,
                "sumRetraits", sumRetraits
        );
    }








    @QueryMapping
    public Map<String, Object> totalSolde(){
        long count = compteRepository.count();
        double sum = compteRepository.sumSoldes();
        double average = count > 0 ? sum / count : 0;

        return Map.of(
           "count", count,
           "sum", sum ,
           "average", average
        );
    }








}
