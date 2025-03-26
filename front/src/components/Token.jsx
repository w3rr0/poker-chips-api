import styled from "styled-components";

const Token = ({ value }) => {
    const putMoney = () => {
        console.log("puttedMoney", value);
    }

    return (
        <StyleWrapper>
            <img src={`/tokens-img/${value}.png`} alt={`$${value} Token`} width="40px" height="40px" onClick={putMoney} />
        </StyleWrapper>
    )
}

const StyleWrapper = styled.button`
    cursor: pointer;
    border-radius: 50%;
    background: transparent;
`;

export default Token;