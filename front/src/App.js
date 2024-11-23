import './App.css';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

// GraphQL Queries and Mutations
const GET_ALL_COMPTES = gql`
  query {
    allComptes {
      id
      solde
      dateCreation
      type
    }
  }
`;

const ADD_COMPTE = gql`
  mutation SaveCompte($solde: Float!, $dateCreation: String!, $type: TypeCompte!) {
    saveCompte(compte: { solde: $solde, dateCreation: $dateCreation, type: $type }) {
      id
      solde
      dateCreation
      type
    }
  }
`;

const ADD_TRANSACTION = gql`
  mutation AddTransaction($compteId: ID!, $montant: Float!, $type: TypeTransaction!) {
    addTransaction(transactionRequest: { compteId: $compteId, montant: $montant, type: $type }) {
      id
      montant
      date
      type
    }
  }
`;

function App() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_COMPTES);
  const [addCompte] = useMutation(ADD_COMPTE);
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  const [formData, setFormData] = useState({
    solde: '',
    dateCreation: '',
    type: 'COURANT',
  });

  const [transactionFormData, setTransactionFormData] = useState({
    montant: '',
    type: 'DEPOT',
    compteId: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData({ ...transactionFormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedDate = formData.dateCreation.replace(/-/g, '/');
    try {
      await addCompte({
        variables: {
          solde: parseFloat(formData.solde),
          dateCreation: formattedDate,
          type: formData.type,
        },
      });
      refetch();
      setFormData({ solde: '', dateCreation: '', type: 'COURANT' });
    } catch (error) {
      console.error('Erreur lors de l’ajout du compte :', error);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction({
        variables: {
          compteId: transactionFormData.compteId,
          montant: parseFloat(transactionFormData.montant),
          type: transactionFormData.type,
        },
      });
      refetch();
      setTransactionFormData({ montant: '', type: 'DEPOT', compteId: '' });
    } catch (error) {
      console.error('Erreur lors de l’ajout de la transaction :', error);
    }
  };

  if (loading) return <div className="loader">Chargement des données...</div>;
  if (error) return <div className="error">Erreur : {error.message}</div>;

  // Helper function to format currency
  const formatCurrency = (value) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(value);

  return (
    <div className="App">
      <header className="header">
        <h1>Banking Dashboard</h1>
      </header>

      <main className="main-content">
        {/* Formulaires */}
        <section className="forms-container">
          <div className="form-box">
            <h2>Créer un Compte</h2>
            <form onSubmit={handleSubmit}>
              <label>Solde</label>
              <input
                type="number"
                name="solde"
                placeholder="Entrez le solde"
                value={formData.solde}
                onChange={handleInputChange}
                required
              />
              <label>Date de création</label>
              <input
                type="date"
                name="dateCreation"
                value={formData.dateCreation}
                onChange={handleInputChange}
                required
              />
              <label>Type de compte</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="COURANT">Courant</option>
                <option value="EPARGNE">Épargne</option>
              </select>
              <button type="submit">Créer</button>
            </form>
          </div>

          <div className="form-box">
            <h2>Ajouter une Transaction</h2>
            <form onSubmit={handleTransactionSubmit}>
              <label>Compte</label>
              <select
                name="compteId"
                value={transactionFormData.compteId}
                onChange={handleTransactionChange}
                required
              >
                <option value="">Sélectionner un compte</option>
                {data.allComptes.map((compte) => (
                  <option key={compte.id} value={compte.id}>
                    Compte {compte.id} - {formatCurrency(compte.solde)}
                  </option>
                ))}
              </select>
              <label>Montant</label>
              <input
                type="number"
                name="montant"
                placeholder="Montant de la transaction"
                value={transactionFormData.montant}
                onChange={handleTransactionChange}
                required
              />
              <label>Type</label>
              <select
                name="type"
                value={transactionFormData.type}
                onChange={handleTransactionChange}
              >
                <option value="DEPOT">Dépôt</option>
                <option value="RETRAIT">Retrait</option>
              </select>
              <button type="submit">Ajouter</button>
            </form>
          </div>
        </section>

        {/* Tableau */}
        <section className="table-container">
          <h2>Liste des Comptes</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Solde</th>
                <th>Date de Création</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.allComptes.map((compte) => (
                <tr key={compte.id}>
                  <td>{compte.id}</td>
                  <td>{formatCurrency(compte.solde)}</td>
                  <td>{compte.dateCreation}</td>
                  <td>{compte.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
