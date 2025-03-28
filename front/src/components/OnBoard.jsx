import React from "react";
import styled from "styled-components";

const OnBoard = ({ puttedAmount }) => {
    return (
        <StyledWrapper>
            <img src="/chips-stack.png" alt="token stack" width="40px" height="40px" onClick={() => {console.log('tokens return')}}/>
                ${puttedAmount}
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    gap: 5px;
`;

export default OnBoard;