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
    const AccessListCollection = db.collection("accessList");
    const userId = getUserObjectId(req);

    const accessList = await AccessListCollection.find({ userId }).toArray();

    return res.status(200).json({
      success: true,
      count: accessList.length,
      message:
        accessList.length === 0
          ? "Success, but you do not have access to any lists yet."
          : "Success.",
      accessList,
    });
  } catch (err) {
    next(err);
  }
}

const VALID_ROLES = ["read", "viewer", "editor"];

async function giveAccess(req, res, next) {
  try {
    const db = getDB();
    const AccessListCollection = db.collection("accessList");
    const ListsCollection = db.collection("list");

    const originUserId = getUserObjectId(req);
    const { userId: giveuserId, listId, role } = req.body || {};

    // Validate required fields
    if (!giveuserId || !listId) {
      return res.status(400).json({
        error: true,
        message: "userId and listId are required",
      });
    }

    // Validate ObjectId strings
    if (!ObjectId.isValid(giveuserId) || !ObjectId.isValid(listId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid userId or listId",
      });
    }

    const targetUserId = new ObjectId(giveuserId);
    const listObjId = new ObjectId(listId);

    // Optional: prevent granting to self
    if (String(targetUserId) === String(originUserId)) {
      return res.status(400).json({
        error: true,
        message: "You already own this list",
      });
    }

    // Owner-only check
    const ownedList = await ListsCollection.findOne({
      _id: listObjId,
      userId: originUserId,
    });

    if (!ownedList) {
      return res.status(403).json({
        error: true,
        message: "Only the list owner can grant access to this list",
      });
    }

    // Validate role
    const normalizedRole = (role || "read").toLowerCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: true,
        message: `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
      });
    }

    // Prevent duplicate access entries
    const existing = await AccessListCollection.findOne({
      userId: targetUserId,
      listId: listObjId,
    });

    if (existing) {
      return res.status(409).json({
        error: true,
        message: "Access already exists for this user and list",
        _id: existing._id,
      });
    }

    const doc = {
      userId: targetUserId,
      listId: listObjId,
      role: normalizedRole,
      grantedBy: originUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await AccessListCollection.insertOne(doc);

    return res.status(201).json({
      error: false,
      message: "Access granted successfully",
      access: { _id: result.insertedId, ...doc },
    });
  } catch (err) {
    next(err);
  }
}

async function revokeAccess(req, res, next) {
  try {
    const db = getDB();
    const AccessListCollection = db.collection("accessList");
    const ListsCollection = db.collection("list");

    const originUserId = getUserObjectId(req);
    const givenuserId = req.params.id;
    const {listId } = req.body || {};

    // Validate required fields
    if (!givenuserId || !listId) {
      return res.status(400).json({
        error: true,
        message: "givenuserId and listId are required",
      });
    }

    // Validate ObjectId strings
    if (!ObjectId.isValid(givenuserId) || !ObjectId.isValid(listId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid givenuserId or listId",
      });
    }

    const targetUserId = new ObjectId(givenuserId);
    const listObjId = new ObjectId(listId);

    // Owner-only check
    const ownedList = await ListsCollection.findOne({
      _id: listObjId,
      userId: originUserId,
    });

    if (!ownedList) {
      return res.status(403).json({
        error: true,
        message: "Only the list owner can revoke access for this list",
      });
    }

    // Delete the access entry
    const result = await AccessListCollection.deleteOne({
      userId: targetUserId,
      listId: listObjId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: true,
        message: "Access record not found (nothing to revoke)",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Access revoked successfully",
      revoked: { userId: targetUserId, listId: listObjId },
    });
  } catch (err) {
    next(err);
  }
}

async function updateAccess(req, res, next) {
  try {
    const db = getDB();
    const AccessListCollection = db.collection("accessList");
    const ListsCollection = db.collection("list");

    const originUserId = getUserObjectId(req);

    const { id } = req.params;
    const { listId, role } = req.body || {};

    // Validate required fields
    if (!id || !listId) {
      return res.status(400).json({
        error: true,
        message: "givenuserId and listId are required",
      });
    }

    if (!role) {
      return res.status(400).json({
        error: true,
        message: "A role is required",
      });
    }

    // Validate ObjectIds
    if (!ObjectId.isValid(id) || !ObjectId.isValid(listId)) {
      return res.status(400).json({
        error: true,
        message: "Invalid givenuserId or listId",
      });
    }

    // Validate role
    const normalizedRole = String(role).toLowerCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: true,
        message: `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
      });
    }

    const targetUserId = new ObjectId(id);
    const listObjId = new ObjectId(listId);

    // Owner-only check
    const ownedList = await ListsCollection.findOne({
      _id: listObjId,
      userId: originUserId,
    });

    if (!ownedList) {
      return res.status(403).json({
        error: true,
        message: "Only the list owner can update access roles for this list",
      });
    }

    // Update the access record for that user+list
    const result = await AccessListCollection.updateOne(
      { userId: targetUserId, listId: listObjId },
      { $set: { role: normalizedRole, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: true,
        message: "Access record not found",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Access updated successfully",
      updated: { userId: targetUserId, listId: listObjId, role: normalizedRole },
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
    displayAccess,
    giveAccess,
    revokeAccess,
    updateAccess,
};
