"use client";

import { Ingredient } from "@/models";
import {
  Button,
  CloseButton,
  Group,
  Input,
  Pill,
  Switch,
  useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";

export default function Home() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [loader, setLoader] = useState(false);
  const [value, setValue] = useState("");

  function getIngredients() {
    setLoader(true);
    fetch("/api/ingredients")
      .then((e) => e.json())
      .then((e) => {
        setIngredientsList(e);
        setLoader(false);
      });
  }

  async function addIngredient() {
    if (!value) {
      return;
    }

    await fetch("/api/ingredient", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: value,
        amount: 3,
      } as Ingredient),
    }).then((e) => console.log(e));
    setValue("");
    getIngredients();
  }

  useEffect(() => {
    getIngredients();
  }, []);

  return (
    <>
      <Group style={{ marginLeft: 20 }} justify="start" mt="xl">
        <Switch
          size="md"
          checked={colorScheme === "dark"}
          onChange={() => {
            colorScheme === "dark"
              ? setColorScheme("light")
              : setColorScheme("dark");
          }}
          color="dark.4"
          onLabel={<p>Dark</p>}
          offLabel={<p>Light</p>}
        />
      </Group>

      <Group
        style={{ marginLeft: 20, alignItems: "center" }}
        justify="start"
        mt="xl"
      >
        <Input
          style={{ "--mantine-spacing-md": 0 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addIngredient();
            }
          }}
          placeholder="Clearable input"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rightSectionPointerEvents="all"
          mt="md"
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => setValue("")}
              style={{ display: value ? undefined : "none" }}
            />
          }
        />
        <Button
          variant="transparent"
          style={{
            display: value ? undefined : "none",
            background: "none",
            border: "none",
            color: "inherit",
            fontSize: 25,
            padding: 0,
          }}
          onClick={addIngredient}
        >
          +
        </Button>
      </Group>

      <Group style={{ marginLeft: 20 }} justify="start" mt="xl">
        {loader
          ? "...loader"
          : ingredientsList.map((e) => {
              return (
                <Pill
                  key={e._id?.toString()}
                  withRemoveButton
                  onRemove={async () => {
                    await fetch(`/api/ingredient/${e._id}`, {
                      method: "delete",
                    });
                    getIngredients();
                  }}
                >
                  {e.name}
                </Pill>
              );
            })}
      </Group>
    </>
  );
}
