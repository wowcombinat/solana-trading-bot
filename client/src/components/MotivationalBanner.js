import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BannerWrapper = styled.div`
  background-color: #2a2a2a;
  color: #00ffff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 18px;
`;

const motivationalMessages = [
  "Join now and change the world!",
  "Empower your future with Solana!",
  "Trade smarter, not harder!",
  "Your journey to financial freedom starts here!",
  "Be the master of your own finances!",
  "Unlock the potential of decentralized finance!",
  "Join the Solana revolution today!",
  "Trade like a pro, earn like a boss!",
  "Your gateway to the world of crypto trading!",
  "Maximize your profits with our cutting-edge bot!"
];

const MotivationalBanner = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setMessage(motivationalMessages[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BannerWrapper>
      {message}
    </BannerWrapper>
  );
};

export default MotivationalBanner;
