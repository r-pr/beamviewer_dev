Дипломный проект

TODO:
-написать тане про process.env.NODE_ENV
--SubScreen.tsx
---закрывать все подключения, когда нажимается крестик
дорабатывать в1
--на хероку вебсокет паблишера обрывается секунд через 15 после подключения.
  паблишер удаляется из списка, никто больше подключится не может.
  надо хранить айди сессии дольше, а паблишер должен переконекчиваться.
  UPD: сейчас паблишер при перелогине присылает тот же айди сессии.
  UPD2: хранить не только айди, но и связанную инфу: оффер, кандидатов.
--сейчас подключится может только 1 клиент. для второго видимо нужно создавать
  отдельную ртс-пир-конекшен. - joiner всегда отправляет свой ник, для каждого
  ника паблишер создает подключение.
--когда паблишер на компе в ниокре, то я со своего компа дома не могу установить
  подкл. ошибка ICE failed, add a STUN server and see about:webrtc for more details
  хотя 2 стун сервера уже есть в опциях.