import { ObjectId } from "mongodb";
import { Ingredient } from "../models/ingredient";
import clientPromise from "./mongodb";

export const COLLECTION_NAME = "ingredient";

export async function getCollection() {
  const client = await clientPromise;

  return client.db().collection<Ingredient>(COLLECTION_NAME);
}

export async function addIngredient(ingredient: Omit<Ingredient, "_id">) {
  const collection = await getCollection();

  const insertData = await collection.insertOne(ingredient);

  if (!insertData.acknowledged) {
    return null;
  }

  return getIngredient(insertData.insertedId.toString());
}

export async function updateIngredient(
  id: string,
  ingredient: Partial<Ingredient>
) {
  const collection = await getCollection();

  const updatedIngredient = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: ingredient },
    { returnDocument: "after" }
  );

  return updatedIngredient.value;
}

export async function getIngredient(id: string) {
  const collection = await getCollection();

  return collection.findOne({ _id: new ObjectId(id) });
}

export async function getIngredients(): Promise<Ingredient[]> {
  const collection = await getCollection();

  const ingredients = await collection.find();

  return ingredients.toArray();
}

export async function removeIngredient(id: string) {
  const collection = await getCollection();

  const deletedIngredient = await collection.findOneAndDelete({
    _id: new ObjectId(id),
  });

  return deletedIngredient.value;
}
