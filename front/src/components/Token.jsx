import styled from "styled-components";

const Token = ({ value, putToken }) => {
    const putMoney = () => {
        console.log("puttedMoney", value);
        putToken(value);
    }

    return (
        <StyleWrapper>
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