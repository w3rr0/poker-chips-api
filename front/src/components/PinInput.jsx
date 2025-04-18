import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

const PinInput = ({ onChange }) => {
    const [digits, setDigits] = useState(Array(6).fill(''));
    const inputRefs = useRef([])

    useEffect(() => { inputRefs.current = inputRefs.current.slice(0, 6); }, []);

    const handleChange = (index, event) => {

        const value = event.target.value;
        if (/^\d?$/.test(value)) {
            const newDigits = [...digits];
            newDigits[index] = value;

            setDigits(newDigits);
            if (onChange) {
                onChange(newDigits.join(''));

            }
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text').replace(/\D/g, '');
        if (pasteData) {
            const newDigits = Array(6).fill('');
            for (let i = 0; i < 6 && i < pasteData.length; i++) {
                newDigits[i] = pasteData[i];
            }
            setDigits(newDigits);
            if (onChange) {
                onChange(newDigits.join(''));
            }
            const focusIndex = Math.min(pasteData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

  return (
    <StyledWrapper>
        <div className="pin-input">
            <label>Enter PIN:</label>
            <div className="password" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                    <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            maxLength={1}
                            className="input"
                            name={`pin-${index}`}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={digit}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            aria-label={`PIN digit ${index + 1}`}
                        />
                ))}
            </div>
        </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .password {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .password input {
    width: 30px;
    height: 40px;
    text-align: center;
    background-color: transparent;
    border: none;
    border-bottom: solid 2px rgb(20, 181, 230);
    font-size: 20px;
    color: white;
    outline: none;
  }

  .pin-input {
      display: flex;
      flex-direction: column;
      align-items: center;
  }
`;

export default PinInput;
