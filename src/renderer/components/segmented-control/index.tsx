import { forwardRef } from 'react';
import {
  SegmentedControl as MantineSegmentedControl,
  SegmentedControlProps as MantineSegmentedControlProps,
} from '@mantine/core';
import styled from 'styled-components';

type SegmentedControlProps = MantineSegmentedControlProps;

const StyledSegmentedControl = styled(
  MantineSegmentedControl
)<MantineSegmentedControlProps>`
  & .mantine-SegmentedControl-label {
    color: var(--input-fg);
    font-family: var(--content-font-family);
  }

  background-color: var(--input-bg);

  & .mantine-SegmentedControl-disabled {
    opacity: 0.6;
  }

  & .mantine-SegmentedControl-active {
    color: var(--input-active-fg);
    background-color: var(--input-active-bg);
  }
`;

export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ ...props }: SegmentedControlProps, ref) => {
  return (
    <StyledSegmentedControl
      ref={ref}
      styles={{}}
      transitionDuration={250}
      transitionTimingFunction="linear"
      {...props}
    />
  );
});
