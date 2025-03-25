import React from 'react';
import styled from 'styled-components';


const Button = ({ caption }) => {
    return (
        <StyledWrapper>
            <button>
                {caption}
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  button {
    width: 10em;
    position: relative;
    height: 3.5em;
    border: 3px ridge #149CEA;
    outline: none;
    background-color: transparent;
    color: white;
    transition: 1s;
    border-radius: 0.3em;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  button::after {
    content: "";
    position: absolute;
    top: -10px;
    left: 3%;
    width: 95%;
    height: 40%;
    background-color: #2a2a2a;
    transition: 0.5s;
    transform-origin: center;
  }

  button::before {
    content: "";
    transform-origin: center;
    position: absolute;
    top: 80%;
    left: 3%;
    width: 95%;
    height: 40%;
    background-color: #2a2a2a;
    transition: 0.5s;
  }

  button:hover::before, button:hover::after {
    transform: scale(0)
  }

  button:hover {
    box-shadow: inset 0 0 25px #1479EA;
  }`;

export default Button;
