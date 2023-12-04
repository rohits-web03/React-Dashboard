import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Dashboard.css";

const Dashboard = ({theme,changeTheme}) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [search,setSearch]=useState('');
  const [keyPressed,setKeyPressed]=useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    console.log("Fetching from API");
    axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => {
        console.log(response);
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

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

  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    const currentPageUsers = users.slice(page * 10 - 10, page * 10).map(user => user.id);
    const allSelected = currentPageUsers.every(userId => selectedUsers.includes(userId));
  
    if (allSelected) {
      // Deselect all users in the current page
      setSelectedUsers(selectedUsers.filter(userId => !currentPageUsers.includes(userId)));
    } else {
      // Select all users in the current page
      setSelectedUsers([...selectedUsers, ...currentPageUsers]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter((user) => !selectedUsers.includes(user.id));
    setUsers(updatedUsers);
    setSelectedUsers([]);
    if(page===Math.ceil(users.filter((user) => {
      return handleSearch(user);
    }).length / 10)){
      setPage(page-1);
    }
  };

  const selectPageHandler = (selectedPage) => {
    if (selectedPage >= 1 && selectedPage < (users.length / 10 + 1) && selectedPage !== page) {
      setPage(selectedPage)
    }
  }

  return (
    <div className="Dashboard">
    <div className='control-panel'>
      <div className="select-all">
        <input
          id="selectAll"
          type="checkbox"
          checked={selectedUsers.length > 0 && users
            .slice(page * 10 - 10, page * 10)
            .every(user => selectedUsers.includes(user.id))}
          onChange={handleSelectAll}
        />
        <label htmlFor="selectAll">Select/Deselect All</label>
      </div>
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
      <select className='theme'
        onChange={()=>{
          changeTheme();
          }}
      >
        <option>Light</option>
        <option>Dark</option>
      </select>
      <div className='del'>
        <button className="delete button" onClick={handleDeleteSelected} disabled={selectedUsers.length === 0}>
          Delete Selected
        </button>
        <button className="delete button" onClick={() => setUsers([])}>
          Delete All
        </button>
      </div>
    </div>
      <table className="table"> 
        <thead>
          <tr>
            <th className='head-title'>Select</th>
            <th className="head-title">Name</th>
            <th className="head-title">Email</th>
            <th className="head-title">Role</th>
            <th className="head-title actions">Actions</th>
          </tr>
        </thead>
        <tbody>
        {users.length>0? (users
  .filter((user) => {
    return handleSearch(user)
  }
        )
  .slice(page * 10 - 10, page * 10).map(user => (
            <tr key={user.id} className={`table-row ${selectedUsers.includes(user.id) ? 'selected-row' : ''}`}>
              <td>                  
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td data-cell="Name: " className="row-item">
                {editingUser === user ? (
                  <input
                    type="text"
                    value={editedFields.name !== undefined ? editedFields.name : user.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td data-cell="Email: " className="row-item">
                {editingUser === user ? (
                  <input
                    type="email"
                    value={editedFields.email !== undefined ? editedFields.email : user.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td data-cell="Role: " className="row-item">
                {editingUser === user ? (
                  <select
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
              <td data-cell="Actions: " className="row-item action-btn">
                {editingUser === user ? (
                  <>
                    <button className="save button" onClick={() => handleSave(user)}>
                      Save
                    </button>
                    &nbsp;
                    <button className="delete button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit button" onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                )}
                &nbsp;
                <button className="delete button" onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
      ))
        ):<tr>
          <td className='All-deleted' colSpan={5}>No Data to show</td>
        </tr>
        }
        </tbody>
      </table>
      {users.length > 0 && 
        <div className="pagination">
          <div 
            onClick={() => selectPageHandler(page - 1)} 
            className={page > 1 ? "" : "pagination__disable"}
            >
              ◀
          </div>

          {users.length > 0 &&
            [...Array(Math.ceil(users.filter((user) => {
              return handleSearch(user);
            }).length / 10))].map((_, i) => {
              return (
                <div
                  key={i}
                  className={page === i + 1 ? "pagination__selected" : ""}
                  onClick={() => selectPageHandler(i + 1)}
                >
                  {i + 1}
                </div>
              );
            })
          }

          <div 
            onClick={() => selectPageHandler(page + 1)} 
            className={page < users.filter((user) => {
              return handleSearch(user);
            }).length / 10 ? "" : "pagination__disable"}
            >
              ▶
          </div>
      </div>}
    </div>
  );
};

export default Dashboard;