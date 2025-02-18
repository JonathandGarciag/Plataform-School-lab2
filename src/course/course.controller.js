import { response, request } from "express";
import Course from '../course/course.model.js';
import User from '../users/user.model.js'

const MAX_CURSOS_POR_USUARIO = 3;

export const createCourse = async (req, res) => {
    console.log("Petición recibida en createCourse", req.body, req.user);

    try {
        if (!req.user) {
            console.error("Error: req.user es undefined");
            return res.status(401).json({ msg: "Usuario no autenticado." });
        }

        if (req.user.role !== "TEACHER_ROLE") {
            console.error("Acceso denegado: el usuario no tiene TEACHER_ROLE", req.user);
            return res.status(403).json({ msg: "Solo los profesores pueden crear cursos." });
        }

        const teacher = req.user.id;
        console.log("Usuario autenticado con ID:", teacher);

        const { nameCourse, description } = req.body;
        if (!nameCourse || !description) {
            console.error("Error: nameCourse o description están vacíos");
            return res.status(400).json({ msg: "Faltan campos obligatorios." });
        }

        console.log("Verificando número de cursos del profesor...");
        const totalCursosUsuario = await Course.countDocuments({ teacher });
        if (totalCursosUsuario >= 3) {
            console.error("Error: Se alcanzó el límite de cursos permitidos.");
            return res.status(400).json({ msg: `El usuario ya tiene el máximo de 3 cursos.` });
        }

        console.log("Creando curso en la base de datos...");
        const nuevoCurso = new Course({ nameCourse, description, teacher });
        await nuevoCurso.save();
        console.log("Curso creado con éxito:", nuevoCurso);

        res.json(nuevoCurso);
    } catch (error) {
        console.error("Error en createCourse:", error); 
        res.status(500).json({ msg: "Error al crear el curso", error });
    }
};


export const updateCourse = async (req, res) => {
    try {
        if (req.user.role !== "TEACHER_ROLE") {
            return res.status(403).json({ msg: "Solo los profesores pueden modificar cursos." });
        }

        const { id } = req.params;
        const { nameCourse, description } = req.body;
        const curso = await Course.findById(id);

        if (!curso) {
            return res.status(404).json({ msg: "Curso no encontrado." });
        }

        if (curso.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para modificar este curso." });
        }

        curso.nameCourse = nameCourse;
        curso.description = description;
        await curso.save();

        await User.updateMany({ courses: id }, { $set: { "courses.$": curso } });

        res.json({ msg: "Curso actualizado correctamente." });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el curso", error });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        if (req.user.role !== "TEACHER_ROLE") {
            return res.status(403).json({ msg: "Solo los profesores pueden eliminar cursos." });
        }

        const { id } = req.params;
        const curso = await Course.findById(id);

        if (!curso) {
            return res.status(404).json({ msg: "Curso no encontrado." });
        }

        if (curso.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar este curso." });
        }

        await User.updateMany({ courses: id }, { $pull: { courses: id } });
        await Course.findByIdAndDelete(id);

        res.json({ msg: "Curso eliminado correctamente y desasignado de los alumnos." });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el curso", error });
    }
};

export const getCourses = async (req, res) => {
    try {
        if (req.user.role !== "TEACHER_ROLE") {
            return res.status(403).json({ msg: "Solo los profesores pueden ver los cursos." });
        }

        const courses = await Course.find({ teacher: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los cursos", error });
    }
};

export const joinCourse = async (req, res) => {
    try {
        if (req.user.role !== "STUDENT_ROLE") {
            return res.status(403).json({ msg: "Solo los estudiantes pueden unirse a cursos." });
        }

        const studentId = req.user.id;
        const courseId = req.params.id;

        const curso = await Course.findById(courseId);
        if (!curso) {
            return res.status(404).json({ msg: "Curso no encontrado." });
        }

        if (curso.students.includes(studentId)) {
            return res.status(400).json({ msg: "Ya estás inscrito en este curso." });
        }

        const studentCourses = await Course.countDocuments({ students: studentId });
        if (studentCourses >= 3) {
            return res.status(400).json({ msg: "No puedes inscribirte a más de 3 cursos." });
        }

        curso.students.push(studentId);
        await curso.save();

        res.json({ msg: "Te has inscrito en el curso con éxito.", curso });
    } catch (error) {
        res.status(500).json({ msg: "Error al inscribirse en el curso", error });
    }
};

export const getStudentCourses = async (req, res) => {
    try {
        if (req.user.role !== "STUDENT_ROLE") {
            return res.status(403).json({ msg: "Solo los estudiantes pueden ver sus cursos." });
        }

        const studentId = req.user.id;
        const cursos = await Course.find({ students: studentId });

        res.json(cursos);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los cursos del estudiante", error });
    }
};
