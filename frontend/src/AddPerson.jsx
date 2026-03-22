import { useState } from 'react';

function AddPerson() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email: email })
      });

      if (response.ok) {
        alert('Kişi başarıyla eklendi!');
        setFullName('');
        setEmail('');
      }
    } catch (error) {
      alert('Eklerken bir hata oluştu.');
    }
  };

  return (
    <div>
      <h2>Yeni Kişi Ekle</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input 
          type="text" 
          placeholder="Ad Soyad" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          type="email" 
          placeholder="E-posta" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Kaydet
        </button>
      </form>
    </div>
  );
}

export default AddPerson;