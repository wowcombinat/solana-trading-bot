import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, GlobalStyles } from './themes';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import axios from 'axios';

const AppWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    }
    
    // Загрузка сохраненной темы из localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/user');
      setIsAuthenticated(true);
      setUsername(response.data.username);
    } catch (error) {
      console.error('Authentication failed:', error);
      handleLogout();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Сохранение выбранной темы в localStorage
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <AppWrapper>
        <Header 
          isAuthenticated={isAuthenticated} 
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
          username={username}
        />
        {isAuthenticated ? (
          <Dashboard username={username} theme={theme} />
        ) : (
          <Auth setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
        )}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
