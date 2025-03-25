import React from "react";
import styled from "styled-components";

const Player = ({ player }) => {
    return (
        <StyledWrapper>
            {player.username}
            <img src="/gambler.png" alt="Player icon" height="80px" width="80px" />
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
`;

export default Player