# QA-Testfälle: Kontaktformular Inline-Validierung + Telefonnummer-Feld

**Anforderung:** RQ071188 (restates RQ71098)  
**Erstellt am:** 2026-06-18  
**Status:** In Bearbeitung  

---

## Übersicht

Dieses Dokument listet alle TestCases auf, die für die clientseitige Inline-Validierung des Kontaktformulars (`#tuv-contact-form`, `kontakt.html`) erstellt wurden.  
Jeder TestCase ist per RelatedTo-Link mit Anforderung **RQ071188** verknüpft.

---

## Formularfelder

| data-testid | Label          | Pflicht | Validierungsregel            |
|-------------|----------------|---------|------------------------------|
| f-name      | Name           | ja      | nicht leer                   |
| f-email     | E-Mail         | ja      | E-Mail-Format                |
| f-subject   | Betreff        | ja      | nicht leer                   |
| f-message   | Nachricht      | ja      | nicht leer                   |
| f-phone     | Telefonnummer  | nein    | Telefonformat (nur wenn befüllt) |

---

## Testfälle

| TC-ID      | Titel                                                                 | Bereich                      |
|------------|-----------------------------------------------------------------------|------------------------------|
| TC071189   | Blur-Validierung – Pflichtfeld „Nachricht" bleibt leer               | Blur / Pflichtfeld           |
| TC071190   | Blur-Validierung – Pflichtfeld „Name" bleibt leer                    | Blur / Pflichtfeld           |
| TC071191   | E-Mail-Format-Validierung – ungültiges Format bei Blur               | E-Mail-Format                |
| TC071192   | Blur-Validierung – Pflichtfeld „E-Mail" bleibt leer                  | Blur / Pflichtfeld           |
| TC071193   | Submit blockiert – alle Pflichtfelder leer                           | Submit / Blockierung         |
| TC071194   | Erfolgreiches Absenden – alle Pflichtfelder korrekt ausgefüllt       | Happy Path                   |
| TC071195   | WCAG 2.2 AA – Tastaturnavigation und sichtbarer Fokusindikator       | Barrierefreiheit             |
| TC071196   | Telefonnummer – ungültiges Format bei Blur                           | Telefonformat / Optional     |
| TC071197   | Responsives Layout – Breakpoints 320 / 768 / 1024 / 1440 px         | Responsivität                |
| TC071198   | Blur-Validierung – Pflichtfeld „Betreff" bleibt leer                 | Blur / Pflichtfeld           |
| TC071199   | Fokus springt bei blockiertem Submit auf erstes ungültiges Feld      | Submit / Fokus               |
| TC071200   | Cross-Browser-Parität – Chromium / Firefox / WebKit                  | Cross-Browser                |
| TC071201   | aria-describedby und role="alert" – korrekte Verknüpfung             | ARIA / Barrierefreiheit      |
| TC071202   | Fehlermeldung verschwindet nach Korrektur des Felds                  | Validierungsstatus           |
| TC071203   | E-Mail-Format-Validierung – gültiges Format, kein Fehler             | E-Mail-Format                |
| TC071204   | Telefonnummer – leer lassen ist gültig (optionales Feld)             | Optional / Happy Path        |
| TC071205   | aria-invalid="true" wird bei ungültigem Feld gesetzt                 | ARIA / Barrierefreiheit      |

---

## Abdeckungsmatrix

| Anforderung                         | TC-IDs                                                                 |
|-------------------------------------|------------------------------------------------------------------------|
| Blur-Validierung Pflichtfelder      | TC071189, TC071190, TC071192, TC071198                                 |
| Submit blockiert + Fokus            | TC071193, TC071199                                                     |
| E-Mail-Format                       | TC071191, TC071203                                                     |
| Telefonnummer optional              | TC071196, TC071204                                                     |
| ARIA (aria-invalid, aria-describedby, role=alert) | TC071201, TC071205                                      |
| Fehlerstatus-Rücksetzung            | TC071202                                                               |
| Happy Path (Erfolgreich absenden)   | TC071194                                                               |
| WCAG 2.2 AA Tastatur                | TC071195                                                               |
| Responsivität                       | TC071197                                                               |
| Cross-Browser                       | TC071200                                                               |

---

## Constraints (aus Anforderung)

- Selektoren: ausschließlich `data-testid`, `role` und Label — keine CSS-Klassen oder XPath
- Exakte deutsche UI-Strings beibehalten (z. B. „Bitte geben Sie eine gültige E-Mail-Adresse ein.")
- Nur Sandbox/Preview-Umgebung — nie Production tuv.com
- WCAG 2.2 AA: Kontrastverhältnis ≥ 4.5:1, Tastatur-Bedienbarkeit, sichtbarer Fokus
