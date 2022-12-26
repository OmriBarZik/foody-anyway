import { createContext } from 'react';

export interface shareInfoType {
  stepsArr: string[],
  setStepsArr: (param: string[]) => void,
  IngredientsArr: string[],
  setIngredientsArr: (param: string[]) => void,
  title: string,
  setTitle: (param: string) => void,
  url: string,
  setURL: (param: string) => void
}

export const AdminsContext = createContext<shareInfoType>({
  stepsArr: [],
  setStepsArr: () => { },
  IngredientsArr: [],
  setIngredientsArr: () => { },
  title: "",
  setTitle: () => { },
  url: "",
  setURL: () => { }
});
