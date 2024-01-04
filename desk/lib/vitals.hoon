/-  vitals
|%
++  simplify-qos
  |=  =ship-state:ames
  ^-  qos:ames
  ?-  -.ship-state
    %alien  [%dead *@da]
    %known  ?+  -.qos.ship-state  qos.ship-state
              %unborn   [%dead last-contact.qos.ship-state]
  ==        ==
++  scry-qos
  |=  [=ship now=@da tick=@ud peer=ship]
  ^-  qos:ames
  %-  simplify-qos
  .^  ship-state:ames
      %ax
      (scot %p ship)
      %$
      (en-cose da+now ud+tick)
      %peers
      (scot %p peer)
      ~
  ==
--
