"use client";

import { Button, Group, Switch, useMantineColorScheme } from "@mantine/core";

export default function Home() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <Group style={{marginLeft: 20}} justify="start" mt="xl">
      <Switch
        size="md"
        checked={colorScheme === "dark"}
        onChange={() =>
          colorScheme === "dark"
            ? setColorScheme("light")
            : setColorScheme("dark")
        }
        color="dark.4"
        onLabel={<p>Dark</p>}
        offLabel={<p>Light</p>}
      />
    </Group>
  );
}
