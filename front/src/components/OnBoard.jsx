import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import styled from "styled-components";

const OnBoard = ({ puttedAmount, yourPutted, onCenterChange }) => {
    const imgRef = useRef();
    const [lastCenter, setLastCenter] = useState(null);

    useLayoutEffect(() => {
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            const center = {
                x: rect.left + rect.width / 8,
                y: rect.top + rect.height / 8
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
    }, [lastCenter, onCenterChange]);

    useEffect(() => {
        window.addEventListener("resize", onCenterChange);
        return () => {
            window.removeEventListener("resize", onCenterChange);
        };
    }, []);

    return (
        <StyledWrapper>
            <img className="chips-stack" ref={imgRef} src="/chips-stack.png" alt="token stack" />
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
        @media (max-width: 600px) {
            font-size: 15px;
        }
        @media (max-width: 500px) {
            font-size: 14px;
        }
    }
`;

export default OnBoard;