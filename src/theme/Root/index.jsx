import {Card, MantineProvider, createTheme} from '@mantine/core';

const theme = createTheme({
  primaryColor: 'gold',
  primaryShade: 5,
  colors: {
    gold: [
      '#fff8e1', '#ffefb3', '#ffe080', '#ffd04d', '#ffc233',
      '#ffb400', '#e6a200', '#cc9000', '#b37e00', '#997000',
    ],
    dark: [
      '#e0e0e0', '#cccccc', '#a0a0a0', '#606060', '#353535',
      '#2a2a2a', '#232323', '#1e1e1e', '#1c1c1c', '#141414',
    ],
  },
  fontFamily: 'var(--ifm-font-family-base)',
  fontFamilyMonospace: 'var(--ifm-font-family-monospace)',
  headings: {fontFamily: 'var(--ifm-font-family-base)'},
  breakpoints: {sm: '48em', md: '64em'},
  components: {
    Card: Card.extend({
      defaultProps: {padding: '1.5rem', radius: 'md'},
      styles: {
        root: {
          backgroundColor: 'var(--ifm-background-surface-color)',
          color: 'var(--ifm-font-color-base)',
        },
      },
    }),
  },
});

export default function Root({children}) {
  return (
    <MantineProvider
      deduplicateCssVariables={false}
      forceColorScheme="dark"
      theme={theme}
      withGlobalClasses={false}
    >
      {children}
    </MantineProvider>
  );
}
