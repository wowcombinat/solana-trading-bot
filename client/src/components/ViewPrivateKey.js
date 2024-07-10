import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ViewKeyWrapper = styled.div`
  display: inline-block;
`;

const Button = styled.button`
  background-color: #1098fc;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0d8aec;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
`;

const ViewPrivateKey = ({ publicKey }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleViewPrivateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/view-private-key', { publicKey, password });
      setPrivateKey(response.data.privateKey);
    } catch (error) {
      console.error('Error viewing private key:', error);
      alert('Failed to view private key');
    }
  };

  return (
    <ViewKeyWrapper>
      <Button onClick={() => setShowModal(true)}>View Key</Button>
      {showModal && (
        <Modal>
          <ModalContent>
            <h3>View Private Key</h3>
            <form onSubmit={handleViewPrivateKey}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <Button type="submit">View</Button>
              <Button type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            </form>
            {privateKey && <div>Private Key: {privateKey}</div>}
          </ModalContent>
        </Modal>
      )}
    </ViewKeyWrapper>
  );
};

export default ViewPrivateKey;
