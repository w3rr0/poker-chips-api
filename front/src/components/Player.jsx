import React from "react";
import styled from "styled-components";

const Player = ({ player }) => {
    return (
        <StyledWrapper>
            {player.username}
            <img className="player-icon" src="/gambler.png" alt="Player icon" />
            ${player.amount}
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    text-wrap: wrap;
    gap: 5px;
    @media (max-width: 500px) {
        font-size: 12px;
        gap: 3px;
    }
`;

export default Player