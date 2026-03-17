import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddPerson from './AddPerson';
import PeopleList from './PeopleList';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
        <h1>SENG 384 Ödev</h1>
        
        {/* Üst Menü */}
        <nav style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>Kişi Ekle</Link>
          <Link to="/people" style={{ textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>Kişi Listesi</Link>
        </nav>

        {/* Sayfaların Gösterileceği Yer */}
        <Routes>
          <Route path="/" element={<AddPerson />} />
          <Route path="/people" element={<PeopleList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;