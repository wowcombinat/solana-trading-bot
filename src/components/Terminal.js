import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const glitch = keyframes`
  0% {
    text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
      0.025em 0.05em 0 #fffc00;
  }
  14% {
    text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
      0.025em 0.05em 0 #fffc00;
  }
  15% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  50% {
    text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
      0 -0.05em 0 #fffc00;
  }
  99% {
    text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
      0 -0.05em 0 #fffc00;
  }
  100% {
    text-shadow: -0.025em 0 0 #00fffc, -0.025em -0.025em 0 #fc00ff,
      -0.025em -0.05em 0 #fffc00;
  }
`;

const TerminalWrapper = styled.div`
  background-color: #0a0a0a;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00;
  overflow: hidden;
  height: 400px;
  overflow-y: auto;
`;

const TerminalLine = styled.div`
  margin-bottom: 10px;
  animation: ${glitch} 0.5s linear infinite;
  
  &:hover {
    color: #ff00ff;
  }
`;

const Terminal = () => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prevLines => [...prevLines, `> ${new Date().toLocaleTimeString()} - System operational`]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TerminalWrapper>
      {lines.map((line, index) => (
        <TerminalLine key={index}>{line}</TerminalLine>
      ))}
    </TerminalWrapper>
  );
};

export default Terminal;
