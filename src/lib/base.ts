import clientPromise from "./mongodb";
import { ObjectId, OptionalUnlessRequiredId, WithId } from "mongodb";

type DocumentType = {
  _id?: ObjectId | string;
  [key: string]: any;
};

const getIdObj = <T>(id: DocumentType["_id"]): WithId<T> =>
  ({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  }) as WithId<T>;

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

    if (!insertData.insertedId) {
      return null;
    }

    return this.get(insertData.insertedId);
  }

  async update(
    id: DocumentType["_id"],
    ingredient: T,
  ): Promise<WithId<T> | null> {
    const collection = await this.getCollection();

    const updatedIngredient = await collection.findOneAndUpdate(
      getIdObj(id),
      { $set: ingredient },
      { returnDocument: "after" },
    );

    return updatedIngredient?.value;
  }

  async get(id: DocumentType["_id"]) {
    const collection = await this.getCollection();

    return collection.findOne(getIdObj(id));
  }

  async getAll(): Promise<WithId<T>[]> {
    const collection = await this.getCollection();

    const ingredients = await collection.find();

    return ingredients.toArray();
  }

  async remove(id: DocumentType["_id"]): Promise<WithId<T> | null> {
    const collection = await this.getCollection();

    const deletedIngredient = await collection.findOneAndDelete(getIdObj(id));

    return deletedIngredient?.value;
  }
}
