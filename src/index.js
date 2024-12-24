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

// Инициализируем клиент и присоединяемся к комнате
async function initClient() {
  // Создаём gRPC-Web сигнал
  const signal = new IonSFUJSONRPCSignal(sfuUrl);

  // Создаём основного клиента
  client = new Client(signal);

  // Обработчик на входящие треки
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

  // Ждём, пока сигнальный канал откроется (signal.open())
  await signal.open();

  // Присоединяемся к комнате
  await client.join(roomId);
  console.log("[INFO] Joined room:", roomId);
}

// Старт локальной камеры
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

    // Публикуем поток
    await client.publish(localStream);
    console.log("[INFO] Local stream published");
  } catch (err) {
    console.error("[ERROR]", err);
  }
}

// Остановка локального видео
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

// Вешаем обработчики на кнопки
startBtn.addEventListener("click", startVideo);
stopBtn.addEventListener("click", stopVideo);
