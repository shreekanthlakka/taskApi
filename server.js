const express = require("express");
const mongoose = require("mongoose");
const { checkSchema, validationResult } = require("express-validator");
const app = express();
const PORT = 8500;

app.use(express.json());

const URI = "mongodb://127.0.0.1:27017/taskApi2";

mongoose
    .connect(URI)
    .then(() => {
        console.log(`task app connected on ${PORT} port`);
    })
    .catch((err) => {
        console.log("ERROR!!!!", err);
    });

const taskSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        status: String,
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

//validationSchema

const taskValidationSchema = {
    title: {
        in: ["body"],
        notEmpty: {
            errorMessage: " title cannt be empty",
        },
        exists: {
            errorMessage: " title required",
        },
        isLength: {
            options: { min: 5 },
            errorMessage: "title should be least 5 character",
        },
        custom: {
            options: function (value) {
                return Task.findOne({ title: value })
                    .then((task) => {
                        if (task) {
                            throw new Error("title alredy exists");
                        } else {
                            return true;
                        }
                    })
                    .catch((err) => {
                        throw new Error("Internal server error: ${err}");
                    });
            },
        },
    },
    description: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Description cannt be empty",
        },
        exists: {
            errorMessage: "description required",
        },
        isLength: {
            options: { min: 5 },
            errorMessage: " description must be include atleast 5 character",
        },
    },
    status: {
        in: ["body"],
        notEmpty: {
            errorMessage: " status cannt be empty",
        },
        exists: {
            errorMessage: "status required",
        },
        isIn: {
            options: [["pending", "in progress", "completed"]],
            errorMessage:
                "status should be one of (pending,progress,completed)",
        },
    },
};

const updateValidationSchema = {
    title: {
        in: ["body"],
        notEmpty: {
            errorMessage: " title cannt be empty",
        },
        exists: {
            errorMessage: " title required",
        },
        isLength: {
            options: { min: 5 },
            errorMessage: "title should be least 5 character",
        },
    },
    description: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Description cannt be empty",
        },
        exists: {
            errorMessage: "description required",
        },
        isLength: {
            options: { min: 5 },
            errorMessage: " description must be include atleast 5 character",
        },
    },
    status: {
        in: ["body"],
        notEmpty: {
            errorMessage: " status cannt be empty",
        },
        exists: {
            errorMessage: "status required",
        },
        isIn: {
            options: [["pending", "progress", "completed"]],
            errorMessage:
                "status should be one of (pending,progress,complered)",
        },
    },
};

const idValidationSchema = {
    id: {
        in: ["params"],
        isMongoId: {
            errorMessage: "should be a valid mongodb id",
        },
    },
};

//   app.post('/tasks', checkSchema(taskValidationSchema), (req, res) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }

//     const body = req.body
//     const data = new Data(body)
//     data.save(body)

//         .then((obj) => {
//             res.status(201).json(obj)
//         })
//         .catch((err) => {
//             res.status(500).json({ error: 'Internal Server Error' })
//         })
// })

app.post("/tasks", checkSchema(taskValidationSchema), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    Task.create(req.body)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) =>
            res.status(400).json({ error: "internal server error" })
        );
});

app.get("/tasks", (req, res) => {
    Task.find({})
        .then((task) => {
            res.status(201).json({ data: task, success: true });
        })
        .catch((err) => {
            res.status(500).json({ error: "internal server error" });
        });
});

app.get("/tasks/:id", checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    Task.findById(req.params.id)
        .then((task) => {
            if (!task) {
                res.status(404).json({ data: null });
            } else {
                res.status(201).json({ data: task, success: true });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal error" });
        });
});

app.put("/tasks/:id", checkSchema(updateValidationSchema), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const body = req.body;
    Task.findByIdAndUpdate(req.params.id, body, { new: true })
        .then((task) => {
            if (!task) {
                res.status(404).json({ data: null });
            } else {
                res.status(201).json({ success: true, data: task });
            }
        })
        .catch((err) => {
            res.status(500).json({ errors: "Internal Server Error" });
        });
});

app.delete("/tasks/:id", checkSchema(idValidationSchema), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    Task.findByIdAndDelete(req.params.id)
        .then((task) => {
            if (task) {
                res.status(404).json({});
            } else {
                res.status(204).json(task);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Internal error" });
        });
});

//port listen
app.listen(PORT, () => {
    console.log(`connected to the port,${PORT}`);
});
