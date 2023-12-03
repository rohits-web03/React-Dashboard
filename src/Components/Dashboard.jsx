import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Dashboard.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [search,setSearch]=useState('');
  const [keyPressed,setKeyPressed]=useState(false);

  useEffect(() => {
    console.log("Fetching from API");
    axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => {
        console.log(response);
        setUsers(response.data);
      });
  }, []);

  // const handleKeyPress = (event) => {
  //   if (event.key === 'Enter') {
  //       setKeyPressed(true);
  //   }
  // };

  const handleSearch = (user) => {
    if (search.trim().length === 0 || !keyPressed) {
      return true; // Return all users if the search query is empty or Enter is not pressed
    }
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditedFields({});
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedFields({});
  };

  const handleInputChange = (field, value) => {
    setEditedFields({ ...editedFields, [field]: value });
  };

  const handleSave = () => {
    const updatedUsers = users.map(user => {
      if (user.id === editingUser.id) {
        return { ...user, ...editedFields };
      }
      return user;
    });

    setUsers(updatedUsers);
    setEditingUser(null);
    setEditedFields({});
  };

  const handleDelete = (id) => {
    const filteredUsers = users.filter(user => user.id !== id);
    setUsers(filteredUsers);
    setEditingUser(null);
  };

  const selectPageHandler = (selectedPage) => {
    console.log(selectedPage);
    console.log("Length",users.length/10)
    console.log(page);
    if (selectedPage >= 1 && selectedPage <= (users.length / 10 + 1) && selectedPage !== page) {
      console.log("inside");
      setPage(selectedPage)
    }
  }

  return (
    <div className="Dashboard">
    <div className='control-panel'>
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search Here" 
          onChange={(event)=>{
            setSearch(event.target.value);
            setKeyPressed(false);
          }} 
          onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setKeyPressed(true);
          }
        }}/>
      </div> 
      <div className='del'>
        <button className="delete-btn button">
          Delete Selected
        </button>
        <button className="delete-btn button" onClick={() => setUsers([])}>
          Delete All
        </button>
      </div>
    </div>
      <table className="table"> 
        <thead>
          <tr>
            <th className="head-title">Name</th>
            <th className="head-title">Email</th>
            <th className="head-title">Role</th>
            <th className="head-title">Actions</th>
          </tr>
        </thead>
        <tbody>
        {users
  .filter((user) => {
    return handleSearch(user)
  }
        )
  .slice(page * 10 - 10, page * 10).map(user => (
            <tr key={user.id} className="table-row">
            <td><input type='checkbox' /></td>
              <td className="row-item">
                {editingUser === user ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editedFields.name !== undefined ? editedFields.name : user.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="row-item">
                {editingUser === user ? (
                  <input
                    type="email"
                    className="form-control"
                    value={editedFields.email !== undefined ? editedFields.email : user.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="row-item">
                {editingUser === user ? (
                  <select
                    className="form-control"
                    value={editedFields.role !== undefined ? editedFields.role : user.role}
                    onChange={(event) => handleInputChange('role', event.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="row-item action-btn">
                {editingUser === user ? (
                  <>
                    <button className="edit-btn button" onClick={() => handleSave(user)}>
                      Save
                    </button>
                    &nbsp;
                    <button className="delete-btn button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit-btn button" onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                )}
                &nbsp;
                <button className="delete-btn button" onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length > 0 && 
        <div className="pagination">
        <span 
          onClick={() => selectPageHandler(page - 1)} 
          className={page > 1 ? "" : "pagination__disable"}
          >
            ◀
          </span>

      {users.length > 0 &&
        [...Array(Math.ceil(users.filter((user) => {
          return handleSearch(user);
        }).length / 10))].map((_, i) => {
          return (
            <span
              key={i}
              className={page === i + 1 ? "pagination__selected" : ""}
              onClick={() => selectPageHandler(i + 1)}
            >
              {i + 1}
            </span>
          );
        })
      }


        <span 
          onClick={() => selectPageHandler(page + 1)} 
          className={page < users.filter((user) => {
            return handleSearch(user);
          }).length / 10 ? "" : "pagination__disable"}
          >
            ▶
          </span>
      </div>}
    </div>
  );
};

export default Dashboard;