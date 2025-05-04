import React from 'react';
import styled from 'styled-components';
import {githubLink} from "../../public/static.js";

const Button = () => {
  console.log(githubLink)
  return (
    <StyledWrapper>
      <a
          className="button x"
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
          <g id="SVGRepo_bgCarrier" strokeWidth={0} />
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
          <g id="SVGRepo_iconCarrier">
            <title>github</title>
            <rect width={24} height={24} fill="none" />
            <path d="M12,2A10,10,0,0,0,8.84,21.5c.5.08.66-.23.66-.5V19.31C6.73,19.91,6.14,18,6.14,18A2.69,2.69,0,0,0,5,16.5c-.91-.62.07-.6.07-.6a2.1,2.1,0,0,1,1.53,1,2.15,2.15,0,0,0,2.91.83,2.16,2.16,0,0,1,.63-1.34C8,16.17,5.62,15.31,5.62,11.5a3.87,3.87,0,0,1,1-2.71,3.58,3.58,0,0,1,.1-2.64s.84-.27,2.75,1a9.63,9.63,0,0,1,5,0c1.91-1.29,2.75-1,2.75-1a3.58,3.58,0,0,1,.1,2.64,3.87,3.87,0,0,1,1,2.71c0,3.82-2.34,4.66-4.57,4.91a2.39,2.39,0,0,1,.69,1.85V21c0,.27.16.59.67.5A10,10,0,0,0,12,2Z" />
          </g>
        </svg>
        Check on Github
      </a>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;

    
  .button.x {
    max-width: 320px;
    display: flex;
    padding: 0.5rem 1.4rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    vertical-align: middle;
    align-items: center;
    border-radius: 0.5rem;
    border: 1px solid rgba(24, 23, 23, 0.25);
    gap: 0.75rem;
    color: #ffffff;
    background-color: rgb(24, 23, 23);
    cursor: pointer;
    transition: all 0.6s ease;
    text-decoration: none;
  }

  .button.x svg {
    height: 24px;
    width: 24px;
    fill: #fff;
    margin-right: 0.5rem;
  }

  .button.x:hover {
    transform: scale(1.02);
    background-color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .button.x:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.3);
  }

  .button.x:active {
    transform: scale(0.98);
    opacity: 0.8;
  }

  @media (max-width: 480px) {
    .button.x {
      max-width: 100%;
    }
  }`;

export default Button;
