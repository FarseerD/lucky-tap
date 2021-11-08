import {v4 as uuidv4} from "uuid";

function getId(type) {
  const KEY = `farseerd-lucky-tap-local-uuid-${type}`;
  const localId = window.localStorage.getItem(KEY);
  if (localId) return localId;

  const id = uuidv4();
  window.localStorage.setItem(KEY, id);
  return id;
}

export function getPlayerId() {
  return getId("player");
}

export function getManagerId() {
  return getId("manager");
}

const colors = [
  "#ef5350",
  "#42a5f5",
  "#9ccc65",
  "#ffca28",
  "#66bb6a",
  "#5c6bc0",
  "#ffa726",
  "#d4e157",
  "#29b6f6",
  "#ec407a",
  "#26a69a",
  "#ab47bc",
  "#26c6da",
  "#7e57c2",
  "#aaaaaa",
];

export const getNextColor = (function () {
  let now = 0;
  return function () {
    now++;
    return colors[now % colors.length];
  };
})();

const NAME_KEY_PREFIX = `farseerd-lucky-tap-user-name-`;
export function getLocalName(uuid) {
  return window.localStorage.getItem(`${NAME_KEY_PREFIX}${uuid}`);
}

export function setLocalName(uuid, name) {
  window.localStorage.setItem(`${NAME_KEY_PREFIX}${uuid}`, name);
}
