Дипломный проект.

https://beamviewer22.herokuapp.com/

TODO:

* добавить ТУРН-сервер

* SubScreen.tsx
  * закрывать все подключения, когда нажимается крестик

* когда паблишер на домашнем, а субскрайбер на рабочем (хром), то в последнем попадает в консоль
Uncaught (in promise) DOMException: Failed to execute 'addIceCandidate' on 'RTCPeerConnetion': Error processing ICE candidate.

* бэкэнд
  * переписать по-православному на тайпскрипте
  * сделать так, чтоб работало между домашним и рабочим компом. возможный хинт:
  вылазит ошибка ICE failed, add a TURN server and see about:webrtc for more details
  хотя 2 стун сервера уже есть в опциях.
  * возможно добавить хттп-запросы? (создаие сессии, проверка наличия сессии и т.д.)
