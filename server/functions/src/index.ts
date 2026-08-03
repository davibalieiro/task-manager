import { onRequest } from "firebase-functions/v2/https";

import { register } from "./modules/auth/presentation/register";
import { login } from "./modules/auth/presentation/login";
import { me } from "./modules/auth/presentation/me";
import { logout } from "./modules/auth/presentation/logout";
import { session } from "./modules/auth/presentation/session/session";

import { listTasks } from "./modules/tasks/presentation/listTasks";
import { createTask } from "./modules/tasks/presentation/createTask";
import { updateTask } from "./modules/tasks/presentation/updateTask";
import { toggleTask } from "./modules/tasks/presentation/toggleTask";
import { deleteTask } from "./modules/tasks/presentation/deleteTask";

import { listProjects } from "./modules/projects/presentation/listProjects";
import { createProject } from "./modules/projects/presentation/createProject";
import { getProject } from "./modules/projects/presentation/getProject";
import { updateProject } from "./modules/projects/presentation/updateProject";
import { deleteProject } from "./modules/projects/presentation/deleteProject";

import { listHabits } from "./modules/habits/presentation/listHabits";
import { createHabit } from "./modules/habits/presentation/createHabit";
import { updateHabit } from "./modules/habits/presentation/updateHabit";
import { deleteHabit } from "./modules/habits/presentation/deleteHabit";

import { listGoals } from "./modules/goals/presentation/listGoals";
import { createGoal } from "./modules/goals/presentation/createGoal";
import { updateGoal } from "./modules/goals/presentation/updateGoal";
import { deleteGoal } from "./modules/goals/presentation/deleteGoal";

const routes: Record<string, (req: any, res: any) => void | Promise<void>> = {
  register,
  login,
  me,
  logout,
  session,
  listTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,

};

export const api = onRequest({ cors: true }, async (req, res) => {
  const path = req.path.replace(/^\//, "").split("?")[0];
  const handler = routes[path];

  if (!handler) {
    res.status(404).json({ message: `Rota não encontrada: ${path}` });
    return;
  }

  return handler(req, res);
});
