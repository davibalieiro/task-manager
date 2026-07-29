import { setGlobalOptions } from "firebase-functions";

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

import { listTags } from "./modules/tags/presentation/listTags";
import { createTag } from "./modules/tags/presentation/createTag";
import { updateTag } from "./modules/tags/presentation/updateTag";
import { deleteTag } from "./modules/tags/presentation/deleteTag";
import { assignTag } from "./modules/tags/presentation/assignTag";
import { unassignTag } from "./modules/tags/presentation/unassignTag";
import { listTaskTags } from "./modules/tags/presentation/listTaskTags";

setGlobalOptions({ maxInstances: 10, cpu: 0.167 });

export {
  // Auth
  register,
  login,
  me,
  logout,
  session,
  // Tasks
  listTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  // Projects
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  // Habits
  listHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  // Goals
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  // Tags
  listTags,
  createTag,
  updateTag,
  deleteTag,
  assignTag,
  unassignTag,
  listTaskTags,
};
