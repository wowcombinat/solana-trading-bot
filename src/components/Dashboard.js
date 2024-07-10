// src/components/Dashboard.js
import React from 'react';
import styled from 'styled-components';

const DashboardWrapper = styled.div`
  margin-top: 20px;
`;

const Welcome = styled.h2`
  color: ${props => props.theme.primary};
`;

function Dashboard({ username }) {
  return (
    <DashboardWrapper>
      <Welcome>Welcome, {username}!</Welcome>
      {/* Здесь можно добавить дополнительную информацию или виджеты для дашборда */}
    </DashboardWrapper>
  );
}

export default Dashboard;
