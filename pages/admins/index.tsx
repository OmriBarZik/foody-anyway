import Steps from '../../components/steps/Steps';
import Ingredients from '../../components/ingredients/Ingredients';
import { useState } from 'react';
import { AdminsContext, shareInfoType } from '../../components/context';

export default function Testy() {
  const [stepsArr, setStepsArr] = useState<string[]>([])
  const [IngredientsArr, setIngredientsArr] = useState<string[]>([])
  const [title, setTitle] = useState<string>("")
  const [url, setURL] = useState<string>("")

  const shareInfo: shareInfoType = {
    stepsArr,
    setStepsArr,
    IngredientsArr,
    setIngredientsArr,
    title,
    setTitle,
    url,
    setURL
  }

  return (
    <AdminsContext.Provider value={shareInfo}>
      <input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder='title'></input>
      <input value={url} onChange={(e) => setURL(e.currentTarget.value)} placeholder='url'></input>
      <Ingredients />
      <Steps />
      <button>save</button>
    </AdminsContext.Provider>
  )
}
