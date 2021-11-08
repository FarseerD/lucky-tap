import * as React from "react";
import {Helmet} from "react-helmet";
import PubNub from "pubnub";
import {PubNubProvider, usePubNub} from "pubnub-react";
import Button from "@mui/material/Button";

import {
  getManagerId,
  getNextColor,
  setLocalName,
  getLocalName,
} from "../utils/utils";
import {CHANNEL} from "../utils/constants";
import "../styles/manage.less";

const UUID = getManagerId();

const pubnub = new PubNub({
  publishKey: "pub-c-060c29b8-e235-4486-9f89-2fc580a81a5a",
  subscribeKey: "sub-c-5daf57bc-3d40-11ec-8182-fea14ba1eb2b",
  uuid: UUID,
});

const DEFAULT_USER = {
  uuid: "",
  name: "",
  color: "",
  online: false,
};

function getOrAdd(users = new Map(), uuid) {
  if (uuid === UUID) return users;
  let user = users.get(uuid);
  if (!user) {
    user = {
      ...DEFAULT_USER,
      uuid,
      color: getNextColor(),
    };
    users.set(uuid, users);
  }
  return new Map(users);
}

function setOrAdd(users = new Map(), uuid, props) {
  if (uuid === UUID) return users;
  let user = users.get(uuid);
  if (!user) {
    user = {
      ...DEFAULT_USER,
      uuid,
      color: getNextColor(),
    };
    users.set(uuid, users);
  }
  for (let k in props) {
    user[k] = props[k];
  }
  users.set(uuid, user);
  return new Map(users);
}

function OnlineUsers({users}) {
  return (
    <div className="users">
      {[...users.values()]
        .filter((user) => user.online)
        .map((user) => (
          <div
            className="user"
            style={{backgroundColor: user.color}}
            key={user.uuid}
          >
            {user.name}
          </div>
        ))}
    </div>
  );
}

function ManageApp() {
  const pubnub = usePubNub();
  const [users, setUsers] = React.useState(new Map());

  function handleMessage(m) {
    console.log(m);
    const {publisher, message} = m;
    if (message.type === "join") {
      setUsers((users) =>
        setOrAdd(users, publisher, {
          name: message.name,
        })
      );
      setLocalName(publisher, message.name);
    }
  }

  function handlePresence(p) {
    console.log(p);
    const {uuid, action} = p;
    setUsers((users) =>
      setOrAdd(users, uuid, {
        online: action === "join",
      })
    );
  }

  React.useEffect(() => {
    async function fn() {
      const {channels} = await pubnub.hereNow({
        channels: [CHANNEL],
      });
      const {occupants} = channels[CHANNEL];
      const _users = new Map();
      occupants.forEach((user) => {
        setOrAdd(_users, user.uuid, {
          name: getLocalName(user.uuid) || "unknown user",
          online: true,
        });
      });
      setUsers(_users);
    }
    fn();
  }, [pubnub]);

  React.useEffect(() => {
    pubnub.addListener({
      message: handleMessage,
      presence: handlePresence,
    });

    pubnub.subscribe({
      channels: [CHANNEL],
      withPresence: true,
    });
  }, [pubnub]);

  async function handleStart() {
    pubnub.publish({
      channel: CHANNEL,
      message: {
        type: "start",
      },
    });
  }

  return (
    <div className="mask">
      <div className="title">Lucky Tap</div>
      <div className="subtitle">Tap the button quickly and passionately!</div>
      <OnlineUsers users={users} />
      <Button variant="contained" size="large" onClick={handleStart}>
        Start
      </Button>
    </div>
  );
}

export default function Manage() {
  return (
    <PubNubProvider client={pubnub}>
      <Helmet>
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;"
          name="viewport"
        />
        <title>Lucky Tap Controller</title>
      </Helmet>
      <ManageApp />
    </PubNubProvider>
  );
}
