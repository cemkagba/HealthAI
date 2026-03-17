import { useState, useEffect } from 'react';

function PeopleList() {
  const [people, setPeople] = useState([]);

  const fetchPeople = () => {
    fetch('http://localhost:5000/api/people')
      .then(res => res.json())
      .then(data => setPeople(data))
      .catch(err => console.error("Hata:", err));
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      await fetch(`http://localhost:5000/api/people/${id}`, { method: 'DELETE' });
      fetchPeople(); // Sildikten sonra listeyi yenile
    }
  };

  const handleEdit = async (person) => {
    // Basit olması için tarayıcının kendi popup penceresini kullanıyoruz
    const newName = window.prompt("Yeni Ad Soyad:", person.full_name);
    const newEmail = window.prompt("Yeni E-posta:", person.email);
    
    if (newName && newEmail) {
      await fetch(`http://localhost:5000/api/people/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: newName, email: newEmail })
      });
      fetchPeople(); // Güncelledikten sonra listeyi yenile
    }
  };

  return (
    <div>
      <h2>Kişi Listesi</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {people.map(person => (
          <li key={person.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{person.full_name}</strong> - {person.email}</span>
            <div>
              <button onClick={() => handleEdit(person)} style={{ marginRight: '10px', padding: '5px', backgroundColor: '#FFC107', border: 'none', cursor: 'pointer' }}>Düzenle</button>
              <button onClick={() => handleDelete(person.id)} style={{ padding: '5px', backgroundColor: '#F44336', color: 'white', border: 'none', cursor: 'pointer' }}>Sil</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PeopleList;