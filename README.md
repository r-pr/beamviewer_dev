Дипломный проект.

https://beamviewer22.herokuapp.com/

TURN-сервер: https://numb.viagenie.ca/

TODO:

* сделать юзер френдли:
  * основное меню по центру
  * создание сессии нажатием на ентер
  * крестик закрытия покрасивее
  * задавать ширину - высоту видео, чтоб всегда вмещалось на экран
  * показывать субскрайберам, что трансляция прекращена
  * на паблишере показывать кол-во подключенных пользователей
    * по вебсокету отправлять уведомление о коннекте/дисконнекте субскрайбера

* добавить передачу аудио

* добавить ТУРН-сервер
  * upd1: добавил numb.viagenie.ca, после этого появилась новая ошибка: 
    ICE failed, your TURN server appears to be broken, see about:webrtc for more details

* SubScreen.tsx
  * закрывать все подключения, когда нажимается крестик

* когда паблишер на домашнем, а субскрайбер на рабочем (хром), то в последнем попадает в консоль
Uncaught (in promise) DOMException: Failed to execute 'addIceCandidate' on 'RTCPeerConnetion': Error processing ICE candidate.

* бэкэнд
  * переписать по-православному на тайпскрипте
  * сделать так, чтоб работало между домашним и рабочим компом. возможный хинт:
  вылазит ошибка ICE failed, add a TURN server and see about:webrtc for more details
