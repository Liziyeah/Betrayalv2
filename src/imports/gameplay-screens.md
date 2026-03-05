Use the existing visual style of the project (dark UI, red gradients, glowing cards, rounded buttons).

Create the missing gameplay screens and connect them to the existing round flow.

Mobile portrait layout.

SCREEN — Secret Action Selection

Title: "Elegir acción secreta"

Instruction text:
"Selecciona una acción y elige a qué jugador aplicarás el efecto."

Main layout:
A grid of 4 action cards

Actions:

Proteger
Icon: shield
Description: "Protege a un jugador para que no pierda vida"

Traicionar
Icon: dagger
Description: "Un jugador pierde 1 vida adicional"

Investigar
Icon: eye
Description: "Descubre el número de un jugador"

Negociar
Icon: handshake
Description: "Si ambos negocian, ganan 1 vida"

Interaction:

Tap action → open player selection overlay

Player selection:
Show avatars of players in the lobby.

After selecting:
Show confirmation button:

Confirmar acción

After confirming:
Navigate to Waiting for players screen

SCREEN — Waiting for Players

Title: "Esperando jugadores"

Content:

Loader animation

Text:
"Esperando a que todos elijan su acción"

Display player list with status indicators:

✓ Acción elegida
⏳ Esperando

When all players have chosen:
Navigate to Results Screen