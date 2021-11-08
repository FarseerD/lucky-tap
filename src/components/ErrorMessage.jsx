import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 100vw;
  line-height: 1.5;
  padding: 20px;
  background-color: #f44336;
  color: #fff;
`;

export default function ErrorMessage({message}) {
  if (!message) {
    return null;
  }
  return <Container>{message}</Container>;
}
