import {analyze} from './analyze.mock';
import {auth} from './auth.mock';
import {health} from './health.mock';
import {task, tasks} from './tasks.mock';
// TODO: mocky mocky
import {transactions} from '../api/transactions.ts';
import {oauthCallback} from '../api/oauth.ts';
import {createUser} from '../api/createuser.ts';

type ApiMethods = typeof import('../api').default;

export default {
  analyze,
  auth,
  health,
  tasks,
  task,
  transactions,
  oauthCallback,
  createUser,
} satisfies ApiMethods;
