Use the existing mobile frames and create interactive prototype connections and flow logic for a multiplayer mobile game interface.

The app is a social deduction / strategy game played by multiple players.
The design is already created. Focus on interaction flow, navigation, and screen logic.

Mobile format: portrait (9:16).

Main Flow

Start at Welcome Screen.

Welcome Screen

Buttons:

Crear partida

Unirse

Interactions:

"Crear partida" → navigate to Lobby

"Unirse" → navigate to Join Game Screen

Join Game Screen

User enters game code.

Buttons:

Cancelar → return to Welcome Screen

Unirse → navigate to Lobby

Lobby Screen

Displays:

Player avatars

Game code

Add player button

Rules:

Minimum 3 players required

Only host can see Empezar partida

Interaction:

Empezar partida → navigate to Secret Mission Screen

Secret Mission Screen

Displays:

Player role (example: Adivino)

Mission card

Button:

Continuar → navigate to Countdown Screen

Countdown Screen

Text:
"La partida comenzará en 3 segundos"

After countdown → navigate to Secret Number Screen

Secret Number Screen

Displays:

Large number card

Text:
"Protege este número para ganar la partida"

Interaction:

Continue → Start Round

Round Flow

At the start of each round:

If player role = Adivino
→ show Draw Random Card Screen

Else
→ show Secret Number Screen

Players then:

Place card face down

See challenge screen

Enter negotiation phase (2 minutes)

Action Selection Screen

Players must choose one action:

Protect

Betray

Investigate

Negotiate

Each action opens a target player selection screen.

After choosing:
→ action is saved

Waiting Screen

Show:
"Esperando jugadores"

Condition:
When all players submitted actions
→ proceed to Round Resolution

Round Resolution

System resolves actions in order:

Resolve challenge

Apply protections

Apply betrayals

Resolve negotiations

Show investigation results

Update player lives

Personal Result Screen

Shows:

What happened in the round

Life updates

Elimination Check

If player lives = 0
→ show Player Eliminated

Else
→ player continues

Victory Conditions

Check after each round:

If Secret mission completed
→ Winner Screen

If Only 1 player alive
→ Winner Screen

Else
→ Start New Round

Prototype Requirements

Use:

Smart Animate transitions

Tap interactions for buttons

Simple state changes for actions

Overlay for player selection

Focus on creating a clear playable flow between all existing frames.