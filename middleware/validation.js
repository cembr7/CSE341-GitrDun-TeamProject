// middleware/validation.js
const { body, param, validationResult } = require("express-validator");

const VALID_STATUSES = ["inbox", "doing", "done", "delegate"];
const VALID_PRIORITIES = ["low", "medium", "high"];

const validate = {};

function sendErrors(res, errors, message) {
  return res.status(400).json({
    error: true,
    message,
    details: errors.array(),
  });
}

/* =============== LISTS =============== */

validate.createListRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("name is required and must be a non-empty string."),
    body("description")
      .optional()
      .isString()
      .withMessage("description must be a string if provided."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "List validation error (create)");
      }
      next();
    },
  ];
};

validate.updateListRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("name must be a non-empty string if provided."),
    body("description")
      .optional()
      .isString()
      .withMessage("description must be a string if provided."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "List validation error (update)");
      }
      next();
    },
  ];
};

/* =============== TASKS =============== */

validate.createTaskRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("name is required and must be a non-empty string."),
    body("listId")
      .trim()
      .notEmpty()
      .withMessage("listId is required.")
      .bail()
      .isMongoId()
      .withMessage("listId must be a valid Mongo ObjectId string."),
    body("description")
      .optional()
      .isString()
      .withMessage("description must be a string if provided."),
    body("status")
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(
        `status must be one of: ${VALID_STATUSES.join(", ")} if provided.`
      ),
    body("priority")
      .optional()
      .isIn(VALID_PRIORITIES)
      .withMessage(
        `priority must be one of: ${VALID_PRIORITIES.join(", ")} if provided.`
      ),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "Task validation error (create)");
      }
      next();
    },
  ];
};

validate.updateTaskRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("name must be a non-empty string if provided."),
    body("listId")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("listId must be a valid Mongo ObjectId string if provided."),
    body("description")
      .optional()
      .isString()
      .withMessage("description must be a string if provided."),
    body("status")
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(
        `status must be one of: ${VALID_STATUSES.join(", ")} if provided.`
      ),
    body("priority")
      .optional()
      .isIn(VALID_PRIORITIES)
      .withMessage(
        `priority must be one of: ${VALID_PRIORITIES.join(", ")} if provided.`
      ),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "Task validation error (update)");
      }
      next();
    },
  ];
};

/* =============== USERS (admin) =============== */

validate.createUserRules = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("name is required and must be a non-empty string."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required.")
      .bail()
      .isEmail()
      .withMessage("email must be a valid email address."),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage('role must be either "user" or "admin" if provided.'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "User validation error (create)");
      }
      next();
    },
  ];
};

validate.updateUserRules = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("name must be a non-empty string if provided."),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("email must be a valid email address if provided."),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage('role must be either "user" or "admin" if provided.'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErrors(res, errors, "User validation error (update)");
      }
      next();
    },
  ];
};

module.exports = validate;