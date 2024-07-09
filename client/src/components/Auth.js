import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 0 auto;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #00ffff;
  color: black;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
`;

function Auth({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(endpoint, { username, password });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication failed:', error.response?.data?.error || error.message);
      setError(error.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">{isLogin ? 'Login' : 'Register'}</Button>
      <Button type="button" onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Form>
  );
}

export default Auth;
