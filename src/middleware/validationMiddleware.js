import joi from "joi";

export const registerValidator = async (req, res, next) => {
  const Schema = joi.object({
    firstName: joi
      .string()
      .required()
      .min(3)
      .trim()
      .regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/)
      .messages({
        "any.required": "Please provide firstName",
        "string.empty": "FirstName cannot be empty",
        "string.min": "The minimum name must be at least 3 characters long",
        "string.pattern.base":
          "First name should only contain letters, spaces, hyphens, or apostrophes",
      }),

    lastName: joi
      .string()
      .required()
      .min(3)
      .trim()
      .regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/)
      .messages({
        "any.required": "Please provide lastName",
        "string.empty": "LastName cannot be empty",
        "string.min": "The minimum name must be at least 3 characters long",
        "string.pattern.base":
          "Last name should only contain letters, spaces, hyphens, or apostrophes",
      }),

    email: joi.string().email().min(8).required().messages({
      "any.required": "Please provide your email address",
      "string.empty": "Email cannot be empty",
      "string.email":
        "Invalid email format. Please enter a valid email address",
    }),

    password: joi
      .string()
      .required()
      .min(8)
      .max(50)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
      )
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.empty":
          "Password cannot be empty, must be at least 8 characters and a maximum of 50 characters",
      }),

    confirmPassword: joi
      .string()
      .required()
      .valid(joi.ref("password"))
      .messages({
        "any.only": "Confirm password must match password",
        "string.empty": "Confirm password cannot be empty",
      }),

    role: joi.string().required().messages({
      "string.empty": "Role cannot be left empty",
      "any.required": "Role is required",
    }),

    gender: joi.string().trim().valid("male", "female").required().messages({
      "string.empty": "Gender cannot be left empty",
      "any.required": "Gender is required and can only be either male or female",
    }),

    dateOfBirth: joi
      .date()
      .iso()
      .less("now")
      .required()
      .messages({
        "date.base": "Invalid date format. Please provide a valid date",
        "date.less": "Date of birth must be a past date",
        "any.required": "Date of birth is required",
      }),

    phoneNumber: joi
      .string()
      .trim()
      .length(11)
      .required()
      .regex(/^(?:\+234|0)(70|80|81|90|91)[0-9]{8}$/)
      .messages({
        "string.length": "Phone number must be exactly 11 digits",
        "string.pattern.base": "Invalid phone number format",
        "any.required": "Phone number is required",
      }),

    address: joi.string().required().messages({
      "string.empty": "Address cannot be left empty",
      "any.required": "Address is required",
    }),
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  next();
};


export const loginValidation = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validating email and password
    const emailSchema = joi.object({
      email: joi.string().email().lowercase().required().messages({
        "any.required": "Please provide your email address",
        "string.empty": "Email cannot be empty",
        "string.email":
          "Invalid email format! Please enter a valid email address",
      }),
    });
    const { email: emailError } = emailSchema.validate({ email });
    if (emailError) {
      return res.status(400).json({
        message: emailError.details[0].message,
      });
    }
    if (!password) {
      return res.status(400).json({
        message: `Please enter your password`,
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      status: `Server error`,
      message: error.message,
    });
  }
};

export const healthWorkerProfessionalProfileValidator = async (
  req,
  res,
  next
) => {
  const Schema = joi.object({
    role: joi.string().required().messages({
      "string.empty": "Role cannot be left empty",
      "any.required": "Role is required",
    }),

    Specialization: joi.string().required().messages({
      "string.empty": "Specialization cannot be left empty",
      "any.required": "Specialization is required",
    }),

    Qualifications: joi.string().required().messages({
      "string.empty": "Qualifications cannot be left empty",
      "any.required": "Qualifications is required",
    }),

    WorkExperience: joi.string().required().messages({
      "string.empty": "WorkExperience cannot be left empty",
      "any.required": "WorkExperience is required",
    }),
  });
  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  next();
};

export const validateBPMeasurement = async (req, res, next) => {
  const measurementSchema = joi.object({
    systolic: joi.number().integer().required().messages({
      "number.base": "Systolic must be a number",
      "number.integer": "Systolic must be an integer",
      "any.required": "Systolic is required",
    }),

    diastolic: joi.number().integer().required().messages({
      "number.base": "Diastolic must be a number",
      "number.integer": "Diastolic must be an integer",
      "any.required": "Diastolic is required",
    }),

    heartRate: joi.number().integer().required().messages({
      "number.base": "Heart rate must be a number",
      "number.integer": "Heart rate must be an integer",
      "any.required": "Heart rate is required",
    }),

    measurementLocation: joi.string().required().messages({
      "string.base": "Measurement location must be a string",
      "any.required": "Measurement location is required",
    }),

    measuredBy: joi.string().required().messages({
      "string.base": "Measured by must be a string",
      "any.required": "Measured by is required",
    }),

    patientId: joi.string()
      .guid({ version: ["uuidv4"] })
      .required()
      .messages({
        "string.base": "User ID must be a string",
        "string.guid": "User ID must be a valid UUID",
        "any.required": "User ID is required",
      }),
  });

  const { error } = measurementSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({
        message: error.details?.[0]?.message || "Invalid BP measurement data",
      });
  }

  next();
};

export const validateConsultation = async (req, res, next) => {
  const consultationSchema = joi.object({
    healthWorkerId: joi.string().uuid().required().messages({
      "string.base": "Health Worker ID must be a string",
      "string.guid": "Health Worker ID must be a valid UUID",
      "any.required": "Health Worker ID is required",
    }),

    userId: joi.string().uuid().required().messages({
      "string.base": "User ID (Patient ID) must be a string",
      "string.guid": "User ID (Patient ID) must be a valid UUID",
      "any.required": "User ID (Patient ID) is required",
    }),

    consultationNotes: joi.string().required().messages({
      "string.base": "Consultation notes must be a string",
      "string.empty": "Consultation notes cannot be empty",
      "any.required": "Consultation notes are required",
    }),

    prescription: joi.string().optional().messages({
      "string.base": "Prescription must be a string",
    }),

    allergies: joi.string().optional().messages({
      "string.base": "Allergies must be a string",
    }),

    sideEffects: joi.string().optional().messages({
      "string.base": "Side effects must be a string",
    }),
  });

  // Validate request body
  const { error } = consultationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((err) => err.message), // Return all errors
    });
  }

  next(); // ✅ Call next() when validation passes
};
