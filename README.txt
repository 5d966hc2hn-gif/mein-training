MEIN TRAINING – PWA 1.0

ENTHALTEN
- Push/Pull/Beine-Plan mit deinen ursprünglichen Satzwerten als Referenz (keine erfundene historische Trainingseinheit)
- Satzweise Dokumentation von Gewicht, Wiederholungen, RIR, Aufbau-/Arbeitssatz, Dropsätzen
- Klimmzüge ohne Unterstützung oder mit frei benennbaren Bändern
- 4 Minuten Pause: Dips, Overhead Press, Klimmzüge, Kreuzheben, Squats
- 2 Minuten Pause: Trizepsdrücken, Hammer Curls
- 1 Minute Pause: Seitheben
- 3 Minuten Pause: Flys, Rudern, Reverse Butterfly
- Schonmodus, Schmerzbewertung pro Übung und Einheit, regelbasierte Hinweise
- Verlaufsgrafiken für e1RM, äußeres Trainingsvolumen, Maximallast, Schmerzen
- lokale Datenspeicherung, JSON-Export/Import, Offline-Cache

INSTALLATION AUF DEM IPHONE
1. Entpacke den Ordner auf deinem Mac.
2. Lade ALLE Dateien aus training-app in ein öffentliches GitHub-Pages-Repository oder einen anderen HTTPS-Host hoch.
3. Öffne die HTTPS-Adresse auf dem iPhone in Safari.
4. Tippe auf Teilen > Zum Home-Bildschirm > Hinzufügen.
5. Öffne die App über das neue Home-Bildschirm-Symbol.

Zum lokalen Test auf dem Mac (im entpackten Ordner):
  python3 -m http.server 8000
Dann im Browser http://localhost:8000 aufrufen.

WICHTIGE GRENZEN
- Reine HTML-Datei über file:// hat keinen installierbaren Offline-Service-Worker. Für iPhone-PWA HTTPS verwenden.
- iOS kann Töne, Timer und Benachrichtigungen im Hintergrund einschränken; ein gesperrtes iPhone wird nicht zuverlässig akustisch benachrichtigt.
- Daten liegen auf dem jeweiligen Gerät in der App-Website-Speicherung, nicht automatisch in iCloud. Regelmäßig JSON-Backup exportieren und extern sichern.
- Regelbasierte Hinweise sind keine KI-Cloud-Anbindung; für echte Chat-KI wäre ein separater Dienst erforderlich.
- Die e1RM-Berechnung gilt nur eingeschränkt bei Kabelzügen, Dips und Klimmzügen. Bandhilfe ist nicht als fester kg-Wert angesetzt.
- Benutze die App nicht als Ersatz für ärztliche Einschätzung bei Schmerzen.
