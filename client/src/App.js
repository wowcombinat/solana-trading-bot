import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, GlobalStyles } from './themes';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <AppWrapper>
        <Header 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated}
          toggleTheme={toggleTheme}
          theme={theme}
        />
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <Auth setIsAuthenticated={setIsAuthenticated} />
        )}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
