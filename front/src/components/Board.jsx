import React from 'react';
import styled from 'styled-components';
import EnemyGroup from "./EnemyGroup.jsx";

const Board = () => {
    return (
        <StyledWrapper>
            <div className="container">
                <EnemyGroup players={"player"} />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    height: 100vh;
    height: 100dvh;         // Nadpisuje wartośc vh tylko jeśli przeglądakrka wspiera Dynamic Viewport Height (rozwiązanie dla starszych przeglądarek)
    display: flex;
    justify-content: center;
    align-items: center;

    .container {
        width: 100%;
        height: 100%;
        background-color: #8B4513;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
    }

    .container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/wood-pattern.png');
        background-size: cover;
        border-radius: 20px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
    }

    .container::after {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background-color: #006400;
        border-radius: 15px;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
    }
`;

export default Board;
