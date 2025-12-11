const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

function getUserObjectId(req) {
  if (!req.user || !req.user._id) {
    throw new Error("Authenticated user has no _id on req.user");
  }
  const id = req.user._id;
  return id instanceof ObjectId ? id : new ObjectId(id);
}

async function displayAccess(req, res, next) {
    try {
        const db = getDB();
        const AccessListCollection = db.collection("AccessList");
        const userId = getUserObjectId(req);

        const accessList = await AccessListCollection.find({ userId: userId}).toArray();
        return res.json(accessList);
    } catch (err) {
        next(err);
    }
}

async function giveAccess(req, res, next) {
    try {
        const db = getDB();
        const AccessListCollection = db.collection("accessList");
        const { userId, listId, role } = req.body || {};

        if (!userId || !listId ) {
            return res
            .status(400)
            .json({ error: true, message: "A userId and listId  is required" });
        }

        const doc = {
        userId,
        listId,
        role: role || "read",
        createdAt: new Date(),
        };

        const result = await AccessListCollection.insertOne(doc);
        return res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) {
        next(err);
    }
}

async function revokeAccess(req, res, next) {
    try {
        const db = getDB();
        const AccessListCollection = db.collection("accessList");
        const { userId, listId, role } = req.body || {};

        if (!userId || !listId ) {
            return res
            .status(400)
            .json({ error: true, message: "A userId and listId  is required" });
        }

        const result = await AccessListCollection.deleteOne(doc);
        return res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) {
        next(err);
    }
}

async function updateAccess(req, res, next) {

}

module.exports = {
    displayAccess,
    giveAccess,
    revokeAccess,
    updateAccess,
};
