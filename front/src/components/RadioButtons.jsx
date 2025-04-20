import React from 'react';
import styled from 'styled-components';

const Radio = ({ selectedValue, onChange }) => {
    const handleChange = (event) => {
        const valueString = event.target.value;
        const valueInt = parseInt(valueString, 10)
        onChange(valueInt);
    }

  return (
    <StyledWrapper>
      <div className="radio-input">
        <input checked={selectedValue === 3} onChange={handleChange} className="input green" type="radio" name="radio" value={3} />
        <input checked={selectedValue === 4} onChange={handleChange} className="input green" type="radio" name="radio" value={4} />
        <input checked={selectedValue === 5} onChange={handleChange} className="input yellow" type="radio" name="radio" value={5} />
        <input checked={selectedValue === 6} onChange={handleChange} className="input yellow" type="radio" name="radio" value={6} />
        <input checked={selectedValue === 7} onChange={handleChange} className="input red" type="radio" name="radio" value={7} />
        <input checked={selectedValue === 8} onChange={handleChange} className="input red" type="radio" name="radio" value={8} />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .input {
    -webkit-appearance: none;
    margin: 6px;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    cursor: pointer;
    vertical-align: middle;
    box-shadow: hsla(0, 0%, 100%, 0.15) 0 1px 1px,
      inset hsla(0, 0%, 0%, 0.5) 0 0 0 1px;
    background-color: hsla(0, 0%, 0%, 0.2);
    background-repeat: no-repeat;
    -webkit-transition: background-position 0.15s cubic-bezier(0.8, 0, 1, 1),
      -webkit-transform 0.25s cubic-bezier(0.8, 0, 1, 1);
    outline: none;
  }

  .input.green {
    background-image: -webkit-radial-gradient(
      hsla(118, 100%, 90%, 1) 0%,
      hsla(118, 100%, 70%, 1) 15%,
      hsla(118, 100%, 60%, 0.3) 28%,
      hsla(118, 100%, 30%, 0) 70%
    );
  }

  .input.yellow {
    background-image: -webkit-radial-gradient(
      hsla(50, 100%, 90%, 1) 0%,
      hsla(50, 100%, 70%, 1) 15%,
      hsla(50, 100%, 60%, 0.3) 28%,
      hsla(50, 100%, 30%, 0) 70%
    );
  }

  .input.red {
    background-image: -webkit-radial-gradient(
      hsla(0, 100%, 90%, 1) 0%,
      hsla(0, 100%, 70%, 1) 15%,
      hsla(0, 100%, 60%, 0.3) 28%,
      hsla(0, 100%, 30%, 0) 70%
    );
  }

  .input:checked {
    -webkit-transition: background-position 0.2s 0.15s cubic-bezier(0, 0, 0.2, 1),
      -webkit-transform 0.25s cubic-bezier(0, 0, 0.2, 1);
  }

  .input:active {
    -webkit-transform: scale(1.5);
    -webkit-transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);
  }

  /* The up/down direction logic */

  .input,
  .input:active {
    background-position: 24px 0;
  }

  .input:checked {
    background-position: 0 0;
  }

  .input:checked ~ .input,
  .input:checked ~ .input:active {
    background-position: -24px 0;
  }`;

export default Radio;
