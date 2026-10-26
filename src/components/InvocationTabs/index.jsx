import {Tabs} from '@mantine/core';
import {IconBrandGithub, IconBrandVscode, IconTerminal2} from '@tabler/icons-react';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Tabs.css';

export default function InvocationTabs({children}) {
  return (
    <Tabs defaultValue="cli" keepMountedMode="display-none" my="lg" className="nomos-invocation-tabs">
      <Tabs.List aria-label="Invoke Nomos using">
        <Tabs.Tab value="cli" leftSection={<IconTerminal2 size={16} aria-hidden="true" />}>Copilot CLI</Tabs.Tab>
        <Tabs.Tab value="github" leftSection={<IconBrandGithub size={16} aria-hidden="true" />}>GitHub UI</Tabs.Tab>
        <Tabs.Tab value="vscode" leftSection={<IconBrandVscode size={16} aria-hidden="true" />}>VS Code</Tabs.Tab>
      </Tabs.List>
      {children}
      <noscript>
        <style>{'.nomos-invocation-tabs [role="tabpanel"] { display: block !important; }'}</style>
      </noscript>
    </Tabs>
  );
}

export function InvocationPanel({value, children}) {
  return <Tabs.Panel value={value} pt="lg">{children}</Tabs.Panel>;
}
