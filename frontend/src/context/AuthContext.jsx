import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';

const AuthContext = createContext();

// Cifrado simple en Base64 para el JSON (Simulación de cifrado para Frontend)
const encryptData = (data) => btoa(JSON.stringify(data));
const decryptData = (data) => JSON.parse(atob(data));

const INITIAL_USERS = [
  { id: 1, username: 'admin', password: '123', name: 'Admin Tienda', role: 'store', isMain: true },
  { id: 2, username: 'productor1', password: '123', name: 'Productor Juan', role: 'producer', isMain: true }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Cargar usuarios desde el JSON cifrado en LocalStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('freshtrack_db_v2');
    if (saved) {
      try {
        setAllUsers(decryptData(saved));
      } catch (e) {
        setAllUsers(INITIAL_USERS);
      }
    } else {
      setAllUsers(INITIAL_USERS);
      localStorage.setItem('freshtrack_db_v2', encryptData(INITIAL_USERS));
    }
  }, []);

  const login = (username, password) => {
    const found = allUsers.find(u => u.username === username && u.password === password);
    if (found) {
      // If user doesn't have a wallet, generate one
      if (!found.privateKey) {
        const wallet = ethers.Wallet.createRandom();
        found.privateKey = wallet.privateKey;
        found.address = wallet.address;
        
        // Save the updated user to local storage
        const updatedUsers = allUsers.map(u => u.id === found.id ? found : u);
        setAllUsers(updatedUsers);
        localStorage.setItem('freshtrack_db_v2', encryptData(updatedUsers));
      }
      
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };
  
  const addUser = (name, username, password, role) => {
    const newId = Math.max(...allUsers.map(u => u.id), 0) + 1;
    const newUserList = [...allUsers, { id: newId, name, username, password, role, isMain: false }];
    setAllUsers(newUserList);
    localStorage.setItem('freshtrack_db', encryptData(newUserList));
  };
  
  const removeUser = (id) => {
    const newUserList = allUsers.filter(u => u.id !== id || u.isMain);
    setAllUsers(newUserList);
    localStorage.setItem('freshtrack_db', encryptData(newUserList));
  };

  const storeUsers = allUsers.filter(u => u.role === 'store');
  const producerUsers = allUsers.filter(u => u.role === 'producer');

  return (
    <AuthContext.Provider value={{ user, login, logout, storeUsers, producerUsers, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
