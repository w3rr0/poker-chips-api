import React, {useLayoutEffect, useRef, useState} from "react";
import styled from "styled-components";

const OnBoard = ({ puttedAmount, yourPutted, onCenterChange }) => {
    const imgRef = useRef();
    const [lastCenter, setLastCenter] = useState(null);

    useLayoutEffect(() => {
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            if (
                !lastCenter ||
                center.x !== lastCenter.x ||
                center.y !== lastCenter.y
            ) {
                setLastCenter(center);
                onCenterChange?.(center);
            }
        }
    }, []);

    return (
        <StyledWrapper>
            <img ref={imgRef} src="/chips-stack.png" alt="token stack" width="40px" height="40px"/>
            <div className="bet-container">
                <label style={{fontWeight: "bold"}}>${puttedAmount}</label>
                <label>Your: ${yourPutted}</label>
            </div>
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
    
    .bet-container {
        display: flex;
        flex-direction: column;
    }
`;

export default OnBoard;