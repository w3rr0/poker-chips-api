import React from "react";
import styled from "styled-components";

const OnBoard = ({ puttedAmount }) => {
    return (
        <StyledWrapper>
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
`;

export default OnBoard;