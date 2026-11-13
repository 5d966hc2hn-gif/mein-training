MEIN TRAINING – PWA 1.1

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


UPDATE VON VERSION 1.0 AUF 1.1
- Vorher auf dem iPhone unter Einstellungen ein JSON-Backup erstellen und in Dateien/iCloud Drive sichern.
- Alle Dateien aus dem Ordner training-app ins bestehende GitHub-Repository hochladen und gleichnamige Dateien überschreiben.
- Die App aktualisiert sich nach der Veröffentlichung; bei Bedarf komplett schließen und erneut öffnen.
- Bestehende lokale Einheiten bleiben unter derselben GitHub-Pages-Adresse erhalten. NICHT das Repository umbenennen.
- Push enthält jetzt zusätzlich 2 Sätze Seitheben, Pull behält 2 Sätze.
- Unter Einstellungen > KI-Coach kann ein lesbarer Bericht geteilt/kopiert oder als .txt exportiert werden.
- Der Bericht wird NICHT automatisch an ChatGPT gesendet; bitte im Chat einfügen oder hochladen.


UPDATE 1.2.0
- Einstellungen > Software-Updates > Auf Updates prüfen.
- Versionsnummer erscheint im Einstellungsbereich.
- Die App prüft beim Start auf neuere Versionen und lädt bei Bedarf neu.
- Der Offline-Cache ist versioniert und wird beim Worker-Wechsel aktualisiert.
- Daten bleiben im localStorage (KEY mein-training-v1), werden nicht durch das Update gelöscht.
- Vor dem Hochladen auf GitHub bitte JSON-Backup auf dem iPhone erstellen.
- Alle zehn Dateien AUS training-app ins Repository-Hauptverzeichnis laden.
- Einmalige Migration aus Version 1.1: die bisherige PWA muss zunächst die neu bereitgestellte Version laden; ggf. zuerst die Webseite in Safari aufrufen, danach installierte App neu starten.
