import React from 'react';
import styled from '@emotion/styled';
import { Text } from '@/renderer/components';
import { Font } from '@/renderer/styles';

interface ServerSectionProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
}

const Container = styled.div``;

const Section = styled.div`
  padding: 1rem;
  border: 1px solid var(--generic-border-color);
`;

export const ServerSection = ({ title, children }: ServerSectionProps) => {
  return (
    <Container>
      <Text font={Font.EPILOGUE} size="sm">
        {title}
      </Text>
      <Section>{children}</Section>
    </Container>
  );
};