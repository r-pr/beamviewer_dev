# functional spec

User opens page.

 If session_id is not found in local storage, he sees a button
"create new session", if found "resume session" and "create new session".

Below is input for sess_id, nickname and button "Join session"

## broadcasting

If clicks "resume" - use old sess_id, otherwise - create new.

Then ask permission for video capture, start capture, open ws-connection,
associate ws with sess_id, then signalign as usual.

## watching

Join session -> open ws -> connect to machine with specified sess_id.

# technical spec

All "clients" directly connect to broadcaster (star topology).
Drawback: too much traffic for broadcaster maching.
Pro: simple.

session_id is generated on client side.

then ws conversation:

```
client                                               server
     -----------login (sess_id: 0xdeadbeef)----------->
     <-----login_resp (status: err, err: sess_id_taken)
     -----------login (sess_id: 0xdeadc0de)----------->
     <-----login_resp (status: ok)---------------------

     // then as in textbook
```