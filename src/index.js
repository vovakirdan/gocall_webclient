/**
 * This file is the main entry for your Ion-SFU client (ES Modules).
 * We'll build it with Webpack into "dist/bundle.js".
 */

// Импорт из ion-sdk-js:
import { 
    Client,
    LocalStream
  } from 'ion-sdk-js';
  import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl';
  
  const sfuUrl = "wss://127.0.0.1:50051/ws"; // <-- Замените на ваш реальный SFU endpoint
  const roomId = "test-room";
  
  /** @type {Client} */
  let client = null;
  /** @type {MediaStream} */
  let localStream = null;
  
  // Создадим элемент <div> через JS (можно и в HTML вынести)
  const root = document.createElement("div");
  root.innerHTML = `
    <h1>Ion-SFU Client (webpack build)</h1>
    <button id="startBtn">Start</button>
    <button id="stopBtn">Stop</button>
    <video id="localVideo" autoplay playsinline muted></video>
    <div id="remoteContainer"></div>
  `;
  document.body.appendChild(root);
  
  // Находим элементы
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const localVideo = document.getElementById("localVideo");
  const remoteContainer = document.getElementById("remoteContainer");
  
  /**
   * Initialize SFU client and join the room.
   * @returns {Promise<void>}
   */
  async function initClient() {
    // Создаём JSON-RPC сигнал
    const signal = new IonSFUJSONRPCSignal(sfuUrl);
    // Создаём клиента
    client = new Client(signal);
  
    // Подписываемся на входящие треки (от удалённых)
    client.ontrack = (track, stream) => {
      console.log("[INFO] Remote track received:", track.kind);
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
  
    // Ждём, пока сигнал откроется, затем join:
    signal.onopen = async () => {
      await client.join(roomId, "test-user");
      console.log("[INFO] Joined room:", roomId);
    };
  }
  
  /**
   * Start local stream and publish.
   * @returns {Promise<void>}
   */
  async function startVideo() {
    if (!client) {
      await initClient();
    }
    if (localStream) {
      console.warn("[WARN] Already started local stream");
      return;
    }
    try {
      localStream = await LocalStream.getUserMedia({
        video: true,
        audio: true,
        simulcast: false
      });
      localVideo.srcObject = localStream;
      await client.publish(localStream);
      console.log("[INFO] Local stream published");
    } catch (err) {
      console.error("[ERROR]", err);
    }
  }
  
  /**
   * Stop local stream.
   */
  function stopVideo() {
    if (!localStream) {
      console.warn("[WARN] No local stream to stop");
      return;
    }
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    localVideo.srcObject = null;
    console.log("[INFO] Local stream stopped");
  }
  
  // Повесим обработчики
  startBtn.addEventListener("click", startVideo);
  stopBtn.addEventListener("click", stopVideo);
  