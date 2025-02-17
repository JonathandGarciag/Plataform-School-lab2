import { Schema, model } from "mongoose";

const courseSchema = Schema({
    nameCourse: {
        type: String,
        required: [true, "Name is required"],
        maxLenght: [25, "Max is 25 characters"]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);


export default model('Course', courseSchema);