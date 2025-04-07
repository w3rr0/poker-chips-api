import styled from "styled-components";
import {useRef} from "react";

const Token = ({ value, putToken }) => {
    const tokenRef = useRef()

    const putMoney = () => {
        const rect = tokenRef.current.getBoundingClientRect();
        const position = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY
        };
        putToken(value, position);
    }

    return (
        <StyleWrapper ref={tokenRef}>
            <img src={`/tokens-img/${value}.png`} alt={`$${value} Token`} width="40px" height="40px" onClick={putMoney} style={{cursor: 'pointer'}} />
        </StyleWrapper>
    )
}

const StyleWrapper = styled.button`
    background: transparent;
    cursor: default;
    
    &:hover {
        background: transparent;
    }
`;

export default Token;