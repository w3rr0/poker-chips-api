import styled from "styled-components";


const Chips = () => {
    return (
        <StyleWrapper>
            <label>token 1</label>
            <label>token 2</label>
            <label>token 3</label>
        </StyleWrapper>
    )
}

const StyleWrapper = styled.div`
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

export default Chips;