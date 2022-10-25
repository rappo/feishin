import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import {
  TextInput as MantineTextInput,
  TextInputProps as MantineTextInputProps,
  PasswordInput as MantinePasswordInput,
  PasswordInputProps as MantinePasswordInputProps,
} from '@mantine/core';

interface TextInputProps extends MantineTextInputProps {
  children: React.ReactNode;
}

interface PasswordInputProps extends MantinePasswordInputProps {
  children: React.ReactNode;
}

const StyledTextInput = styled(MantineTextInput)<TextInputProps>`
  &:focus,
  &:focus-within {
    border-color: var(--primary-color);
  }

  & .mantine-TextInput-wrapper {
    border-color: var(--primary-color);
  }

  & .mantine-TextInput-input {
    &:focus,
    &:focus-within {
      border-color: var(--primary-color);
    }
  }

  & .mantine-TextInput-required {
    color: var(--secondary-color);
  }

  & .mantine-TextInput-label {
    font-family: var(--label-font-faimly);
  }
`;

const StyledPasswordInput = styled(MantinePasswordInput)<PasswordInputProps>`
  & .mantine-PasswordInput-input {
    &:focus,
    &:focus-within {
      border-color: var(--primary-color);
    }
  }

  & .mantine-PasswordInput-required {
    color: var(--secondary-color);
  }

  & .mantine-PasswordInput-label {
    font-family: var(--label-font-faimly);
  }
`;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ children, ...props }: TextInputProps, ref) => {
    return (
      <StyledTextInput ref={ref} spellCheck={false} {...props}>
        {children}
      </StyledTextInput>
    );
  }
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ children, ...props }: PasswordInputProps, ref) => {
    return (
      <StyledPasswordInput ref={ref} spellCheck={false} {...props}>
        {children}
      </StyledPasswordInput>
    );
  }
);