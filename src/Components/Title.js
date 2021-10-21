import styled from 'styled-components'

const Heading = styled.h1`
font-size: 2.5em;
text-align: left;
color: #454545;
margin-left: 85px;
font-weight: 100;
`;

export const Title = ({text}) => {
    return (
        <Heading>
            {text}
        </Heading>
    )
};