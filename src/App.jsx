import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;
//const API_URL = "http://localhost:3000";
//const API_URL = "http://3.109.55.130:3000";
const emptyForm = {
  name: "",
  email: "",
};

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  console.log("API_URL:", API_URL);

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || `Request failed: ${response.status}`
      );
    }

    return data;
  }

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await request("/api/users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEdit(user) {
    setEditingId(user._id);

    setForm({
      name: user.name,
      email: user.email,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await request(`/api/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await request("/api/users", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user) {
    const confirmed = window.confirm(
      `Delete ${user.name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await request(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">AWS CLOUD APPLICATION</p>
          <h1>User Management</h1>
          <p className="subtitle">
            React · Express · MongoDB Atlas
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadUsers}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <section className="panel">
        <h2>{editingId ? "Edit user" : "Create user"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </label>
          </div>

          <div className="actions">
            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update user"
                  : "Create user"}
            </button>

            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-header">
          <h2>Users</h2>
          <span className="count">{users.length} records</span>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found. Create your first user.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-button"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;