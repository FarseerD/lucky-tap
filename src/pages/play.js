import * as React from "react";
import {Helmet} from "react-helmet";
import PubNub from "pubnub";
import {PubNubProvider, usePubNub} from "pubnub-react";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";

import {getPlayerId} from "../utils/utils";
import {CHANNEL} from "../utils/constants";
import ErrorMessage from "../components/ErrorMessage";

import "../styles/play.less";

const pubnub = new PubNub({
  publishKey: "pub-c-060c29b8-e235-4486-9f89-2fc580a81a5a",
  subscribeKey: "sub-c-5daf57bc-3d40-11ec-8182-fea14ba1eb2b",
  uuid: getPlayerId(),
});

const PLAYER_NAME_KEY = "farseerd-lucky-tap-local-player-name";

function NameMask({onSuccess, onError}) {
  const pubnub = usePubNub();
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function joinChannel(name) {
    window.localStorage.setItem(PLAYER_NAME_KEY, name);
    return pubnub.publish({
      message: {
        type: "join",
        name,
      },
      channel: CHANNEL,
    });
  }

  async function handleJoin() {
    setLoading(true);
    try {
      await joinChannel(name);
      onSuccess();
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mask">
      <TextField
        id="standard-basic"
        label="Enter your name"
        variant="standard"
        size="large"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <LoadingButton
        variant="contained"
        size="large"
        onClick={handleJoin}
        loading={loading}
      >
        Join
      </LoadingButton>
    </div>
  );
}

function ReadyMask() {
  const localName = window.localStorage.getItem(PLAYER_NAME_KEY);
  return (
    <div className="mask">
      <div className="ready-title">Welcome {localName}</div>
      <div className="ready-subtitle">Waiting...</div>
    </div>
  );
}

function PlayApp() {
  const pubnub = usePubNub();
  const localName = window.localStorage.getItem(PLAYER_NAME_KEY);
  const [status, setStatus] = React.useState(localName ? "ready" : "name");
  const [error, setError] = React.useState("");

  function handleMessage(m) {

  }

  React.useEffect(() => {
    pubnub.addListener({
      message: handleMessage,
    });

    pubnub.subscribe({
      channels: [CHANNEL],
      withPresence: true,
    });
  }, [pubnub]);

  function joinChannel(name) {
    window.localStorage.setItem(PLAYER_NAME_KEY, name);
    return pubnub.publish({
      message: {
        type: "join",
        name,
      },
      channel: CHANNEL,
    });
  }

  function subscribeChannel() {
    return pubnub.subscribe({
      channels: [CHANNEL],
      withPresence: true,
    });
  }

  function handleNameSuccess() {
    setError("");
    setStatus("ready");
    pubnub.subscribe({
      channels: [CHANNEL],
      withPresence: true,
    });
  }

  function handleNameError(e) {
    setError(e.message);
  }

  if (localName) {
    joinChannel(localName);
    subscribeChannel();
  }

  return (
    <>
      <ErrorMessage message={error} />
      {status === "name" && (
        <NameMask onSuccess={handleNameSuccess} onError={handleNameError} />
      )}
      {status === "ready" && <ReadyMask />}
    </>
  );
}

export default function Play() {
  return (
    <PubNubProvider client={pubnub}>
      <Helmet>
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;"
          name="viewport"
        />
        <title>Lucky Tap</title>
      </Helmet>
      <PlayApp />
    </PubNubProvider>
  );
}
