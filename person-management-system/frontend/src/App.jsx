import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = "http://localhost:5000/api/people";

function App() {
  const [people, setPeople] = useState([]);
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch all people from the database
  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setPeople(res.data);
    } catch (err) {
      setMessage({ text: 'Could not fetch records. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // Client-side validation
  const validate = () => {
    if (!formData.full_name.trim()) return "Full Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setMessage({ text: error, type: 'error' });
      return;
    }

    try {
      if (editingId) {
        // Update existing record
        await axios.put(`${API_URL}/${editingId}`, formData);
        setMessage({ text: 'Person updated successfully!', type: 'success' });
        setShowEditModal(false);
      } else {
        // Create new record
        await axios.post(API_URL, formData);
        setMessage({ text: 'Person added successfully!', type: 'success' });
      }
      setFormData({ full_name: '', email: '' }); // Clear form
      setEditingId(null);
      fetchPeople();
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      setMessage({
        text: errorMsg === 'EMAIL_ALREADY_EXISTS' ? 'This email is already registered.' : 'A server error occurred.',
        type: 'error',
      });
    }
  };

  const handleDelete = (id) => {
    openDeleteModal(id);
  };

  const startEdit = (person) => {
    setEditingId(person.id);
    setFormData({ full_name: person.full_name, email: person.email });
    setMessage({ text: '', type: '' });
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ full_name: '', email: '' });
    setShowEditModal(false);
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteTargetId}`);
      setMessage({ text: 'Person deleted successfully!', type: 'success' });
      fetchPeople();
    } catch (err) {
      setMessage({ text: 'Could not delete record. Please try again.', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Person Management System</h1>
        <p>Manage people records with a clean and modern interface.</p>
      </header>

      {/* Registration Form */}
      <section className="card">
        <div className="card-head">
          <h3>Register New Person</h3>
          <span className="count-badge">{people.length} records</span>
        </div>

        <form className="person-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="text"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Add Person
            </button>
          </div>
        </form>

        {message.text && !showEditModal && !showDeleteModal && (
          <p className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.text}
          </p>
        )}
      </section>

      {/* People List */}
      <section className="card">
        <div className="card-head">
          <h3>Registered People</h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="state-text">Loading...</td>
                </tr>
              ) : people.length > 0 ? (
                people.map((person) => (
                  <tr key={person.id}>
                    <td>{person.full_name}</td>
                    <td>{person.email}</td>
                    <td className="actions-cell">
                      <button onClick={() => startEdit(person)} className="btn btn-edit" type="button">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(person.id)} className="btn btn-delete" type="button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="state-text">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Person</h2>
              <button type="button" className="modal-close" onClick={cancelEdit}>×</button>
            </div>

            <form className="person-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="edit_full_name">Full Name</label>
                <input
                  id="edit_full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label htmlFor="edit_email">Email Address</label>
                <input
                  id="edit_email"
                  type="text"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>

            {message.text && (
              <p className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Person</h2>
              <button type="button" className="modal-close" onClick={cancelDelete}>×</button>
            </div>

            <p className="modal-text">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>

            <div className="form-actions">
              <button type="button" className="btn btn-delete" onClick={confirmDelete}>
                Delete
              </button>
              <button type="button" className="btn btn-ghost" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;