import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 30px;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.primary};
`;

const NavButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const Header = ({ isAuthenticated, setIsAuthenticated, toggleTheme, theme }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <HeaderWrapper>
      <Logo>SolanaTrader</Logo>
      <NavButtons>
        <Button onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
        {isAuthenticated && (
          <Button onClick={handleLogout}>Logout</Button>
        )}
      </NavButtons>
    </HeaderWrapper>
  );
};

export default Header;
