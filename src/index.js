import { Client, LocalStream } from 'ion-sdk-js';
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl';

const sfuUrl = "wss://127.0.0.1:7000/ws";
const roomId = "test-room";

let client = null;
let localStream = null;

const startBtn = document.getElementById("btn-start");
const stopBtn = document.getElementById("btn-stop");
const localVideo = document.getElementById("localVideo");
const remoteContainer = document.getElementById("remoteContainer");

async function initClient() {
  const signal = new IonSFUJSONRPCSignal(sfuUrl);
  client = new Client(signal);

  // При поступлении новых треков
  client.ontrack = (track, stream) => {
    console.log("[INFO] Got remote track:", track.kind);
    const remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.srcObject = stream;
    remoteContainer.appendChild(remoteVideo);

    track.onended = () => {
      console.log("[INFO] Remote track ended");
      remoteVideo.remove();
    };
  };

  // JSON-RPC сигнал сам вызовет этот коллбек, когда WebSocket откроется
  signal.onopen = async () => {
    await client.join(roomId);
    console.log("[INFO] Joined room:", roomId);
  };
}

async function startVideo() {
  if (!client) {
    await initClient();
  }
  if (localStream) {
    console.warn("[WARN] Local stream is already started");
    return;
  }
  try {
    // Запрашиваем камеру/микрофон
    localStream = await LocalStream.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = localStream;

    // Ждём, пока SFU не будет joined — иначе publish упадёт
    // Можно проверить какое-то состояние, или подождать несколько сотен мс.
    await client.publish(localStream);
    console.log("[INFO] Local stream published");
  } catch (err) {
    console.error("[ERROR]", err);
  }
}

function stopVideo() {
  if (!localStream) {
    console.warn("[WARN] No local stream to stop");
    return;
  }
  localStream.getTracks().forEach(track => track.stop());
  localStream = null;
  localVideo.srcObject = null;
  console.log("[INFO] Local stream stopped");
}

startBtn.addEventListener("click", startVideo);
stopBtn.addEventListener("click", stopVideo);
