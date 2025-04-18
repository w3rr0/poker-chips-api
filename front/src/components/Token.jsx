import styled from "styled-components";
import {useRef} from "react";

const Token = ({ value, putToken }) => {
    const tokenRef = useRef()

    const putMoney = () => {
        const rect = tokenRef.current.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 4 + window.scrollX,
            y: rect.top + rect.height / 4 + window.scrollY
        };
        putToken(value, position);
    }

    return (
        <StyleWrapper ref={tokenRef}>
            <img className="token-img" src={`/tokens-img/${value}.png`} alt={`$${value} Token`} onClick={putMoney} style={{cursor: 'pointer'}} />
        </StyleWrapper>
    )
}

const StyleWrapper = styled.button`
    background: transparent;
    cursor: default;
    padding: 10px 15px;
    @media (max-width: 500px) {
        padding: 3px 5px;
    }
    
    &:hover {
        background: transparent;
    }
`;

export default Token;