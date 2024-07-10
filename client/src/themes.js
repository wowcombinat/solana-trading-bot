import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  background: '#f4f7f9',
  text: '#333',
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  cardBackground: '#ffffff',
  borderColor: '#e0e0e0',
  tableHeader: '#f1f1f1',
  inputBackground: '#ffffff',
  error: '#e74c3c',
  errorHover: '#c0392b',
};

export const darkTheme = {
  background: '#2c3e50',
  text: '#ecf0f1',
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  cardBackground: '#34495e',
  borderColor: '#7f8c8d',
  tableHeader: '#2c3e50',
  inputBackground: '#34495e',
  error: '#e74c3c',
  errorHover: '#c0392b',
};

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    font-family: 'Roboto', sans-serif;
    transition: all 0.3s ease;
  }
`;
