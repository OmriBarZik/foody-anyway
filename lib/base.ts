import clientPromise from "./mongodb";
import { ObjectId, OptionalUnlessRequiredId, Document, WithId } from "mongodb";

type DocumentType = {
  _id?: ObjectId;
  [key: string]: any;
};

const getIdObj = <T>(id: string | ObjectId): WithId<T> =>
  ({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  } as WithId<T>);

export class BaseClient<T extends DocumentType> {
  readonly COLLECTION_NAME;

  protected constructor(collectionName: string) {
    this.COLLECTION_NAME = collectionName;
  }

  async getCollection() {
    const client = await clientPromise;

    return client.db().collection<T>(this.COLLECTION_NAME);
  }

  async add(item: OptionalUnlessRequiredId<T>) {
    const collection = await this.getCollection();

    const insertData = await collection.insertOne(item);

    if (!insertData.acknowledged) {
      return null;
    }

    return this.get(insertData.insertedId);
  }

  async update(
    id: string | ObjectId,
    ingredient: T
  ): Promise<WithId<T> | null> {
    const collection = await this.getCollection();

    const updatedIngredient = await collection.findOneAndUpdate(
      getIdObj(id),
      { $set: ingredient },
      { returnDocument: "after" }
    );

    return updatedIngredient.value;
  }

  async get(id: string | ObjectId) {
    const collection = await this.getCollection();

    return collection.findOne(getIdObj(id));
  }

  async getAll(): Promise<WithId<T>[]> {
    const collection = await this.getCollection();

    const ingredients = await collection.find();

    return ingredients.toArray();
  }

  async remove(id: string | ObjectId): Promise<WithId<T> | null> {
    const collection = await this.getCollection();

    const deletedIngredient = await collection.findOneAndDelete(getIdObj(id));

    return deletedIngredient.value;
  }
}
